export interface DifficultyCount {
  total: number;
  completed: number;
  percentage: number;
}

export interface CourseStatsData {
  total: DifficultyCount;
  easy: DifficultyCount;
  medium: DifficultyCount;
  hard: DifficultyCount;
}

export interface CircularProgressProps {
  percentage: number;
  size?: number;
  className?: string;
}

export interface DifficultyStatsProps {
  label: string;
  completed: number;
  total: number;
  percentage: number;
  color: string;
  variant?: 'desktop' | 'mobile';
}
