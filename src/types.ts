export type Operation = 'addition' | 'subtraction' | 'multiplication' | 'division' | 'roman' | 'clock' | 'series' | 'word-problems' | 'exam';

export interface Level {
  id: string;
  operation: Operation;
  title: string;
  description: string;
  difficulty: number; // 1 to 5
  requiredStars: number;
}

export interface UserProgress {
  stars: number;
  completedLevels: string[];
  currentLevelId: Record<Operation, string>;
}

export const LEVELS: Level[] = [
  // Addition
  { id: 'add-1', operation: 'addition', title: 'Counting Friends', description: 'Adding numbers up to 10', difficulty: 1, requiredStars: 0 },
  { id: 'add-2', operation: 'addition', title: 'Double Digits', description: 'Adding numbers up to 50', difficulty: 2, requiredStars: 5 },
  { id: 'add-multiple', operation: 'addition', title: 'Triple Threat', description: 'Adding three numbers together', difficulty: 2, requiredStars: 10 },
  { id: 'add-3', operation: 'addition', title: 'The Great Carry', description: 'Addition with carrying', difficulty: 3, requiredStars: 15 },
  
  // Subtraction
  { id: 'sub-1', operation: 'subtraction', title: 'Taking Away', description: 'Subtracting numbers up to 10', difficulty: 1, requiredStars: 0 },
  { id: 'sub-2', operation: 'subtraction', title: 'Bigger Gaps', description: 'Subtracting numbers up to 50', difficulty: 2, requiredStars: 5 },
  { id: 'sub-3', operation: 'subtraction', title: 'Borrowing Power', description: 'Subtraction with borrowing', difficulty: 3, requiredStars: 15 },

  // Multiplication
  { id: 'mul-1', operation: 'multiplication', title: 'Groups of Fun', description: 'Understanding multiplication as groups', difficulty: 1, requiredStars: 10 },
  { id: 'mul-2', operation: 'multiplication', title: 'Table Master', description: 'Multiplication tables 2, 5, and 10', difficulty: 2, requiredStars: 20 },
  { id: 'mul-3', operation: 'multiplication', title: 'The Grid', description: 'Multiplication up to 12x12', difficulty: 3, requiredStars: 30 },

  // Division
  { id: 'div-1', operation: 'division', title: 'Sharing is Caring', description: 'Basic division as sharing', difficulty: 1, requiredStars: 10 },
  { id: 'div-2', operation: 'division', title: 'Fair Splits', description: 'Division facts for 2, 5, and 10', difficulty: 2, requiredStars: 25 },
  { id: 'div-3', operation: 'division', title: 'Leftovers', description: 'Introduction to remainders', difficulty: 3, requiredStars: 40 },
  
  // Roman Numerals
  { id: 'rom-1', operation: 'roman', title: 'Ancient Symbols', description: 'Numbers I to X (1-10)', difficulty: 1, requiredStars: 0 },
  { id: 'rom-2', operation: 'roman', title: 'The Tens', description: 'Numbers up to L (50)', difficulty: 2, requiredStars: 10 },
  { id: 'rom-3', operation: 'roman', title: 'Centurion', description: 'Numbers up to C (100)', difficulty: 3, requiredStars: 25 },
  { id: 'rom-4', operation: 'roman', title: 'Ancient Translator', description: 'Convert Roman to Arabic numerals', difficulty: 3, requiredStars: 35 },
  
  // Clock
  { id: 'clk-1', operation: 'clock', title: 'The Big Hand', description: 'Reading hours (o\'clock)', difficulty: 1, requiredStars: 0 },
  { id: 'clk-2', operation: 'clock', title: 'Half and Quarter', description: 'Reading half past and quarter past', difficulty: 2, requiredStars: 10 },
  { id: 'clk-3', operation: 'clock', title: 'Minute Master', description: 'Reading time to the nearest 5 minutes', difficulty: 3, requiredStars: 25 },
  
  // Series and Sequence
  { id: 'ser-1', operation: 'series', title: 'Number Order', description: 'Arrange numbers from least to greatest', difficulty: 1, requiredStars: 5 },
  { id: 'ser-2', operation: 'series', title: 'What\'s Next?', description: 'Find the next number in a simple series', difficulty: 2, requiredStars: 15 },
  { id: 'ser-3', operation: 'series', title: 'Pattern Detective', description: 'Complex patterns and missing numbers', difficulty: 3, requiredStars: 30 },

  // Word Problems
  { id: 'wp-1', operation: 'word-problems', title: 'Market Day', description: 'Simple addition and subtraction stories', difficulty: 1, requiredStars: 5 },
  { id: 'wp-2', operation: 'word-problems', title: 'The Toy Shop', description: 'Multi-step problems with bigger numbers', difficulty: 2, requiredStars: 20 },
  { id: 'wp-3', operation: 'word-problems', title: 'Math Explorer', description: 'Advanced word problems with all operations', difficulty: 3, requiredStars: 40 },
  
  // Exam Practice
  { id: 'exam-1', operation: 'exam', title: 'Junior Exam', description: 'A mix of all easy questions (15-20 questions)', difficulty: 1, requiredStars: 10 },
  { id: 'exam-2', operation: 'exam', title: 'Senior Exam', description: 'A mix of all medium questions (15-20 questions)', difficulty: 2, requiredStars: 30 },
  { id: 'exam-3', operation: 'exam', title: 'Master Exam', description: 'The ultimate challenge (20 questions)', difficulty: 3, requiredStars: 60 },
];
