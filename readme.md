# SyncWrite — Real-Time Collaborative Document Editor

![SyncWrite Hero](./hero.png)

> **SyncWrite** is a modern, high-performance, production-ready real-time collaborative document editor (built for the 72-Hour Individual Developer Challenge). It supports instant multi-user editing, conflict-free data synchronization via CRDTs, live cursor tracking, presence badges, granular permission levels, auto-saving, version history, comments, and document exports.

---

## ⚡ Key Features

- 🔄 **Real-Time Collaboration**: Powered by **Yjs CRDT** and **Hocuspocus WebSocket Server** (`ws://localhost:5001/collaboration`). Guarantees 100% mathematical convergence without state divergence or editing conflicts.
- 👥 **Presence & Live Cursors**: Floating carets with color-coded user name flags and text selection highlighting (`@tiptap/y-tiptap`).
- 🔐 **Authentication & Security**: Email/password authentication, session management, and rate limiting powered by **Better Auth**.
- 🛡️ **Role-Based Permission Levels**:
  - **Owner**: Full access, deletion, sharing, and content editing.
  - **Editor**: Real-time text editing, title updates, and comment creation.
  - **Commenter**: Read-only text canvas with active comment submission and resolution.
  - **Viewer**: Read-only document viewing and live presence synchronization.
- 💾 **Automatic Cloud Persistence**: Auto-saves Yjs binary document state to PostgreSQL with debouncing (2s) and fallback indicators (`Saving...`, `Saved to cloud`, `Saved offline`).
- 📜 **Version History & Restore**: Revisions captured on save snapshots with one-click restoration.
- 💬 **Comments & Resolution**: Post comments, resolve items, and delete user comments.
- 📑 **Export Options**: Export document to **PDF** (via dedicated clean print window) and **Markdown** (`.md` syntax conversion).
- 🔍 **Document Management & Search**: Dashboard featuring Owned documents, Shared documents, Recent items, duplicate/delete actions, and real-time title search.

---

## 🛠️ Tech Stack & Tools Used

### **Frontend**
- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) & [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & Vanilla CSS Tokens
- **Editor Core**: [Tiptap v3](https://tiptap.dev/) (`StarterKit`, `Link`, `Underline`, `TextAlign`, `@tiptap/extension-collaboration`, `@tiptap/y-tiptap`)
- **Real-Time Sync Client**: `@hocuspocus/provider` & `yjs`
- **Authentication Client**: `better-auth/react`
- **Icons**: `lucide-react`

### **Backend**
- **Runtime & Server**: [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
- **Real-Time WebSocket Server**: `@hocuspocus/server` & `@hocuspocus/extension-database`
- **Database ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Database**: PostgreSQL
- **CRDT Engine**: [Yjs](https://yjs.dev/) (Y.Doc)
- **Validation**: `zod`

---

## 🚀 Setup & Installation Instructions

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **PostgreSQL Database**: Running PostgreSQL instance

---

### 1. Clone & Project Structure
```bash
c:\Users\Hp\Desktop\INSACHELLENGE1
├── client/         # Next.js 16 Frontend Application
├── server/         # Express & Hocuspocus WebSocket Server
├── hero.png        # Application Demonstration Hero Banner
└── README.md       # Documentation & Setup Guide
```

---

### 2. Backend Setup (`server`)

1. **Navigate to the server directory**:
   ```bash
   cd server
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file inside `server/`:
   ```env
   PORT=5001
   CLIENT_URL=http://localhost:3000
   DATABASE_URL=postgres://postgres:your_password@localhost:5432/syncwrite
   BETTER_AUTH_SECRET=your_secret_key_here
   BETTER_AUTH_URL=http://localhost:5001
   ```

4. **Run Database Migrations**:
   ```bash
   npm run db:push
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```
   *Backend HTTP Server runs at `http://localhost:5001` and WebSocket at `ws://localhost:5001/collaboration`.*

---

### 3. Frontend Setup (`client`)

1. **Navigate to the client directory**:
   ```bash
   cd client
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file inside `client/`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5001
   NEXT_PUBLIC_WS_URL=ws://localhost:5001/collaboration
   ```

4. **Start Next.js Development Server**:
   ```bash
   npm run dev
   ```
   *Frontend Application runs at `http://localhost:3000`.*

---

## 📊 Database Schema (`Drizzle ORM`)

The application schema (`server/src/db/schema.ts`) consists of:

- **`user`**: Stores user authentication profiles (`id`, `email`, `name`, `image`, timestamps).
- **`session`**: Active user auth sessions managed by Better Auth.
- **`document`**: Stores document metadata (`id`, `title`, `ownerId`, `content` [Base64 Yjs binary state], `createdAt`, `updatedAt`).
- **`documentPermission`**: Granular access control (`documentId`, `userId`, `permissionLevel`: `viewer` | `commenter` | `editor`).
- **`comment`**: Document comments and resolution state (`id`, `documentId`, `userId`, `content`, `resolved`, `createdAt`).
- **`revision`**: Historical document content snapshots (`id`, `documentId`, `content`, `createdAt`).

---

## 📡 API Endpoint Overview

### **Authentication** (`/api/auth`)
- `POST /api/auth/sign-up/email`: Register new account.
- `POST /api/auth/sign-in/email`: Sign in user.
- `POST /api/auth/sign-out`: Logout current session.

### **Documents** (`/api/v1/documents`)
- `GET /api/v1/documents`: List user owned & shared documents.
- `GET /api/v1/documents/:id`: Fetch document metadata & `userPermission`.
- `POST /api/v1/documents`: Create a new document.
- `PATCH /api/v1/documents/:id`: Rename or update document content (Requires Editor/Owner permission).
- `DELETE /api/v1/documents/:id`: Delete document (Owner only).
- `POST /api/v1/documents/:id/share`: Share document with user email and assign permission (`viewer`, `commenter`, `editor`).
- `POST /api/v1/documents/:id/duplicate`: Duplicate document.

### **Comments & Revisions**
- `GET /api/v1/documents/:id/comments`: Fetch document comments.
- `POST /api/v1/documents/:id/comments`: Post a comment (Requires Commenter/Editor/Owner permission).
- `PATCH /api/v1/documents/comments/:commentId`: Resolve or update comment.
- `DELETE /api/v1/documents/comments/:commentId`: Delete comment.
- `GET /api/v1/documents/:id/revisions`: Fetch document version history.
- `POST /api/v1/documents/:id/revisions/:revId/restore`: Restore historical version.

---

## 📄 License

Distributed under the MIT License. Built for the SyncWrite Individual Developer Challenge.
