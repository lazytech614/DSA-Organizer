import { PlatformStats } from '@/types/platform-types';

export class LeetCodeService {
  async fetchUserData(username: string): Promise<PlatformStats | null> {
    try {
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

      return this.processLeetCodeData(data.data.matchedUser);
      
    } catch (error) {
      console.error('LeetCode API error:', error);
      return null;
    }
  }

  private processLeetCodeData(userData: any): PlatformStats {
    const stats = userData.submitStats.acSubmissionNum;
    const easy = stats.find((s: any) => s.difficulty === 'Easy')?.count || 0;
    const medium = stats.find((s: any) => s.difficulty === 'Medium')?.count || 0;
    const hard = stats.find((s: any) => s.difficulty === 'Hard')?.count || 0;

    return {
      totalSolved: easy + medium + hard,
      easySolved: easy,
      mediumSolved: medium,
      hardSolved: hard,
    };
  }
}
