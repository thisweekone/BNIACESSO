export interface Match {
  id: string;
  memberName: string;
  similarity: number; // valor entre 0 e 1
  historicalSuccess: number; // valor entre 0 e 1
  commonTags: string[];
} 