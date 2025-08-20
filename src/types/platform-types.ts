import { JsonObject } from "@prisma/client/runtime/library";

export interface PlatformStats {
  totalSolved?: number;
  easySolved?: number;
  mediumSolved?: number;
  hardSolved?: number;
  rating?: number;
  maxRating?: number;
  contests?: number;
  rank?: number;
  friends?: number;
  contribution?: number;
  lastThreeRanks?: number[];
  ratingChange?: number;
  reputation?: number;
  title?: string;

  ratingWiseCount?: {
    below1000?: number;
    range1000to1199?: number;
    range1200to1399?: number;
    range1400to1599?: number;
    range1600to1799?: number;
    range1800to1999?: number;
    range2000to2199?: number;
    range2200to2399?: number;
    range2400to2599?: number;
    range2600to2799?: number;
    range2800to2999?: number;
    above3000?: number;
    unrated?: number; 
  };
  
  [key: string]: any;
}

export interface RatingChange extends JsonObject {
  contestId: number;
  contestName: string;
  handle: string;
  rank: number;
  ratingUpdateTimeSeconds: number;
  oldRating: number;
  newRating: number;
}

export type Platform = 'leetcode' | 'codeforces' | 'codechef' | 'geeksforgeeks';
