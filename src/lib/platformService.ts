import { GeeksforGeeksTracker } from "./trackers/geeksforgeeksTracker";

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
  private gfgTracker = new GeeksforGeeksTracker();

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
      return this.fetchUserData('codechef', username);
    } catch (error) {
      console.error('CodeChef API error:', error);
      return null;
    }
  }

  private async fetchGeeksForGeeksData(username: string): Promise<PlatformStats | null> {
    try {
      console.log(`Fetching GeeksforGeeks data for ${username}`);
      
      // Use the tracker directly without recursion
      const result = await this.gfgTracker.getProgress(username);

      console.log(`🟢🟢GeeksforGeeks data for ${username}:`, result);
      
      if (!result) {
        console.log(`No GFG data found for ${username}`);
        return null;
      }

      // Convert to PlatformStats format
      return {
        totalSolved: result.totalSolved || 0,
        easySolved: result.easySolved || 0,
        mediumSolved: result.mediumSolved || 0,
        hardSolved: result.hardSolved || 0,
        platform: 'geeksforgeeks'
      };
    } catch (error) {
      console.error('GeeksforGeeks API error:', error);
      // Return basic structure instead of null
      return {
        totalSolved: 0,
        easySolved: 0,
        mediumSolved: 0,
        hardSolved: 0,
        platform: 'geeksforgeeks'
      };
    }
  }
}
