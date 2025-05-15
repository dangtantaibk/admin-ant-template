export interface Comment {
  id: number;
  postId: string;
  parentId?: number;
  authorName: string;
  authorEmail: string;
  content: string;
  status: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentFormData {
  postId: string;
  parentId?: number;
  authorName: string;
  authorEmail: string;
  content: string;
  status: string;
}
