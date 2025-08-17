// utils/questionParser.ts
import { Difficulty } from '@prisma/client';

export interface ParsedQuestionData {
  title?: string;
  difficulty?: Difficulty;
  topics?: string[];
  description?: string;
}

export class QuestionParser {
  static async parseUrl(url: string): Promise<ParsedQuestionData | null> {
    try {
      if (url.includes('leetcode.com')) {
        return await this.parseLeetCodeUrl(url);
      } else if (url.includes('geeksforgeeks.org')) {
        return await this.parseGeeksforGeeksUrl(url);
      }
      return null;
    } catch (error) {
      console.error('Failed to parse URL:', error);
      return null;
    }
  }

  private static async parseLeetCodeUrl(url: string): Promise<ParsedQuestionData | null> {
    // Extract problem slug from URL
    const match = url.match(/leetcode\.com\/problems\/([^\/\?]+)/);
    if (!match) return null;
    
    const problemSlug = match[1];
    
    // Use LeetCode's GraphQL API
    try {
      const response = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query getQuestionDetail($titleSlug: String!) {
              question(titleSlug: $titleSlug) {
                title
                difficulty
                content
                topicTags {
                  name
                }
              }
            }
          `,
          variables: { titleSlug: problemSlug }
        })
      });

      const data = await response.json();
      const question = data.data?.question;

      if (!question) return null;

      return {
        title: question.title,
        difficulty: question.difficulty.toLowerCase() === 'easy' ? 'EASY' : 
                   question.difficulty.toLowerCase() === 'medium' ? 'MEDIUM' : 'HARD',
        topics: question.topicTags?.map((tag: any) => tag.name) || [],
        description: question.content
      };
    } catch (error) {
      // Fallback to scraping if API fails
      return await this.scrapeLeetCode(url);
    }
  }

  private static async parseGeeksforGeeksUrl(url: string): Promise<ParsedQuestionData | null> {
    // For GeeksforGeeks, we'll use web scraping or their API if available
    return await this.scrapeGeeksforGeeks(url);
  }

  //TODO: add ggeksforgeeks scraping
  private static async scrapeLeetCode(url: string): Promise<ParsedQuestionData | null> {
    // Client-side scraping is limited due to CORS
    // You might need to use a proxy or server-side scraping
    return null;
  }

  private static async scrapeGeeksforGeeks(url: string): Promise<ParsedQuestionData | null> {
    // Similar to LeetCode scraping
    return null;
  }

  // Helper method to map common topics
  static mapTopics(topics: string[]): string[] {
  const topicMap: Record<string, string> = {
    // Basic Data Structures
    'array': 'Array',
    'string': 'String',
    'linked-list': 'Linked List',
    'stack': 'Stack',
    'queue': 'Queue',
    'hash-table': 'Hash Table',
    'hash-map': 'Hash Table',
    'hashtable': 'Hash Table',
    'hashmap': 'Hash Table',
    'set': 'Hash Table',
    'matrix': 'Matrix',
    'grid': 'Matrix',
    '2d-array': 'Matrix',
    
    // Tree Structures
    'tree': 'Binary Tree',
    'binary-tree': 'Binary Tree',
    'binary-search-tree': 'Binary Search Tree',
    'bst': 'Binary Search Tree',
    'trie': 'Trie',
    'prefix-tree': 'Trie',
    'segment-tree': 'Segment Tree',
    'binary-indexed-tree': 'Binary Indexed Tree',
    'fenwick-tree': 'Binary Indexed Tree',
    'n-ary-tree': 'N-ary Tree',
    'red-black-tree': 'Balanced Tree',
    'avl-tree': 'Balanced Tree',
    
    // Advanced Data Structures
    'heap': 'Heap',
    'priority-queue': 'Heap',
    'min-heap': 'Heap',
    'max-heap': 'Heap',
    'union-find': 'Union Find',
    'disjoint-set': 'Union Find',
    'suffix-array': 'Suffix Array',
    'suffix-tree': 'Suffix Tree',
    'bloom-filter': 'Bloom Filter',
    
    // Graph Structures
    'graph': 'Graph',
    'directed-graph': 'Graph',
    'undirected-graph': 'Graph',
    'weighted-graph': 'Graph',
    'adjacency-list': 'Graph',
    'adjacency-matrix': 'Graph',
    'topological-sort': 'Topological Sort',
    'shortest-path': 'Shortest Path',
    'minimum-spanning-tree': 'Minimum Spanning Tree',
    'mst': 'Minimum Spanning Tree',
    
    // Algorithms - Searching
    'binary-search': 'Binary Search',
    'linear-search': 'Linear Search',
    'depth-first-search': 'Depth-First Search',
    'dfs': 'Depth-First Search',
    'breadth-first-search': 'Breadth-First Search',
    'bfs': 'Breadth-First Search',
    'backtracking': 'Backtracking',
    'brute-force': 'Brute Force',
    
    // Algorithms - Sorting
    'sorting': 'Sorting',
    'bubble-sort': 'Bubble Sort',
    'selection-sort': 'Selection Sort',
    'insertion-sort': 'Insertion Sort',
    'merge-sort': 'Merge Sort',
    'quick-sort': 'Quick Sort',
    'heap-sort': 'Heap Sort',
    'radix-sort': 'Radix Sort',
    'counting-sort': 'Counting Sort',
    'bucket-sort': 'Bucket Sort',
    'topological-sorting': 'Topological Sort',
    
    // Dynamic Programming
    'dynamic-programming': 'Dynamic Programming',
    'dp': 'Dynamic Programming',
    'memoization': 'Dynamic Programming',
    'tabulation': 'Dynamic Programming',
    'kadane-algorithm': 'Dynamic Programming',
    'knapsack': 'Dynamic Programming',
    'longest-common-subsequence': 'Dynamic Programming',
    'lcs': 'Dynamic Programming',
    'longest-increasing-subsequence': 'Dynamic Programming',
    'lis': 'Dynamic Programming',
    'edit-distance': 'Dynamic Programming',
    'fibonacci': 'Dynamic Programming',
    
    // Greedy Algorithms
    'greedy': 'Greedy',
    'greedy-algorithm': 'Greedy',
    'activity-selection': 'Greedy',
    'huffman-coding': 'Greedy',
    'fractional-knapsack': 'Greedy',
    
    // Two Pointers & Sliding Window
    'two-pointers': 'Two Pointers',
    'sliding-window': 'Sliding Window',
    'fast-slow-pointers': 'Two Pointers',
    'tortoise-hare': 'Two Pointers',
    'cycle-detection': 'Cycle Detection',
    
    // Mathematical Algorithms
    'math': 'Math',
    'mathematics': 'Math',
    'number-theory': 'Number Theory',
    'prime-numbers': 'Prime Numbers',
    'sieve-of-eratosthenes': 'Prime Numbers',
    'gcd-algorithm': 'Math',
    'lcm-algorithm': 'Math',
    'modular-arithmetic': 'Modular Arithmetic',
    'combinatorics': 'Combinatorics',
    'probability': 'Probability',
    'geometry': 'Geometry',
    'computational-geometry': 'Geometry',
    
    // Bit Manipulation
    'bit-manipulation': 'Bit Manipulation',
    'bitwise': 'Bit Manipulation',
    'bit-operations': 'Bit Manipulation',
    'xor': 'Bit Manipulation',
    'bit-masking': 'Bit Manipulation',
    
    // String Algorithms
    'string-matching': 'String Matching',
    'pattern-matching': 'String Matching',
    'kmp-algorithm': 'String Matching',
    'rabin-karp': 'String Matching',
    'z-algorithm': 'String Matching',
    'manacher': 'String Matching',
    'palindrome': 'Palindrome',
    'anagram': 'Anagram',
    'subsequence': 'Subsequence',
    'substring': 'Substring',
    
    // Recursion
    'recursion': 'Recursion',
    'recursive': 'Recursion',
    'divide-and-conquer': 'Divide and Conquer',
    'tail-recursion': 'Recursion',
    
    // Specific Algorithms
    'dijkstra': 'Dijkstra Algorithm',
    'bellman-ford': 'Bellman-Ford Algorithm',
    'floyd-warshall': 'Floyd-Warshall Algorithm',
    'kruskal': 'Kruskal Algorithm',
    'prim': 'Prim Algorithm',
    'ford-fulkerson': 'Max Flow',
    'max-flow': 'Max Flow',
    'min-cut': 'Min Cut',
    'bipartite-matching': 'Bipartite Matching',
    
    // Design Patterns
    'design': 'System Design',
    'system-design': 'System Design',
    'object-oriented-design': 'Object Oriented Design',
    'ood': 'Object Oriented Design',
    'data-structure-design': 'Data Structure Design',
    'iterator': 'Iterator',
    'cache': 'Cache',
    'lru': 'LRU Cache',
    'lfu': 'LFU Cache',
    
    // Game Theory
    'game-theory': 'Game Theory',
    'minimax': 'Game Theory',
    'nim-game': 'Game Theory',
    
    // Advanced Topics
    'network-flow': 'Network Flow',
    'linear-programming': 'Linear Programming',
    'convex-hull': 'Convex Hull',
    'line-sweep': 'Line Sweep',
    'coordinate-compression': 'Coordinate Compression',
    'mo-algorithm': 'Mo Algorithm',
    'heavy-light-decomposition': 'Heavy-Light Decomposition',
    'centroid-decomposition': 'Centroid Decomposition',
    'sqrt-decomposition': 'Square Root Decomposition',
    
    // Specific Problem Types
    'interval': 'Interval',
    'intervals': 'Interval',
    'range-query': 'Range Query',
    'range-update': 'Range Update',
    'simulation': 'Simulation',
    'implementation': 'Implementation',
    'ad-hoc': 'Ad Hoc',
    'constructive-algorithms': 'Constructive',
    'interactive': 'Interactive',
    
    // Database & SQL
    'database': 'Database',
    'sql': 'SQL',
    
    // Concurrency
    'concurrency': 'Concurrency',
    'multithreading': 'Multithreading',
    'parallel-computing': 'Parallel Computing',
    'locks': 'Locks',
    'semaphore': 'Semaphore',
    'deadlock': 'Deadlock',
    
    // Memory Management
    'memory': 'Memory',
    'garbage-collection': 'Garbage Collection',
    'memory-allocation': 'Memory Allocation',
    
    // Competitive Programming Specific
    'data-structures': 'Data Structures',
    'binary-lifting': 'Binary Lifting',
    'sparse-table': 'Sparse Table',
    'persistent-data-structures': 'Persistent Data Structures',
    'functional-programming': 'Functional Programming',
    
    // Special Categories
    'optimization': 'Optimization',
    'approximation': 'Approximation Algorithm',
    'randomized': 'Randomized Algorithm',
    'online-algorithm': 'Online Algorithm',
    'streaming': 'Streaming Algorithm',
    'parallel-algorithm': 'Parallel Algorithm',
    
    // Specific Data Structure Variants
    'deque': 'Deque',
    'double-ended-queue': 'Deque',
    'circular-queue': 'Circular Queue',
    'monotonic-stack': 'Monotonic Stack',
    'monotonic-queue': 'Monotonic Queue',
    'sparse-matrix': 'Sparse Matrix',
    
    // Problem-solving Techniques
    'meet-in-the-middle': 'Meet in the Middle',
    'discretization': 'Discretization',
    'matrix-exponentiation': 'Matrix Exponentiation',
    'inclusion-exclusion': 'Inclusion-Exclusion Principle',
    'pigeonhole-principle': 'Pigeonhole Principle',
    
    // Common abbreviations (unique ones)
    'lca': 'Lowest Common Ancestor',
    'rmq': 'Range Minimum Query',
    'gcd': 'Greatest Common Divisor',
    'lcm': 'Least Common Multiple',
    'kmp': 'KMP Algorithm',
    'fft': 'Fast Fourier Transform',
    'ntt': 'Number Theoretic Transform',
    'hld': 'Heavy-Light Decomposition',
    'lct': 'Link-Cut Tree',
    'pbds': 'Policy Based Data Structures',
    'stl': 'Standard Template Library'
  };

    return topics.map(topic => {
        const normalizedTopic = topic.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/_/g, '-')
        .replace(/[^\w-]/g, '');
        
        return topicMap[normalizedTopic] || topic;
    });
  }

}
