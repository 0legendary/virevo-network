export interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'super_admin';
}
