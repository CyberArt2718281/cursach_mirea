export interface User {
  _id?: string;
  username: string;
  email: string;
  role: 'admin' | 'organizer' | 'user';
  profile?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    organization?: string;
    position?: string;
    avatar?: string;
  };
  isActive: boolean;
  lastLogin?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  registrations?: any[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}
