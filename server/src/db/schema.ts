import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index } from "drizzle-orm/pg-core";
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const loginActivity = pgTable(
  "login_activity",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    status: text("status").notNull(), // 'SUCCESS' | 'FAILED' | 'SUSPICIOUS'
    reason: text("reason"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("login_activity_userId_idx").on(table.userId),
    index("login_activity_createdAt_idx").on(table.createdAt),
  ]
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  loginActivities: many(loginActivity),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const loginActivityRelations = relations(loginActivity, ({ one }) => ({
  user: one(user, {
    fields: [loginActivity.userId],
    references: [user.id],
  }),
}));

export const jwks = pgTable("jwks", {
  id: text("id").primaryKey(),
  publicKey: text("public_key").notNull(),
  privateKey: text("private_key").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export const document = pgTable("document", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  ownerId: text("owner_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  content: text("content"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});

export const permission = pgTable("permission", {
  id: text("id").primaryKey(),
  documentId: text("document_id").notNull().references(() => document.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  permissionLevel: text("permission_level").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const comment = pgTable("comment", {
  id: text("id").primaryKey(),
  documentId: text("document_id").notNull().references(() => document.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  resolved: boolean("resolved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});

export const revision = pgTable("revision", {
  id: text("id").primaryKey(),
  documentId: text("document_id").notNull().references(() => document.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  name: text("name"),
  content: text("content").notNull(),
  isAutoSave: boolean("is_auto_save").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const documentRelations = relations(document, ({ one, many }) => ({
  owner: one(user, {
    fields: [document.ownerId],
    references: [user.id],
  }),
  permissions: many(permission),
  comments: many(comment),
  revisions: many(revision),
}));

export const permissionRelations = relations(permission, ({ one }) => ({
  document: one(document, {
    fields: [permission.documentId],
    references: [document.id],
  }),
  user: one(user, {
    fields: [permission.userId],
    references: [user.id],
  }),
}));

export const commentRelations = relations(comment, ({ one }) => ({
  document: one(document, {
    fields: [comment.documentId],
    references: [document.id],
  }),
  user: one(user, {
    fields: [comment.userId],
    references: [user.id],
  }),
}));

export const revisionRelations = relations(revision, ({ one }) => ({
  document: one(document, {
    fields: [revision.documentId],
    references: [document.id],
  }),
  user: one(user, {
    fields: [revision.userId],
    references: [user.id],
  }),
}));
