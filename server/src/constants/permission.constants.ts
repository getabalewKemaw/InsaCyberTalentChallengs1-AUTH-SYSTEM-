export enum PermissionLevel {
  OWNER = "owner",
  EDITOR = "editor",
  COMMENTER = "commenter",
  VIEWER = "viewer",
}

export type PermissionLevelType = `${PermissionLevel}`;
