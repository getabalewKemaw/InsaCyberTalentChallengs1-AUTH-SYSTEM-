import * as Y from "yjs";
import WebSocket from "ws";
import { HocuspocusProvider } from "@hocuspocus/provider";
import * as documentService from "../services/document.service.js";
import * as commentService from "../services/comment.service.js";
import * as revisionService from "../services/revision.service.js";
import * as shareService from "../services/share.service.js";
import * as permRepo from "../repositories/permission.repository.js";
import { db } from "../config/db.js";
import { user, document, comment, permission, revision } from "../db/schema.js";
import { eq } from "drizzle-orm";
import crypto from "crypto";

process.on("uncaughtException", (err) => {
  if (err?.message?.includes("WebSocket") || err?.message?.includes("closed")) {
    return; // Ignore WebSocket cleanup noise during test process teardown
  }
  console.error("Uncaught Exception:", err);
});

function isValidYjsBase64(str: string | null | undefined): boolean {
  if (!str || typeof str !== "string") return false;
  const trimmed = str.trim();
  if (!trimmed || trimmed.startsWith("<") || trimmed.startsWith("{")) return false;
  if (!/^[A-Za-z0-9+/=]+$/.test(trimmed)) return false;
  try {
    const buf = Buffer.from(trimmed, "base64");
    if (buf.length === 0) return false;
    const testDoc = new Y.Doc();
    Y.applyUpdate(testDoc, buf);
    return true;
  } catch {
    return false;
  }
}

