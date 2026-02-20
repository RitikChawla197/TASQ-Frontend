export interface User {
  id: string;
  name: string;
}

// Kept for backward compatibility. User lists are now loaded from API.
export const USERS: User[] = [];
  
