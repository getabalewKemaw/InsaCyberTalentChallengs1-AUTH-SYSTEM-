export interface Comment {
  id: string;
  documentId: string;
  userId: string;
  content: string;
  resolved: boolean;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  } | null;
}
