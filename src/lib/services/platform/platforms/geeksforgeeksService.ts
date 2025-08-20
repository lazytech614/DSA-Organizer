import { PlatformStats } from '@/types/platform-types';
import { GeeksforGeeksTracker } from '../../../trackers/geeksforgeeksTracker';

export class GeeksForGeeksService {
  private gfgTracker = new GeeksforGeeksTracker();

  async fetchUserData(username: string): Promise<PlatformStats | null> {
    try {
      console.log(`Fetching GeeksforGeeks data for ${username}`);
      
      const result = await this.gfgTracker.getProgress(username);

      console.log(`🟢🟢GeeksforGeeks data for ${username}:`, result);
      
      if (!result) {
        console.log(`No GFG data found for ${username}`);
        return null;
      }

      return {
        totalSolved: result.totalSolved || 0,
        easySolved: result.easySolved || 0,
        mediumSolved: result.mediumSolved || 0,
        hardSolved: result.hardSolved || 0,
        platform: 'geeksforgeeks'
      };
    } catch (error) {
      console.error('GeeksforGeeks API error:', error);
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
