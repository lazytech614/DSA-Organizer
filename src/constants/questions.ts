import { Difficulty } from '@prisma/client';

export const DUMMY_QUESTIONS = [
  {
    title: "Two Sum",
    topics: ["Arrays", "Hash Table"],
    urls: [
      "https://leetcode.com/problems/two-sum/",
      "https://www.geeksforgeeks.org/given-an-array-a-and-a-number-x-check-for-pair-in-a-with-sum-as-x/"
    ],
    difficulty: Difficulty.EASY
  },
  {
    title: "Add Two Numbers",
    topics: ["Linked List", "Math", "Recursion"],
    urls: [
      "https://leetcode.com/problems/add-two-numbers/",
      "https://www.geeksforgeeks.org/add-two-numbers-represented-by-linked-lists/"
    ],
    difficulty: Difficulty.MEDIUM
  },
  {
    title: "Longest Substring Without Repeating Characters",
    topics: ["Hash Table", "String", "Sliding Window"],
    urls: [
      "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
      "https://www.geeksforgeeks.org/length-of-the-longest-substring-without-repeating-characters/"
    ],
    difficulty: Difficulty.MEDIUM
  },
  {
    title: "Median of Two Sorted Arrays",
    topics: ["Array", "Binary Search", "Divide and Conquer"],
    urls: [
      "https://leetcode.com/problems/median-of-two-sorted-arrays/",
      "https://www.geeksforgeeks.org/median-of-two-sorted-arrays-of-different-sizes/"
    ],
    difficulty: Difficulty.HARD
  },
  {
    title: "Valid Parentheses",
    topics: ["String", "Stack"],
    urls: [
      "https://leetcode.com/problems/valid-parentheses/",
      "https://www.geeksforgeeks.org/check-for-balanced-parentheses-in-an-expression/"
    ],
    difficulty: Difficulty.EASY
  }
];

export const TOPICS = [
  "Arrays", "Hash Table", "Linked List", "Math", "Recursion",
  "String", "Sliding Window", "Binary Search", "Divide and Conquer",
  "Stack", "Queue", "Tree", "Graph", "Dynamic Programming",
  "Greedy", "Backtracking", "Sorting", "Searching", "Two Pointers"
];

export const DIFFICULTY_COLORS = {
  EASY: "text-green-600 bg-green-100",
  MEDIUM: "text-yellow-600 bg-yellow-100",
  HARD: "text-red-600 bg-red-100"
};
