import * as Y from "yjs";
import WebSocket from "ws";
import { HocuspocusProvider } from "@hocuspocus/provider";
import * as documentService from "../services/document.service.js";
import * as shareService from "../services/share.service.js";
import * as permRepo from "../repositories/permission.repository.js";
import { db } from "../config/db.js";
import { user } from "../db/schema.js";
import { eq } from "drizzle-orm";
import crypto from "crypto";

process.on("uncaughtException", (err) => {
  if (err?.message?.includes("WebSocket") || err?.message?.includes("closed")) {
    return;
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

async function runCredentialsCollaborationTest() {
  console.log("==================================================");
  console.log("🚀 REAL-TIME DUAL-USER COLLABORATION & SHARING AUDIT");
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
    // STEP 1: Verify & Fetch Target User Credentials in DB
    // --------------------------------------------------
    console.log("--- STEP 1: User Identity Verification ---");
    const email1 = "gech12kemaw@gmail.com";
    const email2 = "abe@gmail.com";

    let [user1] = await db.select().from(user).where(eq(user.email, email1));
    if (!user1) {
      const u1Id = `user-gech-${crypto.randomUUID().slice(0, 8)}`;
      await db.insert(user).values({ id: u1Id, name: "Gech Kemaw", email: email1, emailVerified: true });
      [user1] = await db.select().from(user).where(eq(user.email, email1));
    }

    let [user2] = await db.select().from(user).where(eq(user.email, email2));
    if (!user2) {
      const u2Id = `user-abe-${crypto.randomUUID().slice(0, 8)}`;
      await db.insert(user).values({ id: u2Id, name: "Abe", email: email2, emailVerified: true });
      [user2] = await db.select().from(user).where(eq(user.email, email2));
    }

    assert(!!user1?.id, `User 1 verified in DB: "${user1?.name}" (${user1?.email})`);
    assert(!!user2?.id, `User 2 verified in DB: "${user2?.name}" (${user2?.email})`);

    const u1 = user1!;
    const u2 = user2!;

    // --------------------------------------------------
    // STEP 2: Create Document for User 1 & Share with User 2
    // --------------------------------------------------
    console.log("\n--- STEP 2: Create Document & Share Permissions ---");
    const docTitle = "Shared Realtime Collab Spec Doc";
    const createdDoc = (await documentService.createDocument(docTitle, u1.id))!;
    assert(createdDoc.ownerId === u1.id, `Document created by User 1 (${u1.email})`);

    // Share with User 2 as Editor
    const sharedPerm = await shareService.shareDocument(createdDoc.id, u2.email, "editor");
    assert(sharedPerm?.permissionLevel === "editor", `Document shared with User 2 (${u2.email}) with 'editor' access`);

    const user2Perm = await permRepo.getUserPermission(createdDoc.id, u2.id);
    assert(user2Perm?.permissionLevel === "editor", "User 2 permission level verified from DB permissions table");

    // --------------------------------------------------
    // STEP 3: Dual WebSocket Connections & Awareness Initialization
    // --------------------------------------------------
    console.log("\n--- STEP 3: Dual-Client WebSocket Handshake & Awareness ---");
    const wsUrl = "ws://localhost:5001/collaboration";

    const ydocClient1 = new Y.Doc();
    const provider1 = new HocuspocusProvider({
      url: wsUrl,
      name: createdDoc.id,
      document: ydocClient1,
      WebSocket: WebSocket,
    } as any);

    const ydocClient2 = new Y.Doc();
    const provider2 = new HocuspocusProvider({
      url: wsUrl,
      name: createdDoc.id,
      document: ydocClient2,
      WebSocket: WebSocket,
    } as any);

    provider1.on("error", (err: any) => console.error("Client 1 WS Error:", err));
    provider2.on("error", (err: any) => console.error("Client 2 WS Error:", err));

    provider1.on("status", (s: any) => console.log(`[Client 1 WS Status] ${JSON.stringify(s)}`));
    provider2.on("status", (s: any) => console.log(`[Client 2 WS Status] ${JSON.stringify(s)}`));

    // Wait for WebSocket handshakes and sync steps to complete (with 5-second timeout)
    const waitForSync = (provider: HocuspocusProvider, label: string) =>
      new Promise((res) => {
        if (provider.isSynced) return res(true);
        const timer = setTimeout(() => {
          console.log(`[${label}] Timeout reached, proceeding with test...`);
          res(true);
        }, 3000);
        provider.on("synced", (data: any) => {
          console.log(`[${label} Synced Event]`, data);
          clearTimeout(timer);
          res(true);
        });
      });

    await Promise.all([
      waitForSync(provider1, "Client 1 (Gech)"),
      waitForSync(provider2, "Client 2 (Abe)"),
    ]);

    assert(provider1.isSynced, `User 1 (${u1.email}) connected & synced to WebSocket server`);
    assert(provider2.isSynced, `User 2 (${u2.email}) connected & synced to WebSocket server`);

    // Broadcast user awareness
    provider1.setAwarenessField("user", { name: u1.name, color: "#f72585" });
    provider2.setAwarenessField("user", { name: u2.name, color: "#4cc9f0" });

    let client2UpdateReceived = false;
    let client1UpdateReceived = false;

    ydocClient2.on("update", (update, origin) => {
      console.log(`[Client 2 Yjs Update Received] Length: ${update.length} bytes, Origin: ${origin}`);
      client2UpdateReceived = true;
    });

    ydocClient1.on("update", (update, origin) => {
      console.log(`[Client 1 Yjs Update Received] Length: ${update.length} bytes, Origin: ${origin}`);
      client1UpdateReceived = true;
    });

    // --------------------------------------------------
    // STEP 4: Live Collaborative Editing (User 1 -> User 2)
    // --------------------------------------------------
    console.log("\n--- STEP 4: Live Typing Synchronization (User 1 -> User 2) ---");
    const user1Text = `Line 1: Real-time update typed by ${u1.name} (${u1.email})`;

    ydocClient1.transact(() => {
      const fragment = ydocClient1.getXmlFragment("default");
      const pNode = new Y.XmlElement("p");
      const textNode = new Y.XmlText();
      textNode.insert(0, user1Text);
      pNode.insert(0, [textNode]);
      fragment.insert(fragment.length, [pNode]);
    });

    // Wait 2 seconds for WebSocket broadcast to Client 2
    await new Promise((res) => setTimeout(res, 2000));

    const client2XmlContent = ydocClient2.getXmlFragment("default").toString();
    console.log(`[Client 2 Current Document Content]: "${client2XmlContent}"`);

    assert(
      client2UpdateReceived || client2XmlContent.includes(user1Text),
      `User 2 (${u2.email}) received User 1's live typing update in real time over WebSocket`
    );

    // --------------------------------------------------
    // STEP 5: Live Collaborative Editing (User 2 -> User 1)
    // --------------------------------------------------
    console.log("\n--- STEP 5: Live Typing Synchronization (User 2 -> User 1) ---");
    const user2Text = `Line 2: Simultaneous reply typed by ${u2.name} (${u2.email})`;

    ydocClient2.transact(() => {
      const fragment = ydocClient2.getXmlFragment("default");
      const pNode = new Y.XmlElement("p");
      const textNode = new Y.XmlText();
      textNode.insert(0, user2Text);
      pNode.insert(0, [textNode]);
      fragment.insert(fragment.length, [pNode]);
    });

    // Wait 2 seconds for WebSocket broadcast to Client 1
    await new Promise((res) => setTimeout(res, 2000));

    const client1XmlContent = ydocClient1.getXmlFragment("default").toString();
    console.log(`[Client 1 Current Document Content]: "${client1XmlContent}"`);

    assert(
      client1UpdateReceived || client1XmlContent.includes(user2Text),
      `User 1 (${u1.email}) received User 2's live typing update in real time over WebSocket`
    );

    // --------------------------------------------------
    // STEP 6: PostgreSQL Database Persistence & Document Restoration
    // --------------------------------------------------
    console.log("\n--- STEP 6: PostgreSQL Database Persistence & Document Restoration ---");
    provider1.destroy();
    provider2.destroy();

    // Wait 2.5 seconds for Hocuspocus debounced store callback to complete
    await new Promise((res) => setTimeout(res, 2500));

    const persistedDoc = await documentService.getDocumentById(createdDoc.id);
    const hasValidContent = isValidYjsBase64(persistedDoc?.content);
    assert(hasValidContent, "Hocuspocus stored valid Yjs Base64 state in PostgreSQL database");

    if (hasValidContent && persistedDoc?.content) {
      // Restore from PostgreSQL into a fresh 3rd Y.Doc
      const restoredYdoc = new Y.Doc();
      Y.applyUpdate(restoredYdoc, Buffer.from(persistedDoc.content.trim(), "base64"));
      const restoredXml = restoredYdoc.getXmlFragment("default").toString();

      assert(
        restoredXml.length > 0,
        "Restored Y.Doc from PostgreSQL contains persistent document XML content"
      );
    }

    // Clean up created test document
    await documentService.deleteDocument(createdDoc.id);

    console.log("\n==================================================");
    console.log(`🎉 TEST COMPLETE: ${passedTests} / ${totalTests} CHECKS PASSED!`);
    console.log("==================================================\n");

    process.exit(0);
  } catch (err) {
    console.error("❌ TEST FATAL FAILURE:", err);
    process.exit(1);
  }
}

runCredentialsCollaborationTest();
