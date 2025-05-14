export interface Reference {
  id: string;
  title: string;
  description: string;
  tags: string;
  created_at: string;
  user_email: string;
  status: 'open' | 'pending' | 'completed' | 'rejected';
  target_member_id?: string;
  original_request_id?: string;
  completed_at?: string;
  value?: number;
}

export interface MatchSuggestion {
  member_id: string;
  member_name: string;
  member_email: string;
  match_score: number;
  matching_tags: string[];
  history_score: number;
  cached: boolean;
}

export interface ReferenceMatch {
  request_id: string;
  user_email: string;
  title: string;
  description: string;
  tags: string;
  created_at: string;
  match_score: number;
  matching_tags: string[];
  user_info?: {
    name: string;
    avatar_url?: string;
    company?: string;
    role?: string;
  };
}

export interface MemberStats {
  references_given: number;
  references_received: number;
  success_rate: number;
  avg_value: number;
  total_value: number;
  unique_connections: number;
}

export interface ReferenceFilters {
  status?: string[];
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  valueRange?: {
    min: number;
    max: number;
  };
} 