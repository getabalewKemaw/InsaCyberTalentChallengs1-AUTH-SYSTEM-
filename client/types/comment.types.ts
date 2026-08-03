export interface Comment {
  id: string;
  documentId: string;
  userId: string;
  content: string;
  resolved: boolean;
  createdAt: string;
}
