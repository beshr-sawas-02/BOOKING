// نوع المستخدم العادي (من JWT)
export interface CurrentUserType {
  user_id: string;
  email: string;
  full_name: string;
  phone_number: string | null;
  email_verified: boolean;
  created_at: Date;
  updated_at: Date;
  role: 'user';
}

// نوع الأدمن (من JWT)
export interface CurrentAdminType {
  admin_id: string;
  email: string;
  full_name: string;
  role: 'admin';
  last_login: Date | null;
  created_at: Date;
}

// نوع مشترك (أي واحد منهم)
export type CurrentUserOrAdmin = CurrentUserType | CurrentAdminType;
