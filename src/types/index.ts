import { Database } from "@/integrations/supabase/types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Interest = Database["public"]["Tables"]["interests"]["Row"];
export type Match = Database["public"]["Tables"]["matches"]["Row"];

export interface ProfileWithInterests extends Profile {
  interests: Interest[];
}

export interface MatchWithProfile extends Match {
  profile: ProfileWithInterests;
}
