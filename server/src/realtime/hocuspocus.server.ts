import { Hocuspocus } from "@hocuspocus/server";
import { Database } from "@hocuspocus/extension-database";
import * as documentService from "../services/document.service.js";
import * as revisionService from "../services/revision.service.js";
import { cleanDocName, isValidYjsBase64 } from "../utils/yjs.utils.js";

export const hocuspocusServer = new Hocuspocus({
  name: "syncwrite-hocuspocus",
  debounce: 2000,

  async onConnect(data) {
    console.log(`[Hocuspocus] - Client connected to document: "${cleanDocName(data.documentName)}"`);
  },

  async onDisconnect(data) {
    console.log(`[Hocuspocus] - Client disconnected from document: "${cleanDocName(data.documentName)}"`);
  },

  extensions: [
    new Database({
      fetch: async ({ documentName }) => {
        const id = cleanDocName(documentName);
        console.log(`[Hocuspocus] - Loading document "${id}" from database…`);
        try {
          const doc = await documentService.getDocumentById(id);
          if (doc?.content && isValidYjsBase64(doc.content)) {
            const buf = Buffer.from(doc.content.trim(), "base64");
            console.log(`[Hocuspocus] - Loaded ${buf.length} bytes for document "${id}"`);
            return buf;
          }
        } catch (err) {
          console.error(`[Hocuspocus] - DB fetch error for "${id}":`, err);
        }
        console.log(`[Hocuspocus] - Fresh document "${id}" (no prior state)`);
        return null;
      },

      store: async ({ documentName, state }) => {
        const id = cleanDocName(documentName);
        try {
          const content = Buffer.from(state).toString("base64");
          await documentService.updateDocument(id, undefined, content);
          await revisionService.addAutoSaveRevision(id, content);
          console.log(`[Hocuspocus] - Saved ${state.length} bytes for document "${id}"`);
        } catch (err) {
          console.error(`[Hocuspocus] - DB store error for "${id}":`, err);
        }
      },
    }),
  ],
});
