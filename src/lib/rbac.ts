export type UserRole = 'admin' | 'sales_executive';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  telegramUsername?: string;
  telegramChatId?: string;
}

export function canAccessFinance(role?: string): boolean {
  return role === 'admin';
}

export function canManageTeam(role?: string): boolean {
  return role === 'admin';
}

export function canManageSettings(role?: string): boolean {
  return role === 'admin';
}

export function canModifyLeads(role?: string): boolean {
  return role === 'admin' || role === 'sales_executive';
}

export function requireRole(userRole: string | undefined, ...allowedRoles: UserRole[]): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole as UserRole);
}
