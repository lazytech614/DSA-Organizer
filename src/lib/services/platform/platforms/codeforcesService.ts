import { PlatformStats, RatingChange } from '@/types/platform-types';

export class CodeforcesService {
  async fetchUserData(username: string): Promise<PlatformStats | null> {
    try {
      const [userInfoResponse, ratingHistoryResponse, userSubmissions] = await Promise.all([
        fetch(`https://codeforces.com/api/user.info?handles=${username}`),
        fetch(`https://codeforces.com/api/user.rating?handle=${username}`),
        fetch(`https://codeforces.com/api/user.status?handle=${username}`)
      ]);

      const userInfoData = await userInfoResponse.json();
      const ratingHistoryData = await ratingHistoryResponse.json();
      const userSubmissionsData = await userSubmissions.json();

      if (userInfoData.status !== 'OK' || !userInfoData.result?.[0]) {
        return null;
      }

      const user = userInfoData.result;
      const ratings = ratingHistoryData.status === 'OK' ? ratingHistoryData.result : [];
      const submissions = userSubmissionsData.status === 'OK' ? userSubmissionsData.result : [];

      return this.processCodeforcesData(user, ratings, submissions);
      
    } catch (error) {
      console.error('Codeforces API error:', error);
      return null;
    }
  }

  private processCodeforcesData(user: any, ratings: RatingChange[], submissions: any[]): PlatformStats {
    // Process contest stats
    const contestStats = this.calculateContestStats(ratings);
    
    // Process problem stats
    const problemStats = this.processSubmissions(submissions);

    return {
      rating: user.rating || 0,
      maxRating: user.maxRating || 0,
      rank: contestStats.bestRank || 0,
      contribution: user.contribution || 0,
      contests: contestStats.totalContests,
      lastThreeRanks: contestStats.lastThreeRanks,
      friends: user.friendOfCount || 0,
      ratingChange: contestStats.lastChange.delta,
      title: user.maxRank || '',
      totalSolved: problemStats.totalSolved,
      easySolved: problemStats.easySolved,
      mediumSolved: problemStats.mediumSolved,
      hardSolved: problemStats.hardSolved,
      ratingWiseCount: problemStats.ratingWiseCount
    };
  }

  private calculateContestStats(ratings: RatingChange[]) {
    if (ratings.length === 0) {
      return {
        totalContests: 0,
        bestRank: null,
        lastThreeRanks: [],
        lastChange: { delta: 0 }
      };
    }

    const totalContests = ratings.length;
    const bestRank = Math.min(...ratings.map(rc => rc.rank));
    
    const sortedByTime = [...ratings].sort(
      (a, b) => b.ratingUpdateTimeSeconds - a.ratingUpdateTimeSeconds
    );
    const lastThreeRanks = sortedByTime.slice(0, 3).map(rc => rc.rank);
    
    const lastContest = sortedByTime[0];
    const lastChange = {
      delta: lastContest.newRating - lastContest.oldRating
    };

    return {
      totalContests,
      bestRank,
      lastThreeRanks,
      lastChange
    };
  }

  private processSubmissions(submissions: any[]) {
    const accepted = submissions.filter(sub => sub.verdict === "OK");
    
    const problemSet = new Map<string, any>();
    for (const sub of accepted) {
      const key = `${sub.problem.contestId}-${sub.problem.index}`;
      if (!problemSet.has(key)) {
        problemSet.set(key, sub);
      }
    }

    const ratingWiseCount = {
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

    let easySolved = 0;
    let mediumSolved = 0;
    let hardSolved = 0;

    for (const sub of problemSet.values()) {
      const rating = sub.problem.rating;
      
      // Count by rating bands
      if (rating === undefined) {
        ratingWiseCount.unrated++;
        easySolved++;
      } else if (rating < 1000) {
        ratingWiseCount.below1000++;
        easySolved++;
      } else if (rating < 1200) {
        ratingWiseCount.range1000to1199++;
        easySolved++;
      } else if (rating < 1400) {
        ratingWiseCount.range1200to1399++;
        easySolved++;
      } else if (rating < 1600) {
        ratingWiseCount.range1400to1599++;
        mediumSolved++;
      } else if (rating < 1800) {
        ratingWiseCount.range1600to1799++;
        mediumSolved++;
      } else if (rating < 2000) {
        ratingWiseCount.range1800to1999++;
        mediumSolved++;
      } else if (rating < 2200) {
        ratingWiseCount.range2000to2199++;
        hardSolved++;
      } else if (rating < 2400) {
        ratingWiseCount.range2200to2399++;
        hardSolved++;
      } else if (rating < 2600) {
        ratingWiseCount.range2400to2599++;
        hardSolved++;
      } else if (rating < 2800) {
        ratingWiseCount.range2600to2799++;
        hardSolved++;
      } else if (rating < 3000) {
        ratingWiseCount.range2800to2999++;
        hardSolved++;
      } else if (rating >= 3000) {
        ratingWiseCount.above3000++;
        hardSolved++;
      }
    }

    return {
      totalSolved: problemSet.size,
      easySolved,
      mediumSolved,
      hardSolved,
      ratingWiseCount
    };
  }
}
