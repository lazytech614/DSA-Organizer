export interface PlatformStats {
  totalSolved?: number;
  easySolved?: number;
  mediumSolved?: number;
  hardSolved?: number;
  rating?: number;
  maxRating?: number;
  contests?: number;
  rank?: number;
  
  // Platform-specific fields
  platform?: string;
  codingScore?: number;
  currentStreak?: number;
  institution?: string;
  countryRank?: number;
  stars?: string;
  division?: string;
  
  // Verification fields
  bio?: string;
  about?: string;
  description?: string;
  
  // Nested platform-specific data
  leetcode?: {
    ranking?: number;
    reputation?: number;
    contributionPoints?: number;
  };
  
  codeforces?: {
    handle?: string;
    maxRank?: string;
    currentRank?: string;
  };
  
  geeksforgeeks?: {
    institution?: string;
    streak?: number;
    overallScore?: number;
  };
  
  codechef?: {
    division?: string;
    stars?: string;
    globalRank?: number;
    countryRank?: number;
  };
  
  [key: string]: any;
}
