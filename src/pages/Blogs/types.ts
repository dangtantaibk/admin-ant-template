export interface Blog {
  id?: string;
  business: string;
  title: string;
  description: string;
  content: string;
  image: string;
  date: string;
  author: string;
  slug: string;
  category: string;
  readTime: string;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogFormValues {
  business: string;
  title: string;
  description: string;
  content: string;
  image: string;
  date: string;
  author: string;
  slug: string;
  category: string;
  readTime: string;
  tags: string[];
}