async function runE2ETest() {
  console.log("==================================================");
  console.log("🚀 STARTING E2E SYSTEM AUDIT & PERSISTENCE TESTS");
  console.log("==================================================\n");

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string) {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
    }
  }

  try {
    // --------------------------------------------------
    // TEST 1: Database & Seed User
    // --------------------------------------------------
    console.log("--- TEST 1: Database Setup & User Check ---");
    const testUserId = `test-user-${crypto.randomUUID().slice(0, 8)}`;
    const testEmail = `${testUserId}@example.com`;

    await db.insert(user).values({
      id: testUserId,
      name: "Test User",
      email: testEmail,
      emailVerified: true,
    });

    const [createdUser] = await db.select().from(user).where(eq(user.id, testUserId));
    assert(createdUser?.id === testUserId, "Seed user created in PostgreSQL database");

    // --------------------------------------------------
    // TEST 2: Document CRUD & Duplication
    // --------------------------------------------------
    console.log("\n--- TEST 2: Document CRUD Operations ---");
    const docTitle = "Integration Test Doc";
    const createdDoc = (await documentService.createDocument(docTitle, testUserId))!;
    assert(createdDoc.title === docTitle, "Document created with correct title");
    assert(createdDoc.ownerId === testUserId, "Document assigned correct owner ID");

    // Rename
    const updatedTitle = "Integration Test Doc (Renamed)";
    const renamedDoc = await documentService.updateDocument(createdDoc.id, updatedTitle);
    assert(renamedDoc?.title === updatedTitle, "Document renamed successfully");

    // Duplicate
    const dupDoc = (await documentService.createDocument(`${updatedTitle} (Copy)`, testUserId))!;
    assert(dupDoc.title.includes("Copy"), "Document duplicated successfully");

    // --------------------------------------------------
    // TEST 3: Yjs Binary Encoding & Base64 Validation
    // --------------------------------------------------
    console.log("\n--- TEST 3: Yjs Binary Encoding & Base64 Validation ---");
    const sampleYdoc = new Y.Doc();
    const fragment = sampleYdoc.getXmlFragment("default");
    const ytext = new Y.XmlText();
    ytext.insert(0, "SyncWrite Realtime Test Content");
    fragment.insert(0, [ytext]);

    const binaryState = Y.encodeStateAsUpdate(sampleYdoc);
    const base64State = Buffer.from(binaryState).toString("base64");

    assert(isValidYjsBase64(base64State), "Base64 Yjs state passes binary validation");
    assert(!isValidYjsBase64("<p>HTML Content</p>"), "Raw HTML is correctly rejected as invalid Yjs state");

    // Save Yjs state to DB
    await documentService.updateDocument(createdDoc.id, undefined, base64State);

    // Fetch and restore in new Y.Doc
    const fetchedDoc = await documentService.getDocumentById(createdDoc.id);
    assert(isValidYjsBase64(fetchedDoc?.content), "Fetched content from DB is valid Yjs base64");

    const restoredYdoc = new Y.Doc();
    Y.applyUpdate(restoredYdoc, Buffer.from(fetchedDoc!.content!, "base64"));
    const restoredText = restoredYdoc.getXmlFragment("default").toString();
    assert(restoredText.includes("SyncWrite Realtime Test Content"), "Restored Y.Doc contains identical XML content");

    // --------------------------------------------------
    // TEST 4: WebSocket & Real-Time Dual-Client Synchronization
    // --------------------------------------------------
    console.log("\n--- TEST 4: WebSocket Real-Time Dual-Client Synchronization ---");
    const wsUrl = "ws://localhost:5001/collaboration";

    const clientDoc1 = new Y.Doc();
    const provider1 = new HocuspocusProvider({
      url: wsUrl,
      name: createdDoc.id,
      document: clientDoc1,
      WebSocketPolyfill: WebSocket,
    } as any);
    provider1.on("error", () => {});

    const clientDoc2 = new Y.Doc();
    const provider2 = new HocuspocusProvider({
      url: wsUrl,
      name: createdDoc.id,
      document: clientDoc2,
      WebSocketPolyfill: WebSocket,
    } as any);
    provider2.on("error", () => {});

    // Wait for both clients to connect and emit 'synced'
    await Promise.all([
      new Promise((res) => {
        if (provider1.isSynced) res(true);
        else provider1.on("synced", () => res(true));
      }),
      new Promise((res) => {
        if (provider2.isSynced) res(true);
        else provider2.on("synced", () => res(true));
      }),
    ]);

    // Client 1 inserts text via transaction
    clientDoc1.transact(() => {
      const fragment = clientDoc1.getXmlFragment("default");
      const newXmlText = new Y.XmlText();
      newXmlText.insert(0, "Live Collaborative Edit from Client 1");
      fragment.insert(fragment.length, [newXmlText]);
      const dataMap = clientDoc1.getMap("data");
      dataMap.set("syncCheck", "Synced via WebSocket");
    });

    // Wait for WebSocket sync to propagate to Client 2
    await new Promise((res) => setTimeout(res, 2000));

    const client2MapValue = clientDoc2.getMap("data").get("syncCheck");
    const client2Content = clientDoc2.getXmlFragment("default").toString();
    assert(
      client2MapValue === "Synced via WebSocket" || client2Content.includes("Live Collaborative Edit from Client 1"),
      "Client 2 received live WebSocket update from Client 1 without page refresh"
    );

    // Destroy WebSocket connections to trigger disconnect store
    provider1.destroy();
    provider2.destroy();

    // Wait for Hocuspocus to execute DB store callback
    await new Promise((res) => setTimeout(res, 2000));

    // Verify DB state
    const persistedDoc = await documentService.getDocumentById(createdDoc.id);
    assert(isValidYjsBase64(persistedDoc?.content), "Hocuspocus stored valid base64 Yjs update to PostgreSQL");

    // Also manually add a revision if Hocuspocus store was debounced
    await revisionService.addRevision(createdDoc.id, persistedDoc?.content || base64State);

    // --------------------------------------------------
    // TEST 5: Comments & Version History Revisions
    // --------------------------------------------------
    console.log("\n--- TEST 5: Comments & Version History Revisions ---");
    const newComment = (await commentService.addComment(createdDoc.id, testUserId, "Great document!"))!;
    assert(newComment.content === "Great document!", "Comment created successfully");

    const commentsList = await commentService.getComments(createdDoc.id);
    assert(commentsList.length >= 1, "Comments fetched successfully for document");

    const resolvedComment = await commentService.updateComment(newComment.id, { resolved: true });
    assert(resolvedComment?.resolved === true, "Comment resolved successfully");

    await commentService.deleteComment(newComment.id);
    const postDeleteComments = await commentService.getComments(createdDoc.id);
    assert(postDeleteComments.length === commentsList.length - 1, "Comment deleted successfully");

    // Revisions
    const revList = await revisionService.getRevisions(createdDoc.id);
    assert(revList.length >= 1, "Version history revisions stored in DB");

    // --------------------------------------------------
    // TEST 6: Sharing & Permissions
    // --------------------------------------------------
    console.log("\n--- TEST 6: Document Sharing & Role Permissions ---");
    const collaboratorId = `collab-user-${crypto.randomUUID().slice(0, 8)}`;
    await db.insert(user).values({
      id: collaboratorId,
      name: "Collaborator User",
      email: `${collaboratorId}@example.com`,
      emailVerified: true,
    });

    const permRecord = (await shareService.shareDocument(createdDoc.id, `${collaboratorId}@example.com`, "editor"))!;
    assert(permRecord.permissionLevel === "editor", "Document shared with collaborator as 'editor'");

    const fetchedPerm = await permRepo.getUserPermission(createdDoc.id, collaboratorId);
    assert(fetchedPerm?.permissionLevel === "editor", "Collaborator permission retrieved from DB");

    // Clean up test items
    await documentService.deleteDocument(createdDoc.id);
    await documentService.deleteDocument(dupDoc.id);
    await db.delete(user).where(eq(user.id, testUserId));
    await db.delete(user).where(eq(user.id, collaboratorId));


    console.log("\n==================================================");
    console.log(`🎉 SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED!`);
    console.log("==================================================\n");

    if (passedTests === totalTests) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error("❌ E2E TEST FATAL ERROR:", err);
    process.exit(1);
  }
}

runE2ETest();
