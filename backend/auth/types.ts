export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  id: number;
  userId: number;
  type: 'billing' | 'shipping';
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
}

export interface AuthData {
  userID: string;
  email: string;
  firstName: string;
  lastName: string;
}
