export interface IUserObject {
  id?: string;
  name: string;
  email: string;
  password: string;
  client: string;
  role?: string;
  claims?: Record<string, Record<string, any>>;
}
