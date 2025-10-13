// types.ts
import { User } from '@supabase/supabase-js';

export interface AppUser {
  id?: string;          // ✅ add this line
  name?: string;
  email?: string;
  mobile?: string;
  address?: string;
}

