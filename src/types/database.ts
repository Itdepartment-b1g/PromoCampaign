// TypeScript types for Supabase tables
export interface Influencer {
  id: string;
  first_name: string;
  last_name: string;
  code: string;
  points: number;
  age: number | null;
  sex: string | null;
  location: string | null;
  consumer_count: number;
  password: string | null;
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

export interface Consumer {
  id: string;
  first_name: string;
  last_name: string;
  age: number | null;
  sex: string | null;
  location: string | null;
  redeemed_codes_count: number;
  password: string | null;
  created_at: string;
}

export interface Redemption {
  id: string;
  influencer_id: string;
  product_code_id: string;
  consumer_id: string | null;
  consumer_info: any | null;
  redeemed_at: string;
}

