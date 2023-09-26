export interface Response {
  success: boolean;
  data?: any;
  message?: string;
}

export interface Model {
  id?: string;
  name: string;
  source: string;
  description?: string;
  url_docs?: string;
  categories: any[];
  is_active: boolean;
  kind: string | any;
  extra_params?: any;
}

export interface ModelCategory {
  id?: string;
  name: string;
  description?: string;
}

export interface User {
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  phone?: string;
  is_active: boolean;
}
