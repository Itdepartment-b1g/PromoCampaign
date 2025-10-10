// TypeScript types for Supabase tables
export interface Influencer {
  id: string;
  first_name: string;
  last_name: string;
  code: string;
  points: number;
  created_at: string;
}

export interface ProductCode {
  id: string;
  code: string;
  is_used: boolean;
  used_by_influencer_id: string | null;
  used_at: string | null;
  created_at: string;
}

export interface Redemption {
  id: string;
  influencer_id: string;
  product_code_id: string;
  redeemed_at: string;
}

