import * as Y from "yjs";

export function cleanDocName(name: string): string {
  return name.replace(/^collaboration\/?/, "").trim();
}

export function isValidYjsBase64(str: string | null | undefined): boolean {
  if (!str || typeof str !== "string") return false;
  const trimmed = str.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("<") || trimmed.startsWith("{") || trimmed.startsWith("[")) return false;
  if (!/^[A-Za-z0-9+/]+=*$/.test(trimmed)) return false;
  try {
    const buf = Buffer.from(trimmed, "base64");
    if (buf.length < 2) return false;
    const testDoc = new Y.Doc();
    Y.applyUpdate(testDoc, buf);
    return true;
  } catch {
    return false;
  }
}
