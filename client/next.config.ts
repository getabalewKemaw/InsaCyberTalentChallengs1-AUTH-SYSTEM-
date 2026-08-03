import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  // Alias "yjs" and "y-prosemirror" to single file entrypoints.
  // This prevents dual-package instance hazards where ySyncPluginKey in
  // @tiptap/extension-collaboration and @tiptap/extension-collaboration-cursor
  // resolve from different module bundles, fixing the crash:
  // "Cannot read properties of undefined (reading 'doc')"
  turbopack: {
    resolveAlias: {
      yjs: "yjs/dist/yjs.mjs",
      "y-prosemirror": "y-prosemirror/dist/y-prosemirror.cjs",
    },
  },
};

export default nextConfig;
