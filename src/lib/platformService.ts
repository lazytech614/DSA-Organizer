import { JsonObject } from "@prisma/client/runtime/library";
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
    range2000to2199?: number,
    range2200to2399?: number,
    range2400to2599?: number,
    range2600to2799?: number,
    range2800to2999?: number,
    above3000?: number,
    unrated?: number; 
  };
  
  // Add other platform-specific fields as needed
  [key: string]: any; // For flexibility with different platforms
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
      // Fetch user info and rating history in parallel
      const [userInfoResponse, ratingHistoryResponse, userSubmissions] = await Promise.all([
        fetch(`https://codeforces.com/api/user.info?handles=${username}`),
        fetch(`https://codeforces.com/api/user.rating?handle=${username}`),
        fetch(`https://codeforces.com/api/user.status?handle=${username}`)
      ]);

      const userInfoData = await userInfoResponse.json();
      const ratingHistoryData = await ratingHistoryResponse.json();
      const userSubmissionsData = await userSubmissions.json();

      // console.log(`UserInfoData data for ${username}:`, userInfoData);
      // console.log(`RatingHistoryData data for ${username}:`, ratingHistoryData);
      // console.log(`UserSubmissionsData data for ${username}:`, userSubmissionsData);

      // Check if user info request was successful
      if (userInfoData.status !== 'OK' || !userInfoData.result?.[0]) {
        return null;
      }

      const user = userInfoData.result[0];

      const ratings = ratingHistoryData.result;
      // Total contests is simply array length
      const totalContests = ratings.length;

      // Best rank is minimum value of rank field
      const bestRank = Math.min(...ratings.map((rc: RatingChange) => rc.rank));

      // Last 3 contest ranks (by latest ratingUpdateTimeSeconds)
      const sortedByTime = [...ratings].sort(
        (a, b) => b.ratingUpdateTimeSeconds - a.ratingUpdateTimeSeconds
      );
      const lastThreeRanks = sortedByTime.slice(0, 3).map(rc => rc.rank);

      // Last contest rating change
      const lastContest = sortedByTime[0];
      const lastChange = {
        increased: lastContest?.newRating > lastContest?.oldRating,
        delta: lastContest?.newRating - lastContest?.oldRating
      };

      // Step 1: Filter for accepted submissions
      const accepted = userSubmissionsData.result.filter((sub: any) => sub.verdict === "OK");

      // Step 2: Get unique problems by contestId + index
      const problemSet = new Map<any, any>();
      for (const sub of accepted) {
        const key = `${sub.problem.contestId}-${sub.problem.index}`;
        if (!problemSet.has(key)) {
          problemSet.set(key, sub);
        }
      }

      // Step 3: Count by rating bands
      const ratingWiseCount: any = {
        below1000: 0,
        range1000to1199: 0,
        range1200to1399: 0,
        range1400to1599: 0,
        range1600to1799: 0,
        range1800to1999: 0,
        range2000to2199: 0,
        range2200to2399: 0,
        range2400to2599: 0,
        range2600to2799: 0,
        range2800to2999: 0,
        above3000: 0,
        unrated: 0
      };

      for (const sub of problemSet.values()) {
        const rating = sub.problem.rating;
        if (rating === undefined) {
          ratingWiseCount.unrated++;
        } else if (rating < 1000) {
          ratingWiseCount.below1000++;
        } else if (rating < 1200) {
          ratingWiseCount.range1000to1199++;
        } else if (rating < 1400) {
          ratingWiseCount.range1200to1399++;
        } else if (rating < 1600) {
          ratingWiseCount.range1400to1599++;
        } else if (rating < 1800) {
          ratingWiseCount.range1600to1799++;
        } else if (rating < 2000) {
          ratingWiseCount.range1800to1999++;
        } else if (rating < 2200) {
          ratingWiseCount.range2000to2199++;
        } else if (rating < 2400) {
          ratingWiseCount.range2200to2399++;
        } else if (rating < 2600) {
          ratingWiseCount.range2400to2599++;
        } else if (rating < 2800) {
          ratingWiseCount.range2600to2799++;
        } else if (rating < 3000) {
          ratingWiseCount.range2800to2999++;
        } else if (rating >= 3000) {
          ratingWiseCount.above3000++;
        }
      }

      let easySolved = 0;
      let mediumSolved = 0;
      let hardSolved = 0;
      for (const sub of problemSet.values()) {
        const rating = sub.problem.rating;
        if (rating === undefined) {
          easySolved++; 
        } else if (rating <= 1200) {
          easySolved++;
        } else if (rating <= 1800) {
          mediumSolved++;
        } else {
          hardSolved++;
        }
      }


      return {
        rating: user.rating || 0,
        maxRating: user.maxRating || 0,
        rank: bestRank || NaN,
        contribution: user.contribution || 0,
        contests: totalContests || 0,
        lastThreeRanks: lastThreeRanks || [],
        friends: user.friendOfCount || 0,
        ratingChange: lastChange?.delta || 0,
        title: user.maxRank || '',
        ratingWiseCount: {
          below1000: ratingWiseCount.below1000,
          range1000to1199: ratingWiseCount.range1000to1199,
          range1200to1399: ratingWiseCount.range1200to1399,
          range1400to1599: ratingWiseCount.range1400to1599,
          range1600to1799: ratingWiseCount.range1600to1799,
          range1800to1999: ratingWiseCount.range1800to1999,
          range2000to2199: ratingWiseCount.range2000to2199,
          range2200to2399: ratingWiseCount.range2200to2399,
          range2400to2599: ratingWiseCount.range2400to2599,
          range2600to2799: ratingWiseCount.range2600to2799,
          range2800to2999: ratingWiseCount.range2800to2999,
          above3000: ratingWiseCount.above3000,
          unrated: ratingWiseCount.unrated, 
        },
        totalSolved: problemSet.size,
        easySolved,
        mediumSolved,
        hardSolved
      };

    } catch (error) {
      console.error('Codeforces API error:', error);
      return null;
    }
  }

  private async fetchCodeChefData(username: string): Promise<PlatformStats | null> {
    try {
      // TODO: Implement actual CodeChef API integration
      // For now, return a placeholder or null
      console.log(`CodeChef integration not implemented yet for ${username}`);
      return {
        totalSolved: 0,
        easySolved: 0,
        mediumSolved: 0,
        hardSolved: 0,
        platform: 'codechef'
      };
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
