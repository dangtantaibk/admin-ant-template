export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  roles: Role[];
  createdAt: string;
  updatedAt: string;
}
