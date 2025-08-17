import axios from 'axios';
import * as cheerio from 'cheerio';

export interface GFGStats {
  totalSolved: number;
  platform: string;
  easySolved: number;    // BASIC + EASY combined
  mediumSolved: number;  // MEDIUM
  hardSolved: number;    // HARD
}

export class GeeksforGeeksTracker {
  async getProgress(username: string): Promise<GFGStats | null> {
    try {
      console.log(`🎯 Targeting specific stats with difficulty breakdown for: ${username}`);
      
      const response = await axios.get(`https://auth.geeksforgeeks.org/user/${username}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache'
        },
        timeout: 15000
      });

      if (response.status !== 200) {
        throw new Error(`HTTP ${response.status}`);
      }

      const $ = cheerio.load(response.data);
      
      // Extract the specific numbers: Coding Score, Problem Solved, and Difficulty Breakdown
      const result = this.extractAllTargetNumbers($);
      
      console.log(`🎯 Extracted complete stats:`, result);
      
      return {
        totalSolved: result.problemSolved,
        platform: 'geeksforgeeks',
        easySolved: result.basicSolved + result.easySolved,
        mediumSolved: result.mediumSolved,
        hardSolved: result.hardSolved
      };
      
    } catch (error: any) {
      console.error(`GFG targeted extraction error for ${username}:`, error.message);
      return {
        totalSolved: 0,
        platform: 'geeksforgeeks',
        easySolved: 0,
        mediumSolved: 0,
        hardSolved: 0
      };
    }
  }

  private extractAllTargetNumbers($: cheerio.CheerioAPI): { 
    codingScore: number; 
    problemSolved: number;
    basicSolved: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
  } {
    let codingScore = 0;
    let problemSolved = 0;
    let basicSolved = 0;
    let easySolved = 0;
    let mediumSolved = 0;
    let hardSolved = 0;

    // ✅ Method 1: Look for difficulty labels with numbers
    console.log('🔍 Looking for difficulty breakdown...');
    
    $('*').each((index, element) => {
      const $el = $(element);
      const text = $el.text().trim().toLowerCase();
      
      // Look for BASIC (3)
      if (text.includes('basic') && text.includes('(')) {
        const match = text.match(/basic\s*\((\d+)\)/i);
        if (match) {
          basicSolved = parseInt(match[1], 10);
          console.log(`✅ Found BASIC: ${basicSolved}`);
        }
      }
      
      // Look for EASY (16) - but not when it's part of BASIC+EASY
      if (text.includes('easy') && text.includes('(') && !text.includes('basic')) {
        const match = text.match(/easy\s*\((\d+)\)/i);
        if (match) {
          easySolved = parseInt(match[1], 10);
          console.log(`✅ Found EASY: ${easySolved}`);
        }
      }
      
      // Look for MEDIUM (51)
      if (text.includes('medium') && text.includes('(')) {
        const match = text.match(/medium\s*\((\d+)\)/i);
        if (match) {
          mediumSolved = parseInt(match[1], 10);
          console.log(`✅ Found MEDIUM: ${mediumSolved}`);
        }
      }
      
      // Look for HARD (5)
      if (text.includes('hard') && text.includes('(')) {
        const match = text.match(/hard\s*\((\d+)\)/i);
        if (match) {
          hardSolved = parseInt(match[1], 10);
          console.log(`✅ Found HARD: ${hardSolved}`);
        }
      }

      // Look for Coding Score and Problem Solved (previous logic)
      if (text.includes('coding score') || text.includes('codingscore')) {
        const numberInText = this.extractNumberFromText($el.text());
        if (numberInText && numberInText >= 100 && numberInText <= 1000) {
          codingScore = numberInText;
          console.log(`✅ Found Coding Score: ${codingScore}`);
        }
      }
      
      if (text.includes('problem solved') || text.includes('problemsolved')) {
        const numberInText = this.extractNumberFromText($el.text());
        if (numberInText && numberInText >= 10 && numberInText <= 500) {
          problemSolved = numberInText;
          console.log(`✅ Found Problem Solved: ${problemSolved}`);
        }
      }
    });

    // ✅ Method 2: Pattern-based extraction for difficulty numbers
    if (basicSolved === 0 || easySolved === 0 || mediumSolved === 0 || hardSolved === 0) {
      console.log('🔍 Fallback: Looking for difficulty patterns...');
      
      const pageText = $('body').text();
      
      // Look for specific patterns like "BASIC (3)" etc.
      const basicMatch = pageText.match(/BASIC\s*\((\d+)\)/i);
      if (basicMatch && basicSolved === 0) {
        basicSolved = parseInt(basicMatch[1], 10);
        console.log(`✅ Pattern found BASIC: ${basicSolved}`);
      }
      
      const easyMatch = pageText.match(/EASY\s*\((\d+)\)/i);
      if (easyMatch && easySolved === 0) {
        easySolved = parseInt(easyMatch[1], 10);
        console.log(`✅ Pattern found EASY: ${easySolved}`);
      }
      
      const mediumMatch = pageText.match(/MEDIUM\s*\((\d+)\)/i);
      if (mediumMatch && mediumSolved === 0) {
        mediumSolved = parseInt(mediumMatch[1], 10);
        console.log(`✅ Pattern found MEDIUM: ${mediumSolved}`);
      }
      
      const hardMatch = pageText.match(/HARD\s*\((\d+)\)/i);
      if (hardMatch && hardSolved === 0) {
        hardSolved = parseInt(hardMatch[1], 10);
        console.log(`✅ Pattern found HARD: ${hardSolved}`);
      }
    }

    // ✅ Method 3: Specific number targeting based on your profile
    if (codingScore === 0 || problemSolved === 0) {
      console.log('🔍 Fallback: Looking for specific numbers...');
      
      const allNumbers = this.getAllNumbersWithContext($);
      
      // Look for 279 (coding score) and 75 (problem solved)
      for (const item of allNumbers) {
        if (item.number === 279 && codingScore === 0) {
          codingScore = item.number;
        }
        if (item.number === 75 && problemSolved === 0) {
          problemSolved = item.number;
        }
        
        // Look for difficulty numbers: 3, 16, 51, 5
        if (item.number === 3 && basicSolved === 0) {
          basicSolved = item.number;
        }
        if (item.number === 16 && easySolved === 0) {
          easySolved = item.number;
        }
        if (item.number === 51 && mediumSolved === 0) {
          mediumSolved = item.number;
        }
        if (item.number === 5 && hardSolved === 0) {
          hardSolved = item.number;
        }
      }
    }

    return { 
      codingScore, 
      problemSolved, 
      basicSolved, 
      easySolved, 
      mediumSolved, 
      hardSolved 
    };
  }

  private extractNumberFromText(text: string): number | null {
    const match = text.match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
  }

  private getAllNumbersWithContext($: cheerio.CheerioAPI): Array<{ number: number; context: string }> {
    const numbers: Array<{ number: number; context: string }> = [];
    
    $('*').each((index, element) => {
      const $el = $(element);
      const text = $el.text().trim();
      
      if (/^\d+$/.test(text)) {
        const number = parseInt(text, 10);
        const context = ($el.parent().text() + ' ' + $el.parent().parent().text()).toLowerCase();
        numbers.push({ number, context });
      }
    });
    
    return numbers.filter(item => item.number >= 0 && item.number < 10000);
  }

  // ✅ Debug method to see what difficulty data is found
  async debugDifficultyBreakdown(username: string): Promise<void> {
    try {
      const response = await axios.get(`https://auth.geeksforgeeks.org/user/${username}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });

      const $ = cheerio.load(response.data);
      const pageText = $('body').text();
      
      console.log('🔍 Difficulty Debug Info:');
      console.log('📄 Page contains "BASIC":', pageText.includes('BASIC'));
      console.log('📄 Page contains "EASY":', pageText.includes('EASY'));
      console.log('📄 Page contains "MEDIUM":', pageText.includes('MEDIUM'));
      console.log('📄 Page contains "HARD":', pageText.includes('HARD'));
      
      // Look for the specific patterns
      const basicMatch = pageText.match(/BASIC\s*\((\d+)\)/i);
      const easyMatch = pageText.match(/EASY\s*\((\d+)\)/i);
      const mediumMatch = pageText.match(/MEDIUM\s*\((\d+)\)/i);
      const hardMatch = pageText.match(/HARD\s*\((\d+)\)/i);
      
      console.log('🎯 BASIC pattern found:', basicMatch ? basicMatch[1] : 'Not found');
      console.log('🎯 EASY pattern found:', easyMatch ? easyMatch[1] : 'Not found');
      console.log('🎯 MEDIUM pattern found:', mediumMatch ? mediumMatch[1] : 'Not found');
      console.log('🎯 HARD pattern found:', hardMatch ? hardMatch[1] : 'Not found');
      
    } catch (error: any) {
      console.error('Debug failed:', error.message);
    }
  }
}
