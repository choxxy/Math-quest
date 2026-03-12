export type Operation = 'addition' | 'subtraction' | 'multiplication' | 'division' | 'roman';

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
];
