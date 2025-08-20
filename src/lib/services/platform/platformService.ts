import { PlatformStats, Platform } from '@/types/platform-types';
import { CodeforcesService } from './platforms/codeforcesService';
import { LeetCodeService } from './platforms/leetcodeService';
import { CodeChefService } from './platforms/codechefService';
import { GeeksForGeeksService } from './platforms/geeksforgeeksService';

export class PlatformService {
  private codeforcesService = new CodeforcesService();
  private leetcodeService = new LeetCodeService();
  private codechefService = new CodeChefService();
  private gfgService = new GeeksForGeeksService();

  async fetchUserData(platform: string, username: string): Promise<PlatformStats | null> {
    try {
      switch (platform.toLowerCase()) {
        case 'leetcode':
          return await this.leetcodeService.fetchUserData(username);
        case 'codeforces':
          return await this.codeforcesService.fetchUserData(username);
        case 'codechef':
          return await this.codechefService.fetchUserData(username);
        case 'geeksforgeeks':
          return await this.gfgService.fetchUserData(username);
        default:
          throw new Error(`Platform ${platform} not supported`);
      }
    } catch (error) {
      console.error(`Failed to fetch data for ${platform}:`, error);
      return null;
    }
  }
}
