import axios from 'axios';
import * as cheerio from 'cheerio';
import { PlatformStats } from '../../types/platform-types';

export class CodeChefTracker {
  async getProgress(username: string): Promise<PlatformStats | null> {
    try {
      console.log(`Fetching CodeChef data for: ${username}`);
      
      const url = `https://www.codechef.com/users/${username}`;
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Referer': 'https://www.codechef.com/',
          'Connection': 'keep-alive'
        },
        timeout: 15000
      });

      if (response.status !== 200) {
        console.log(`CodeChef profile not found: ${response.status}`);
        return null;
      }

      const $ = cheerio.load(response.data);
      
      // Check if profile exists
      if (this.isProfileNotFound($)) {
        return null;
      }

      return this.extractProfileData($, username);
    } catch (error) {
      console.error(`CodeChef tracker error for ${username}:`, error);
      return null;
    }
  }

  private isProfileNotFound($: cheerio.CheerioAPI): boolean {
    const bodyText = $('body').text().toLowerCase();
    return bodyText.includes('404') || 
           bodyText.includes('page not found') || 
           bodyText.includes('user not found') ||
           $('.error-message').length > 0;
  }

  private extractProfileData($: cheerio.CheerioAPI, username: string): PlatformStats {
    // CodeChef rating extraction
    const rating = this.extractNumber($, [
      '.rating-number',
      '.rating',
      '.rating-header .number',
      '.contest-rating-number',
      '.user-details-container .rating'
    ]);

    const maxRating = this.extractNumber($, [
      '.rating-data-section .number',
      '.max-rating',
      '.highest-rating',
      '.rating-data .rating'
    ]);

    const stars = this.extractText($, [
      '.rating-star',
      '.star-rating',
      '.user-rating .star'
    ]);

    const globalRank = this.extractNumber($, [
      '.global-rank .rank-number',
      '.rank',
      '.ranking-number'
    ]);

    const countryRank = this.extractNumber($, [
      '.country-rank .rank-number',
      '.country-ranking'
    ]);

    const contestsParticipated = this.extractNumber($, [
      '.contest-participated-count',
      '.contests .number',
      '.total-contests'
    ]);

    const problemsSolved = this.extractNumber($, [
      '.problems-solved .number',
      '.total-problems',
      '.solved-count'
    ]);

    // Extract rating category/division
    const division = this.extractText($, [
      '.rating-title',
      '.division',
      '.rating-category'
    ]);

    console.log(`CodeChef extracted data - Rating: ${rating}, Max: ${maxRating}, Problems: ${problemsSolved}`);

    return {
      rating: rating || 0,
      maxRating: maxRating || rating || 0,
      totalSolved: problemsSolved || 0,
      contests: contestsParticipated || 0,
      rank: globalRank || 0,
      countryRank: countryRank || 0,
      stars: stars ?? undefined,
      division: division ?? undefined,
      platform: 'codechef'
    };
  }

  private extractNumber($: cheerio.CheerioAPI, selectors: string[]): number | null {
    for (const selector of selectors) {
      try {
        const element = $(selector).first();
        if (element.length > 0) {
          const text = element.text().trim();
          // Extract number, handling cases like "1234" or "1,234"
          const cleanText = text.replace(/,/g, '');
          const numbers = cleanText.match(/\d+/g);
          if (numbers && numbers.length > 0) {
            const number = parseInt(numbers[0], 10);
            if (!isNaN(number)) {
              return number;
            }
          }
        }
      } catch (error) {
        continue;
      }
    }
    return null;
  }

  private extractText($: cheerio.CheerioAPI, selectors: string[]): string | null {
    for (const selector of selectors) {
      try {
        const text = $(selector).first().text().trim();
        if (text && text !== '') {
          return text;
        }
      } catch (error) {
        continue;
      }
    }
    return null;
  }
}
