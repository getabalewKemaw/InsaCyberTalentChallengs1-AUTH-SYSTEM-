export interface Revision {
  id: string;
  documentId: string;
  userId?: string | null;
  name?: string | null;
  content: string;
  isAutoSave: boolean;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  } | null;
}
