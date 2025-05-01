// General Pagination Response Type
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Basic Entity Type (example)
export interface BaseEntity {
  id: number | string;
  createdAt: string; // Assuming ISO date string
  updatedAt?: string;
}

// Order Type
export interface Order extends BaseEntity {
  name: string;
  phone: string;
  notes?: string;
  productId?: number | string; // Optional product ID
  // Add other order-specific fields if needed
}

// Subscription Type
export interface Subscription extends BaseEntity {
  email: string;
  // Add other subscription-specific fields if needed
}

// Product Type
export interface Product extends BaseEntity {
  name: string;
  price: number;
  category: string;
  description?: string;
  imageUrl?: string;
  // Add other product-specific fields if needed
}

// Blog Post Type
export interface BlogPost extends BaseEntity {
  title: string;
  content: string;
  author: string;
  category: string;
  slug: string;
  imageUrl?: string;
  // Add other blog post-specific fields if needed
}

// Type for Table params (pagination, filters, sorter)
export interface TableParams {
  pagination?: {
    current?: number;
    pageSize?: number;
    total?: number; // Add total count
  };
  sortField?: string;
  sortOrder?: 'ascend' | 'descend' | null;
  filters?: Record<string, React.Key[] | null>; // Use React.Key instead of React.ReactText
}
