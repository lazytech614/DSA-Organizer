// lib/platform-service.ts
import { Platform } from '@prisma/client';

// In your types file (e.g., types/index.ts or lib/types.ts)
export interface PlatformStats {
  totalSolved?: number;
  easySolved?: number;
  mediumSolved?: number;
  hardSolved?: number;
  rating?: number;
  maxRating?: number;
  contests?: number;
  rank?: number;
  
  // ✅ Add bio-related fields for verification
  bio?: string;
  about?: string;
  description?: string;
  
  // Platform-specific fields
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
  
  // Add other platform-specific fields as needed
  [key: string]: any; // For flexibility with different platforms
}


export class PlatformService {
  async fetchUserData(platform: string, username: string): Promise<PlatformStats | null> {
    try {
      switch (platform.toLowerCase()) {
        case 'leetcode':
          return await this.fetchLeetCodeData(username);
        case 'codeforces':
          return await this.fetchCodeforcesData(username);
        case 'codechef':
          return await this.fetchCodeChefData(username);
        case 'geeksforgeeks':
          return await this.fetchGeeksForGeeksData(username);
        default:
          throw new Error(`Platform ${platform} not supported`);
      }
    } catch (error) {
      console.error(`Failed to fetch data for ${platform}:`, error);
      return null;
    }
  }

  private async fetchLeetCodeData(username: string): Promise<PlatformStats | null> {
    try {
      // Using GraphQL API
      const query = `
        query getUserProfile($username: String!) {
          matchedUser(username: $username) {
            username
            submitStats: submitStatsGlobal {
              acSubmissionNum {
                difficulty
                count
              }
            }
          }
        }
      `;

      const response = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: { username }
        })
      });

      const data = await response.json();
      
      if (!data.data?.matchedUser) {
        return null;
      }

      const stats = data.data.matchedUser.submitStats.acSubmissionNum;
      const easy = stats.find((s: any) => s.difficulty === 'Easy')?.count || 0;
      const medium = stats.find((s: any) => s.difficulty === 'Medium')?.count || 0;
      const hard = stats.find((s: any) => s.difficulty === 'Hard')?.count || 0;

      return {
        totalSolved: easy + medium + hard,
        easySolved: easy,
        mediumSolved: medium,
        hardSolved: hard,
      };
    } catch (error) {
      console.error('LeetCode API error:', error);
      return null;
    }
  }

  private async fetchCodeforcesData(username: string): Promise<PlatformStats | null> {
    try {
      const response = await fetch(`https://codeforces.com/api/user.info?handles=${username}`);
      const data = await response.json();

      if (data.status !== 'OK' || !data.result?.[0]) {
        return null;
      }

      const user = data.result;
      
      return {
        rating: user.rating || 0,
        maxRating: user.maxRating || 0,
        rank: user.rank || 'unrated',
        maxRank: user.maxRank || 'unrated',
        contribution: user.contribution || 0,
      };
    } catch (error) {
      console.error('Codeforces API error:', error);
      return null;
    }
  }

  private async fetchCodeChefData(username: string): Promise<PlatformStats | null> {
    try {
      // CodeChef doesn't have a public API, so this would require web scraping
      // For now, return mock data or implement scraping
      console.log(`CodeChef data fetching not implemented for ${username}`);
      return {
        rating: 1500, // Mock data
        contests: 0,
      };
    } catch (error) {
      console.error('CodeChef API error:', error);
      return null;
    }
  }

  private async fetchGeeksForGeeksData(username: string): Promise<PlatformStats | null> {
    try {
      // GeeksforGeeks doesn't have a public API
      // This would require web scraping
      console.log(`GeeksforGeeks data fetching not implemented for ${username}`);
      return {
        totalSolved: 0, // Mock data
      };
    } catch (error) {
      console.error('GeeksforGeeks API error:', error);
      return null;
    }
  }
}
