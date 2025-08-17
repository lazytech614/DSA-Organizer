// Platform API integrations
interface PlatformConfig {
  name: string;
  apiUrl: string;
  endpoints: {
    user: string;
    problems: string;
    submissions: string;
  };
}

const PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
  leetcode: {
    name: 'LeetCode',
    apiUrl: 'https://leetcode.com/api',
    endpoints: {
      user: '/user/{username}/',
      problems: '/problems/algorithms/',
      submissions: '/submissions/{username}/'
    }
  },
  codeforces: {
    name: 'Codeforces',
    apiUrl: 'https://codeforces.com/api',
    endpoints: {
      user: '/user.info?handles={username}',
      problems: '/problemset.problems',
      submissions: '/user.status?handle={username}'
    }
  },
  codechef: {
    name: 'CodeChef',
    apiUrl: 'https://www.codechef.com/api',
    endpoints: {
      user: '/users/{username}',
      problems: '/contests',
      submissions: '/rankings/{contest_code}'
    }
  }
};

// Service to fetch user data
class PlatformService {
  async fetchUserData(platform: string, username: string) {
    const config = PLATFORM_CONFIGS[platform];
    if (!config) throw new Error('Platform not supported');

    const userUrl = config.apiUrl + config.endpoints.user.replace('{username}', username);
    
    try {
      const response = await fetch(userUrl);
      const data = await response.json();
      
      return this.normalizeUserData(platform, data);
    } catch (error) {
      console.error(`Failed to fetch data from ${platform}:`, error);
      return null;
    }
  }

  private normalizeUserData(platform: string, rawData: any) {
    switch (platform) {
      case 'leetcode':
        return {
          username: rawData.username,
          totalSolved: rawData.num_solved,
          easySolved: rawData.ac_easy,
          mediumSolved: rawData.ac_medium,
          hardSolved: rawData.ac_hard,
          ranking: rawData.ranking,
          acceptanceRate: rawData.acceptance_rate
        };
      
      case 'codeforces':
        return {
          username: rawData.result[0].handle,
          rating: rawData.result.rating,
          maxRating: rawData.result.maxRating,
          rank: rawData.result.rank,
          maxRank: rawData.result.maxRank,
          contribution: rawData.result.contribution
        };
      
      // Add other platform normalizations
      default:
        return rawData;
    }
  }
}
