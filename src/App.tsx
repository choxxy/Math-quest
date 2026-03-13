import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Minus, X, Divide, 
  Star, Trophy, ChevronRight, 
  BookOpen, Play, CheckCircle2,
  ArrowLeft, RefreshCcw, Lightbulb, Check,
  Sparkles, Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GoogleGenAI } from "@google/genai";
import { LEVELS, Level, Operation, UserProgress } from './types';
import { cn } from './lib/utils';

// --- Components ---

const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
    <motion.div 
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      className="bg-emerald-500 h-full"
    />
  </div>
);

const toRoman = (num: number): string => {
  const lookup: { [key: string]: number } = {
    M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1
  };
  let roman = '';
  for (const i in lookup) {
    while (num >= lookup[i]) {
      roman += i;
      num -= lookup[i];
    }
  }
  return roman;
};

const VisualAid = ({ operation, num1, num2, num3 }: { operation: Operation, num1: number, num2: number, num3?: number }) => {
  if (operation === 'roman') {
    return (
      <div className="flex flex-col gap-4 items-center p-6 bg-white rounded-2xl border-2 border-dashed border-amber-100">
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-center gap-2">
            <div className="text-4xl font-black text-slate-800">{num1}</div>
            <div className="text-xs font-bold text-slate-400 uppercase">Number</div>
          </div>
          <div className="text-3xl font-bold text-slate-300">→</div>
          <div className="flex flex-col items-center gap-2">
            <div className="text-4xl font-black text-amber-600 font-serif">{toRoman(num1)}</div>
            <div className="text-xs font-bold text-slate-400 uppercase">Roman</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 justify-center max-w-[200px] pt-4 border-t border-slate-50 w-full">
          {Array.from({ length: num1 }).map((_, i) => (
            <div key={i} className="w-2 h-2 bg-amber-400 rounded-full" />
          ))}
        </div>
      </div>
    );
  }

  // Remove visual hints for numbers more than 20
  if (num1 > 20 || num2 > 20 || (num3 !== undefined && num3 > 20)) {
    return (
      <div className="flex items-center justify-center p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
        <p className="text-slate-400 font-medium italic text-sm">Time to use your mental math powers! 🧠</p>
      </div>
    );
  }

  const renderDots = (count: number, color: string) => {
    const tens = Math.floor(count / 10);
    const ones = count % 10;
    
    return (
      <div className="flex flex-col gap-1 items-start bg-slate-50/30 p-2 rounded-xl border border-slate-100 min-w-[80px]">
        {tens > 0 && (
          <div className="flex flex-col gap-1">
            {Array.from({ length: tens }).map((_, i) => (
              <div key={`tens-${i}`} className="flex flex-row gap-0.5 p-0.5 bg-white border border-slate-200 rounded-sm">
                {Array.from({ length: 10 }).map((_, j) => (
                  <div key={`ten-dot-${j}`} className={cn("w-1.5 h-1.5 rounded-full shadow-sm", color)} />
                ))}
              </div>
            ))}
          </div>
        )}
        {ones > 0 && (
          <div className="flex flex-row gap-0.5 p-0.5">
            {Array.from({ length: ones }).map((_, i) => (
              <div key={`ones-${i}`} className={cn("w-1.5 h-1.5 rounded-full shadow-sm", color)} />
            ))}
          </div>
        )}
        <div className="w-full text-right mt-1">
           <span className="text-[9px] font-bold text-slate-500">{count}</span>
        </div>
      </div>
    );
  };

  if (operation === 'addition') {
    return (
      <div className="flex flex-wrap gap-4 justify-center p-4 bg-white rounded-2xl border-2 border-dashed border-emerald-100">
        {renderDots(num1, "bg-orange-400")}
        <div className="flex items-center text-xl font-bold text-slate-400">+</div>
        {renderDots(num2, "bg-blue-400")}
        {num3 !== undefined && (
          <>
            <div className="flex items-center text-xl font-bold text-slate-400">+</div>
            {renderDots(num3, "bg-emerald-400")}
          </>
        )}
      </div>
    );
  }
  
  if (operation === 'multiplication') {
    return (
      <div className="flex flex-col gap-4 items-center p-4 bg-white rounded-2xl border-2 border-dashed border-purple-100">
        <div className="flex flex-wrap gap-3 justify-center">
          {Array.from({ length: num1 }).map((_, groupIdx) => (
            <div key={`group-${groupIdx}`} className="p-1.5 bg-purple-50 rounded-lg border border-purple-200 flex flex-wrap gap-0.5 w-12 h-12 items-center justify-center">
              {Array.from({ length: num2 }).map((_, itemIdx) => (
                <div key={`item-${groupIdx}-${itemIdx}`} className="w-2 h-2 bg-purple-500 rounded-sm" />
              ))}
            </div>
          ))}
        </div>
        <p className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">{num1} groups of {num2}</p>
      </div>
    );
  }

  if (operation === 'subtraction') {
    const tens = Math.floor(num1 / 10);
    const ones = num1 % 10;
    
    return (
      <div className="flex flex-col gap-4 items-center p-4 bg-white rounded-2xl border-2 border-dashed border-red-100">
        <div className="flex flex-col gap-2 justify-center items-start">
          {/* Tens rows */}
          {tens > 0 && (
            <div className="flex flex-col gap-1">
              {Array.from({ length: tens }).map((_, i) => {
                const isSubtracted = (tens - i) * 10 <= num2;
                return (
                  <div key={`tens-rod-${i}`} className={cn(
                    "flex flex-row gap-0.5 p-0.5 rounded-sm border transition-all",
                    isSubtracted ? "bg-red-50 border-red-200 opacity-40" : "bg-white border-slate-200"
                  )}>
                    {Array.from({ length: 10 }).map((_, j) => (
                      <div key={`dot-${j}`} className={cn("w-1.5 h-1.5 rounded-full", isSubtracted ? "bg-red-200" : "bg-red-400")} />
                    ))}
                  </div>
                );
              })}
            </div>
          )}
          {/* Ones units */}
          {ones > 0 && (
            <div className="flex flex-row gap-0.5 p-0.5">
              {Array.from({ length: ones }).map((_, i) => {
                const remainingSub = Math.max(0, num2 - (tens * 10));
                const isSub = i >= (ones - remainingSub);
                return (
                  <div key={`ones-unit-${i}`} className={cn(
                    "w-3 h-3 rounded-full flex items-center justify-center transition-all",
                    isSub ? "bg-red-50 border border-red-200 opacity-80" : "bg-red-400"
                  )}>
                    {isSub && <X className="w-2 h-2 text-red-500" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase">Start with {num1}, take away {num2}</p>
      </div>
    );
  }

  if (operation === 'division') {
    const quotient = Math.floor(num1 / num2);
    const remainder = num1 % num2;
    
    return (
      <div className="flex flex-col gap-8 items-center p-6 bg-white rounded-2xl border-2 border-dashed border-cyan-100">
        <div className="flex flex-wrap gap-6 justify-center">
          {Array.from({ length: num2 }).map((_, groupIdx) => (
            <div key={`div-group-${groupIdx}`} className="relative group">
              <div className="w-24 h-24 rounded-full border-2 border-cyan-200 bg-cyan-50/30 flex flex-wrap gap-1 items-center justify-center p-3 transition-transform group-hover:scale-105">
                 {Array.from({ length: quotient }).map((_, itemIdx) => (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: itemIdx * 0.05 }}
                    key={`div-item-${groupIdx}-${itemIdx}`} 
                    className="w-4 h-4 bg-cyan-500 rounded-full shadow-sm" 
                  />
                ))}
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-2 border border-cyan-100 rounded-full text-[10px] font-bold text-cyan-600 shadow-sm">
                Group {groupIdx + 1}
              </div>
            </div>
          ))}
        </div>

        {remainder > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full pt-6 border-t border-cyan-50 flex flex-col items-center gap-3"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-orange-600 uppercase tracking-[0.2em]">The Remainders (Leftovers)</span>
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
            </div>
            <div className="flex flex-wrap gap-2 justify-center p-4 bg-orange-50 rounded-2xl border border-orange-100 min-w-[200px]">
              {Array.from({ length: remainder }).map((_, i) => (
                <motion.div 
                  initial={{ rotate: -20, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: i * 0.1, type: 'spring' }}
                  key={`rem-${i}`} 
                  className="w-6 h-6 bg-orange-400 rounded-full shadow-md flex items-center justify-center text-[10px] text-white font-bold"
                >
                  !
                </motion.div>
              ))}
            </div>
            <p className="text-[10px] text-orange-500 font-medium italic">These {remainder} couldn't be shared fairly!</p>
          </motion.div>
        )}
      </div>
    );
  }

  return null;
};

const INTRO_LINKS: Record<Operation, string> = {
  addition: 'https://www.youtube.com/watch?v=uRoJ5E-x97I',
  subtraction: 'https://www.youtube.com/watch?v=qM7B2nwpV1M',
  multiplication: 'https://www.youtube.com/watch?v=eW2dRLyoyds',
  division: 'https://www.youtube.com/watch?v=rGMecZ_aERo',
  roman: 'https://www.youtube.com/watch?v=z1UmAgekzbs'
};

const OP_DETAILS: Record<Operation, {
  examples: { q: string, a: string, explanation: string }[],
  tips: string[],
  realWorld: string
}> = {
  addition: {
    examples: [
      { q: "5 + 3", a: "8", explanation: "Start at 5, count 3 more: 6, 7, 8!" },
      { q: "12 + 7", a: "19", explanation: "Add the ones: 2 + 7 = 9. Keep the ten: 19!" }
    ],
    tips: [
      "Use your fingers for small numbers!",
      "Break big numbers into Tens and Ones.",
      "Look for 'number bonds' that make 10 (like 7+3 or 6+4)."
    ],
    realWorld: "Used for counting money, sharing toys, and adding up scores in games!"
  },
  subtraction: {
    examples: [
      { q: "10 - 4", a: "6", explanation: "Start at 10, count back 4: 9, 8, 7, 6!" },
      { q: "15 - 6", a: "9", explanation: "Take away 5 to get to 10, then take away 1 more to get 9." }
    ],
    tips: [
      "Think of it as 'counting on' from the smaller number.",
      "If you have 15 - 9, try 15 - 10 and then add 1 back!",
      "Draw dots and cross them out to see what's left."
    ],
    realWorld: "Used for calculating change at a shop, counting down days to your birthday, or seeing how many cookies are left!"
  },
  multiplication: {
    examples: [
      { q: "3 × 4", a: "12", explanation: "3 groups of 4: 4 + 4 + 4 = 12." },
      { q: "5 × 2", a: "10", explanation: "5 groups of 2: 2, 4, 6, 8, 10!" }
    ],
    tips: [
      "Any number times 0 is always 0!",
      "Any number times 1 is just itself.",
      "Multiplying by 2 is the same as doubling the number."
    ],
    realWorld: "Used for buying multiple items of the same price, or finding the total number of legs on 5 dogs!"
  },
  division: {
    examples: [
      { q: "12 ÷ 3", a: "4", explanation: "Share 12 into 3 equal groups. Each group gets 4." },
      { q: "10 ÷ 2", a: "5", explanation: "What number doubled makes 10? It's 5!" }
    ],
    tips: [
      "Think: 'How many of the small number fit into the big one?'",
      "Division is the opposite of multiplication!",
      "If you can't share equally, the leftovers are called 'Remainders'."
    ],
    realWorld: "Used for sharing pizza slices fairly, or splitting a class into equal teams for sports!"
  },
  roman: {
    examples: [
      { q: "VII", a: "7", explanation: "V (5) + I (1) + I (1) = 7." },
      { q: "IX", a: "9", explanation: "I (1) before X (10) means 10 - 1 = 9." }
    ],
    tips: [
      "I, V, X are the most important symbols to remember.",
      "If a smaller symbol is on the right, ADD it.",
      "If a smaller symbol is on the left, SUBTRACT it."
    ],
    realWorld: "Used on fancy clocks, at the end of movie credits, and in some book chapters!"
  }
};

// --- Main App ---

export default function App() {
  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('mathquest_progress');
    return saved ? JSON.parse(saved) : {
      stars: 0,
      completedLevels: [],
      currentLevelId: {
        addition: 'add-1',
        subtraction: 'sub-1',
        multiplication: 'mul-1',
        division: 'div-1',
        roman: 'rom-1'
      }
    };
  });

  const [activeLevel, setActiveLevel] = useState<Level | null>(null);
  const [selectedOp, setSelectedOp] = useState<Operation | null>(null);
  const [currentDifficulty, setCurrentDifficulty] = useState(1);
  const [gameState, setGameState] = useState<'menu' | 'lesson' | 'practice' | 'complete' | 'op-info'>('menu');
  const [question, setQuestion] = useState<{ n1: number, n2: number, answer: number, options: number[] } | null>(null);
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong', message: string } | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [aiHint, setAiHint] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiPane, setShowAiPane] = useState(false);

  useEffect(() => {
    localStorage.setItem('mathquest_progress', JSON.stringify(progress));
  }, [progress]);

  const getAIHint = async () => {
    if (!activeLevel || !question) return;
    
    setIsAiLoading(true);
    setShowAiPane(true);
    setAiHint(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const opSymbol = activeLevel.operation === 'addition' ? '+' : 
                      activeLevel.operation === 'subtraction' ? '-' : 
                      activeLevel.operation === 'multiplication' ? '×' : 
                      activeLevel.operation === 'division' ? '÷' : '';
      
      const prompt = activeLevel.operation === 'roman' 
        ? `The student needs to convert the number ${question.n1} into Roman Numerals. Provide a helpful hint and a brief explanation of how Roman Numerals work for this specific number. CRITICAL: Do NOT give the direct answer. Use simple language and emojis. Keep it short.`
        : `The student is working on a ${activeLevel.operation} problem: ${question.n1} ${opSymbol} ${question.n2}. Provide a helpful hint and a brief explanation to help them solve it. CRITICAL: Do NOT give the direct answer. Use simple language and emojis. Keep it short.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      
      setAiHint(response.text || "I'm thinking... try visualizing the numbers!");
    } catch (error) {
      console.error("AI Hint Error:", error);
      setAiHint("Oops! My magic wand is a bit dusty. Try counting carefully!");
    } finally {
      setIsAiLoading(false);
    }
  };

  const generateQuestion = (level: Level, diff: number) => {
    let n1 = 0, n2 = 0, n3 = 0, answer = 0;
    // diff is 1, 2, or 3

    if (level.id === 'add-multiple') {
      n1 = Math.floor(Math.random() * 10) + 1;
      n2 = Math.floor(Math.random() * 10) + 1;
      n3 = Math.floor(Math.random() * 10) + 1;
      answer = n1 + n2 + n3;
      
      const options = new Set<number>([answer]);
      while (options.size < 4) {
        const offset = Math.floor(Math.random() * 10) - 5;
        const wrong = answer + (offset === 0 ? 1 : offset);
        if (wrong >= 0) options.add(wrong);
      }

      setQuestion({
        n1, n2, n3, answer,
        options: Array.from(options).sort(() => Math.random() - 0.5)
      } as any);
      setShowHint(false);
      return;
    }

    switch (level.operation) {
      case 'addition':
        n1 = Math.floor(Math.random() * (10 * diff)) + 1;
        n2 = Math.floor(Math.random() * (10 * diff)) + 1;
        answer = n1 + n2;
        break;
      case 'subtraction':
        n1 = Math.floor(Math.random() * (10 * diff)) + 5;
        n2 = Math.floor(Math.random() * n1) + 1;
        answer = n1 - n2;
        break;
      case 'multiplication':
        n1 = Math.floor(Math.random() * (diff === 1 ? 5 : 12)) + 1;
        n2 = Math.floor(Math.random() * (diff === 1 ? 5 : 12)) + 1;
        answer = n1 * n2;
        break;
      case 'division':
        n2 = Math.floor(Math.random() * (diff === 1 ? 5 : 10)) + 1;
        const baseAnswer = Math.floor(Math.random() * (diff === 1 ? 5 : 10)) + 1;
        n1 = n2 * baseAnswer;
        
        // Add remainders for the "Leftovers" level
        if (level.id === 'div-3') {
          const remainder = Math.floor(Math.random() * (n2 - 1)) + 1;
          n1 += remainder;
        }
        
        answer = Math.floor(n1 / n2);
        break;
      case 'roman':
        if (level.id === 'rom-1') n1 = Math.floor(Math.random() * 10) + 1;
        else if (level.id === 'rom-2') n1 = Math.floor(Math.random() * 40) + 10;
        else n1 = Math.floor(Math.random() * 90) + 10;
        answer = n1; // The "answer" is the number, but we'll show Roman options
        break;
    }

    const options = new Set<number>([answer]);
    while (options.size < 4) {
      const offset = Math.floor(Math.random() * 10) - 5;
      const wrong = answer + (offset === 0 ? 1 : offset);
      if (wrong >= 0) options.add(wrong);
    }

    setQuestion({
      n1, n2, answer,
      options: Array.from(options).sort(() => Math.random() - 0.5)
    });
    setShowHint(false);
  };

  const startLevel = (level: Level) => {
    setActiveLevel(level);
    setCurrentDifficulty(level.difficulty);
    setGameState('lesson');
    setScore(0);
    setQuestionCount(0);
  };

  const startPractice = () => {
    if (!activeLevel) return;
    setScore(0);
    setQuestionCount(0);
    setGameState('practice');
    generateQuestion(activeLevel, currentDifficulty);
  };

  const changeDifficulty = (newDiff: number) => {
    if (!activeLevel || feedback) return;
    setCurrentDifficulty(newDiff);
    generateQuestion(activeLevel, newDiff);
    setScore(0);
    setQuestionCount(0);
  };

  const handleAnswer = (selected: number) => {
    if (!question || feedback) return;

    const correctMessages = [
      "Spot on! You're a math wizard! 🧙‍♂️",
      "Amazing! Your brain is growing! 🌱",
      "Correct! You're on fire! 🔥",
      "Boom! That's exactly right! 💥",
      "Superb! Keep up the great work! 🌟"
    ];

    const wrongMessages = [
      "Almost! Take another look at the numbers. 🧐",
      "Nice try! Every mistake is a chance to learn! 💡",
      "Not quite, but you're getting closer! 🚀",
      "Whoops! Let's try to visualize it next time. 🍕",
      "Keep going! You'll get the next one! 💪"
    ];

    if (selected === question.answer) {
      setScore(s => s + 1);
      const msg = correctMessages[Math.floor(Math.random() * correctMessages.length)];
      setFeedback({ type: 'correct', message: msg });
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#f59e0b']
      });
    } else {
      const msg = wrongMessages[Math.floor(Math.random() * wrongMessages.length)];
      setFeedback({ type: 'wrong', message: `${msg} (The answer was ${question.answer})` });
    }

    setTimeout(() => {
      setFeedback(null);
      if (questionCount + 1 >= 5) {
        completeLevel();
      } else {
        setQuestionCount(q => q + 1);
        generateQuestion(activeLevel!, currentDifficulty);
      }
    }, 2500);
  };

  const completeLevel = () => {
    if (!activeLevel) return;
    
    const earnedStars = score >= 4 ? 3 : score >= 3 ? 2 : 1;
    
    setProgress(prev => {
      const isNewCompletion = !prev.completedLevels.includes(activeLevel.id);
      return {
        ...prev,
        stars: prev.stars + (isNewCompletion ? earnedStars : 0),
        completedLevels: isNewCompletion ? [...prev.completedLevels, activeLevel.id] : prev.completedLevels
      };
    });
    
    setGameState('complete');
  };

  const getOpIcon = (op: Operation) => {
    switch (op) {
      case 'addition': return <Plus className="w-6 h-6" />;
      case 'subtraction': return <Minus className="w-6 h-6" />;
      case 'multiplication': return <X className="w-6 h-6" />;
      case 'division': return <Divide className="w-6 h-6" />;
      case 'roman': return <span className="text-xl font-serif font-black">IV</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-slate-900 font-sans selection:bg-emerald-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200/50">
            <BookOpen className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">MathQuest</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-full border border-amber-100">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span className="font-bold text-amber-700">{progress.stars}</span>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
            <Trophy className="w-5 h-5 text-emerald-500" />
            <span className="font-bold text-emerald-700">{progress.completedLevels.length}</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 pb-24">
        <AnimatePresence mode="wait">
          {gameState === 'menu' && (
            <motion.div 
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <section className="text-center space-y-4 py-8">
                <h2 className="text-4xl font-bold text-slate-900 tracking-tight">Welcome back, Explorer!</h2>
                <p className="text-slate-500 text-lg max-w-md mx-auto">Choose an adventure to start learning math today.</p>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(['addition', 'subtraction', 'multiplication', 'division', 'roman'] as Operation[]).map((op) => {
                  const opLevels = LEVELS.filter(l => l.operation === op);
                  const completedInOp = opLevels.filter(l => progress.completedLevels.includes(l.id)).length;
                  
                  return (
                    <div key={op} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6">
                      <div className="flex items-center justify-between">
                        <div className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg",
                          op === 'addition' ? "bg-emerald-500 shadow-emerald-100" :
                          op === 'subtraction' ? "bg-rose-500 shadow-rose-100" :
                          op === 'multiplication' ? "bg-purple-500 shadow-purple-100" :
                          op === 'division' ? "bg-cyan-500 shadow-cyan-100" :
                          "bg-amber-500 shadow-amber-100"
                        )}>
                          {getOpIcon(op)}
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Progress</p>
                          <p className="text-lg font-bold text-slate-700">{completedInOp}/{opLevels.length}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-2xl font-bold capitalize">{op}</h3>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOp(op);
                              setGameState('op-info');
                            }}
                            className={cn(
                              "text-xs font-bold flex items-center gap-1 px-3 py-1 rounded-full border transition-all",
                              op === 'addition' ? "text-emerald-600 border-emerald-100 hover:bg-emerald-50" :
                              op === 'subtraction' ? "text-rose-600 border-rose-100 hover:bg-rose-50" :
                              op === 'multiplication' ? "text-purple-600 border-purple-100 hover:bg-purple-50" :
                              op === 'division' ? "text-cyan-600 border-cyan-100 hover:bg-cyan-50" :
                              "text-amber-600 border-amber-100 hover:bg-amber-50"
                            )}
                          >
                            <BookOpen className="w-3 h-3" /> Learn More
                          </button>
                        </div>
                        <ProgressBar progress={(completedInOp / opLevels.length) * 100} />
                      </div>

                      <div className="space-y-3 pt-4">
                        {opLevels.map((level) => {
                          const isLocked = progress.stars < level.requiredStars;
                          const isCompleted = progress.completedLevels.includes(level.id);
                          
                          return (
                            <button
                              key={level.id}
                              disabled={isLocked}
                              onClick={() => startLevel(level)}
                              className={cn(
                                "w-full flex items-center justify-between p-4 rounded-2xl transition-all group",
                                isLocked ? "bg-slate-50 opacity-50 cursor-not-allowed" : 
                                isCompleted ? "bg-emerald-50 border border-emerald-100 hover:bg-emerald-100" :
                                "bg-slate-50 hover:bg-slate-100 border border-transparent"
                              )}
                            >
                              <div className="flex items-center gap-4 text-left">
                                <div className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center",
                                  isCompleted ? "bg-emerald-500 text-white" : "bg-white text-slate-400"
                                )}>
                                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Play className="w-4 h-4 ml-0.5" />}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-700">{level.title}</p>
                                  <p className="text-xs text-slate-500">{level.description}</p>
                                </div>
                              </div>
                              {isLocked && (
                                <div className="flex items-center gap-1 text-amber-600 font-bold text-xs">
                                  <Star className="w-3 h-3 fill-amber-500" />
                                  {level.requiredStars}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {gameState === 'lesson' && activeLevel && (
            <motion.div 
              key="lesson"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="max-w-2xl mx-auto space-y-8"
            >
              <button 
                onClick={() => setGameState('menu')}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Map
              </button>

              <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100 space-y-8">
                <div className="space-y-2 text-center">
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-[0.2em]">Lesson Time</span>
                  <h2 className="text-4xl font-black text-slate-900">{activeLevel.title}</h2>
                  <p className="text-slate-500 text-lg">{activeLevel.description}</p>
                    <div className="pt-2">
                      <button 
                        onClick={() => {
                          setSelectedOp(activeLevel.operation);
                          setGameState('op-info');
                        }}
                        className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <BookOpen className="w-4 h-4" /> About {activeLevel.operation}
                      </button>
                    </div>
                </div>

                <div className="space-y-6">
                  <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 text-center">Visual Example</h4>
                    <VisualAid 
                      operation={activeLevel.operation} 
                      num1={activeLevel.difficulty > 1 ? 24 : (activeLevel.operation === 'division' ? 12 : 4)} 
                      num2={activeLevel.difficulty > 1 ? 12 : (activeLevel.operation === 'division' ? 3 : 3)} 
                    />
                  </div>

                  <div className="prose prose-slate max-w-none">
                    <div className="text-lg text-slate-600 leading-relaxed space-y-4">
                      {activeLevel.operation === 'addition' && (
                        <div className="space-y-6">
                          <div className="flex items-center gap-4 bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                            <div className="text-4xl">🤝</div>
                            <div>
                              <p className="font-bold text-emerald-900">Addition is like a Party!</p>
                              <p className="text-sm text-emerald-700">When we add, we bring different groups together to see the big total.</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-4">
                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                              <h5 className="font-bold text-slate-800 flex items-center gap-2">
                                <span className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs">1</span>
                                Start with a group
                              </h5>
                              <div className="flex gap-1">
                                {Array.from({ length: 3 }).map((_, i) => (
                                  <motion.div key={i} animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, delay: i * 0.2 }} className="w-4 h-4 bg-orange-400 rounded-full" />
                                ))}
                              </div>
                              <p className="text-xs text-slate-500">Here are 3 orange dots.</p>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                              <h5 className="font-bold text-slate-800 flex items-center gap-2">
                                <span className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs">2</span>
                                Add more friends!
                              </h5>
                              <div className="flex gap-1">
                                {Array.from({ length: 2 }).map((_, i) => (
                                  <motion.div key={i} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 + i * 0.2 }} className="w-4 h-4 bg-blue-400 rounded-full" />
                                ))}
                              </div>
                              <p className="text-xs text-slate-500">2 blue dots join the party!</p>
                            </div>

                            <div className="bg-emerald-500 p-5 rounded-2xl text-white shadow-lg shadow-emerald-100 space-y-1">
                              <p className="text-xs font-bold uppercase tracking-widest opacity-80">The Result</p>
                              <p className="text-2xl font-black">3 + 2 = 5!</p>
                              <p className="text-sm opacity-90">Count them all: 1, 2, 3, 4, 5!</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeLevel.operation === 'subtraction' && (
                        <div className="space-y-6">
                          <div className="flex items-center gap-4 bg-rose-50 p-4 rounded-2xl border border-rose-100">
                            <div className="text-4xl">🍪</div>
                            <div>
                              <p className="font-bold text-rose-900">The Cookie Mystery!</p>
                              <p className="text-sm text-rose-700">Subtraction is when we have a group, and some go away. How many are left?</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-4">
                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                              <h5 className="font-bold text-slate-800 flex items-center gap-2">
                                <span className="w-6 h-6 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-xs">1</span>
                                Start with the total
                              </h5>
                              <div className="flex gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <div key={i} className="w-4 h-4 bg-rose-400 rounded-full" />
                                ))}
                              </div>
                              <p className="text-xs text-slate-500">We have 5 yummy cookies.</p>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                              <h5 className="font-bold text-slate-800 flex items-center gap-2">
                                <span className="w-6 h-6 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-xs">2</span>
                                Someone takes some!
                              </h5>
                              <div className="flex gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <div key={i} className="relative">
                                    <div className="w-4 h-4 bg-rose-400 rounded-full" />
                                    {i >= 3 && (
                                      <motion.div 
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-full"
                                      >
                                        <X className="w-3 h-3 text-rose-600" />
                                      </motion.div>
                                    )}
                                  </div>
                                ))}
                              </div>
                              <p className="text-xs text-slate-500">Oh no! 2 cookies were eaten!</p>
                            </div>

                            <div className="bg-rose-500 p-5 rounded-2xl text-white shadow-lg shadow-rose-100 space-y-1">
                              <p className="text-xs font-bold uppercase tracking-widest opacity-80">What's Left?</p>
                              <p className="text-2xl font-black">5 - 2 = 3!</p>
                              <p className="text-sm opacity-90">Only 3 cookies are left for us!</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeLevel.operation === 'multiplication' && (
                        <div className="space-y-6">
                          <div className="flex items-center gap-4 bg-purple-50 p-4 rounded-2xl border border-purple-100">
                            <div className="text-4xl">🚀</div>
                            <div>
                              <p className="font-bold text-purple-900">Multiplication is Super-Speed!</p>
                              <p className="text-sm text-purple-700">It's a fast way to add the same number many times.</p>
                            </div>
                          </div>

                          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                            <p className="text-slate-600">Think of <span className="font-bold text-purple-600">3 × 2</span> as:</p>
                            <div className="flex justify-center gap-4">
                              {[1, 2, 3].map(g => (
                                <motion.div 
                                  key={g}
                                  whileHover={{ scale: 1.1 }}
                                  className="p-3 bg-purple-50 rounded-xl border border-purple-100 flex gap-1"
                                >
                                  <div className="w-3 h-3 bg-purple-500 rounded-full" />
                                  <div className="w-3 h-3 bg-purple-500 rounded-full" />
                                </motion.div>
                              ))}
                            </div>
                            <p className="text-center text-sm font-medium text-slate-500">"3 groups of 2"</p>
                            <div className="pt-4 border-t border-slate-50 text-center">
                              <p className="text-2xl font-black text-purple-600">2 + 2 + 2 = 6</p>
                              <p className="text-xs text-slate-400 uppercase font-bold">is the same as</p>
                              <p className="text-3xl font-black text-slate-800">3 × 2 = 6</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeLevel.operation === 'division' && (
                        <div className="space-y-6">
                          <div className="flex items-center gap-4 bg-cyan-50 p-4 rounded-2xl border border-cyan-100">
                            <div className="text-4xl">🍕</div>
                            <div>
                              <p className="font-bold text-cyan-900">The Pizza Party!</p>
                              <p className="text-sm text-cyan-700">Division is sharing fairly so everyone gets the same amount.</p>
                            </div>
                          </div>

                          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                            <div className="space-y-2">
                              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">The Challenge:</p>
                              <p className="text-lg font-medium text-slate-700">Share 6 slices with 2 friends!</p>
                            </div>

                            <div className="flex justify-around items-start gap-4">
                              {[1, 2].map(f => (
                                <div key={f} className="flex flex-col items-center gap-3">
                                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-2xl">👤</div>
                                  <div className="flex flex-wrap gap-1 justify-center max-w-[60px]">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                      <motion.div 
                                        key={i}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: i * 0.2 }}
                                        className="w-3 h-3 bg-cyan-500 rounded-sm rotate-45" 
                                      />
                                    ))}
                                  </div>
                                  <p className="text-xs font-bold text-cyan-600">3 slices</p>
                                </div>
                              ))}
                            </div>

                            <div className="pt-4 border-t border-slate-50 text-center space-y-1">
                              <p className="text-3xl font-black text-cyan-600">6 ÷ 2 = 3</p>
                              <p className="text-sm text-slate-500 italic">Everyone is happy and full! 😋</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeLevel.operation === 'roman' && (
                        <div className="space-y-6">
                          <div className="flex items-center gap-4 bg-amber-50 p-4 rounded-2xl border border-amber-100">
                            <div className="text-4xl">🏛️</div>
                            <div>
                              <p className="font-bold text-amber-900">The Secret Roman Code!</p>
                              <p className="text-sm text-amber-700">Long ago, people used letters to write numbers. Let's crack the code!</p>
                            </div>
                          </div>

                          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                            <div className="grid grid-cols-3 gap-3">
                              {[
                                { s: 'I', v: 1, e: '☝️' },
                                { s: 'V', v: 5, e: '🖐️' },
                                { s: 'X', v: 10, e: '👐' }
                              ].map(item => (
                                <div key={item.s} className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-center space-y-1">
                                  <div className="text-xl">{item.e}</div>
                                  <div className="text-2xl font-serif font-black text-amber-700">{item.s}</div>
                                  <div className="text-xs font-bold text-slate-400">is {item.v}</div>
                                </div>
                              ))}
                            </div>

                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">The Magic Rule:</p>
                              <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100">
                                <div className="text-center">
                                  <p className="text-lg font-serif font-bold">VI</p>
                                  <p className="text-[10px] text-slate-400">5 + 1</p>
                                  <p className="text-xs font-bold text-emerald-600">6</p>
                                </div>
                                <div className="text-slate-300">vs</div>
                                <div className="text-center">
                                  <p className="text-lg font-serif font-bold">IV</p>
                                  <p className="text-[10px] text-slate-400">5 - 1</p>
                                  <p className="text-xs font-bold text-rose-600">4</p>
                                </div>
                              </div>
                              <p className="text-[10px] text-slate-500 italic text-center">If the small letter is first, we subtract!</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={startPractice}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-6 rounded-2xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-3 text-xl group"
                >
                  Start Practice <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}

          {gameState === 'practice' && question && activeLevel && (
            <motion.div 
              key="practice"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="max-w-2xl mx-auto space-y-8"
            >
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "w-10 h-2 rounded-full transition-all duration-500",
                        i < questionCount ? "bg-emerald-500" : "bg-slate-200"
                      )} 
                    />
                  ))}
                </div>
                
                <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Difficulty:</span>
                  {[1, 2, 3].map((d) => (
                    <button
                      key={d}
                      onClick={() => changeDifficulty(d)}
                      className={cn(
                        "px-3 py-1 rounded-lg text-xs font-bold transition-all",
                        currentDifficulty === d 
                          ? "bg-emerald-500 text-white shadow-md shadow-emerald-100" 
                          : "text-slate-400 hover:bg-slate-50"
                      )}
                    >
                      {d === 1 ? 'Easy' : d === 2 ? 'Medium' : 'Hard'}
                    </button>
                  ))}
                </div>

                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                  Score: {score}/5
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100 space-y-12 relative overflow-hidden">
                {/* Visual Aid in Practice - Hidden until requested */}
                <AnimatePresence>
                  {showHint && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="py-4">
                        <VisualAid 
                          operation={activeLevel.operation} 
                          num1={question.n1} 
                          num2={question.n2} 
                          num3={(question as any).n3} 
                        />
                      </div>
                      
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-amber-50 p-4 rounded-2xl border border-amber-100 text-amber-800 font-medium text-sm text-center mb-8"
                      >
                        {activeLevel.operation === 'addition' && "Count all the circles together to find the total!"}
                        {activeLevel.operation === 'subtraction' && "Count the red circles that are left behind!"}
                        {activeLevel.operation === 'multiplication' && `Count how many groups of ${question.n2} there are!`}
                        {activeLevel.operation === 'division' && "Count how many dots are in each big circle!"}
                        {activeLevel.operation === 'roman' && "Look at the symbols: I=1, V=5, X=10. Combine them to make the number!"}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="text-center space-y-8">
                  {activeLevel.operation === 'roman' ? (
                    <div className="space-y-4">
                      <p className="text-xl font-bold text-slate-500 uppercase tracking-widest">What is this number in Roman Numerals?</p>
                      <div className="text-8xl font-black text-slate-800">{question.n1}</div>
                    </div>
                  ) : activeLevel.operation !== 'division' && (question.n1 > 9 || question.n2 > 9 || (question as any).n3 !== undefined) ? (
                    <div className="flex flex-col items-center">
                      <div className="inline-flex flex-col items-end gap-2 text-7xl font-black text-slate-800 font-mono tracking-tighter">
                        <div className="px-2">{question.n1}</div>
                        {(question as any).n3 !== undefined ? (
                          <>
                            <div className="px-2">{question.n2}</div>
                            <div className="flex items-center gap-6 border-b-8 border-slate-800 pb-2 px-2">
                              <span className="text-emerald-500 text-5xl">+</span>
                              <span>{(question as any).n3}</span>
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center gap-6 border-b-8 border-slate-800 pb-2 px-2">
                            <span className="text-emerald-500 text-5xl">
                              {activeLevel.operation === 'addition' && '+'}
                              {activeLevel.operation === 'subtraction' && '-'}
                              {activeLevel.operation === 'multiplication' && '×'}
                            </span>
                            <span>{question.n2}</span>
                          </div>
                        )}
                        <div className="text-slate-300 pt-4 px-2">?</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-8 text-7xl font-black text-slate-800">
                      <span>{question.n1}</span>
                      <span className="text-emerald-500">
                        {activeLevel.operation === 'addition' && '+'}
                        {activeLevel.operation === 'subtraction' && '-'}
                        {activeLevel.operation === 'multiplication' && '×'}
                        {activeLevel.operation === 'division' && '÷'}
                      </span>
                      <span>{question.n2}</span>
                      {(question as any).n3 !== undefined && (
                        <>
                          <span className="text-emerald-500">+</span>
                          <span>{(question as any).n3}</span>
                        </>
                      )}
                      <span className="text-slate-300">=</span>
                      <span className="text-slate-300">?</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {question.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleAnswer(opt)}
                        disabled={!!feedback}
                        className={cn(
                          "py-8 rounded-3xl text-3xl font-bold transition-all border-2",
                          activeLevel.operation === 'roman' && "font-serif",
                          feedback?.type === 'correct' && opt === question.answer ? "bg-emerald-500 border-emerald-500 text-white scale-105" :
                          feedback?.type === 'wrong' && opt === question.answer ? "bg-emerald-500 border-emerald-500 text-white" :
                          feedback?.type === 'wrong' && opt !== question.answer ? "bg-slate-50 border-slate-100 opacity-50" :
                          "bg-white border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 text-slate-700 shadow-sm"
                        )}
                      >
                        {activeLevel.operation === 'roman' ? toRoman(opt) : opt}
                      </button>
                    ))}
                  </div>

                  {!feedback && !showHint && (
                    <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                      <button 
                        onClick={() => setShowHint(true)}
                        className="bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold text-sm px-6 py-3 rounded-full flex items-center gap-2 transition-all border border-slate-100"
                      >
                        <Lightbulb className="w-4 h-4 text-amber-500" /> Visual Hint
                      </button>
                      <button 
                        onClick={getAIHint}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-bold text-sm px-6 py-3 rounded-full flex items-center gap-2 transition-all border border-emerald-100"
                      >
                        <Sparkles className="w-4 h-4" /> AI Magic Hint
                      </button>
                    </div>
                  )}
                </div>

                <AnimatePresence>
                  {feedback && (
                    <motion.div 
                      initial={{ opacity: 0, y: 100 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0,
                        scale: [1, 1.05, 1],
                        rotate: feedback.type === 'wrong' ? [-1, 1, -1, 1, 0] : 0
                      }}
                      exit={{ opacity: 0, y: 100 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 300, 
                        damping: 20,
                        scale: { duration: 0.4 },
                        rotate: { duration: 0.4, repeat: feedback.type === 'wrong' ? 2 : 0 }
                      }}
                      className={cn(
                        "absolute inset-x-0 bottom-0 py-8 text-center font-bold text-xl shadow-2xl z-20",
                        feedback.type === 'correct' 
                          ? "bg-emerald-500 text-white border-t-4 border-emerald-400" 
                          : "bg-rose-500 text-white border-t-4 border-rose-400"
                      )}
                    >
                      <div className="flex items-center justify-center gap-3">
                        {feedback.type === 'correct' ? (
                          <Trophy className="w-8 h-8 text-amber-300 animate-bounce" />
                        ) : (
                          <div className="text-3xl animate-pulse">💡</div>
                        )}
                        {feedback.message}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {gameState === 'op-info' && selectedOp && (
            <motion.div 
              key="op-info"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="max-w-3xl mx-auto space-y-8"
            >
              <button 
                onClick={() => setGameState('menu')}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Map
              </button>

              <div className="bg-white rounded-[2.5rem] p-12 shadow-xl border border-slate-100 space-y-10">
                <div className="flex items-center gap-6">
                  <div className={cn(
                    "w-20 h-20 rounded-3xl flex items-center justify-center text-white shadow-2xl",
                    selectedOp === 'addition' ? "bg-emerald-500" :
                    selectedOp === 'subtraction' ? "bg-rose-500" :
                    selectedOp === 'multiplication' ? "bg-purple-500" :
                    selectedOp === 'division' ? "bg-cyan-500" :
                    "bg-amber-500"
                  )}>
                    {getOpIcon(selectedOp)}
                  </div>
                  <div>
                    <h2 className="text-4xl font-black capitalize text-slate-900">{selectedOp}</h2>
                    <p className="text-slate-500 text-lg">Mastering the art of {selectedOp}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-slate-400" />
                        What is it?
                      </h3>
                      <div className="prose prose-slate text-slate-600 leading-relaxed">
                        {selectedOp === 'addition' && "Addition is the foundation of all math. It's how we combine values to find a total. Whether you're counting toys or calculating rocket trajectories, it all starts with plus!"}
                        {selectedOp === 'subtraction' && "Subtraction helps us find the difference between two amounts. It's essential for understanding change, distance, and how much is left after something is taken away."}
                        {selectedOp === 'multiplication' && "Multiplication is like a superpower for addition. Instead of adding one by one, we add in groups! It's the key to understanding area, volume, and scaling."}
                        {selectedOp === 'division' && "Division is the art of fair sharing. It helps us split resources equally and understand how many times one number fits into another. It's the opposite of multiplication!"}
                        {selectedOp === 'roman' && "Roman Numerals take us back to ancient history. Learning them helps us understand different ways of thinking about numbers and is still used today on clocks, in books, and for special events!"}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-amber-500" />
                        Solving Tips
                      </h3>
                      <ul className="space-y-3">
                        {OP_DETAILS[selectedOp].tips.map((tip, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                            <div className="w-5 h-5 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0 mt-0.5">
                              <Check className="w-3 h-3" />
                            </div>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 space-y-6">
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Common Examples</h3>
                      <div className="space-y-4">
                        {OP_DETAILS[selectedOp].examples.map((ex, i) => (
                          <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-black text-slate-800">{ex.q} = {ex.a}</span>
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Example</span>
                            </div>
                            <p className="text-xs text-slate-500 italic">{ex.explanation}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-indigo-50 rounded-3xl p-8 border border-indigo-100 space-y-3">
                      <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest">In the Real World</h3>
                      <p className="text-sm text-indigo-900 leading-relaxed">
                        {OP_DETAILS[selectedOp].realWorld}
                      </p>
                    </div>

                    <div className="bg-amber-50 rounded-3xl p-8 border border-amber-100 space-y-3">
                      <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest">Fun Fact</h3>
                      <div className="text-amber-900 italic text-sm">
                        {selectedOp === 'addition' && "Did you know? The '+' sign was originally a shorthand for the Latin word 'et', which means 'and'!"}
                        {selectedOp === 'subtraction' && "The '-' sign first appeared in print in 1489 to indicate a deficit in weight!"}
                        {selectedOp === 'multiplication' && "The '×' symbol was chosen by William Oughtred in 1631 because it looked like a cross!"}
                        {selectedOp === 'division' && "The '÷' symbol is called an 'obelus'. It was first used for division in 1659!"}
                        {selectedOp === 'roman' && "Romans didn't have a symbol for zero. They used the word 'nulla' if they needed to say 'none'!"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100">
                  <h3 className="text-xl font-bold text-slate-800 mb-6">Learning Path</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {LEVELS.filter(l => l.operation === selectedOp).map((level, i) => (
                      <div key={level.id} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                          {i + 1}
                        </div>
                        <p className="font-bold text-slate-700 text-sm">{level.title}</p>
                        <p className="text-[10px] text-slate-400">{level.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => setGameState('menu')}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-5 rounded-2xl transition-all flex items-center justify-center gap-3"
                >
                  Start Your Adventure <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {gameState === 'complete' && activeLevel && (
            <motion.div 
              key="complete"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto text-center space-y-8 py-12"
            >
              <div className="relative inline-block">
                <div className="w-48 h-48 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                  <Trophy className="w-24 h-24 text-amber-500" />
                </div>
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  className="absolute -top-4 -right-4 w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white border-4 border-white shadow-lg"
                >
                  <Star className="w-8 h-8 fill-white" />
                </motion.div>
              </div>

              <div className="space-y-2">
                <h2 className="text-4xl font-black text-slate-900">Level Complete!</h2>
                <p className="text-slate-500 text-xl">You got {score} out of 5 correct!</p>
              </div>

              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => setGameState('menu')}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-5 rounded-2xl shadow-lg transition-all text-xl"
                >
                  Continue Journey
                </button>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={startPractice}
                    className="bg-white hover:bg-slate-50 text-slate-600 font-bold py-5 rounded-2xl border border-slate-200 transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCcw className="w-5 h-5" /> Retry Practice
                  </button>
                  <button 
                    onClick={() => startLevel(activeLevel)}
                    className="bg-white hover:bg-slate-50 text-slate-600 font-bold py-5 rounded-2xl border border-slate-200 transition-all flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-5 h-5" /> Review Lesson
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* AI Hint Side Pane */}
      <AnimatePresence>
        {showAiPane && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAiPane(false)}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[70] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">AI Magic Hint</h3>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Powered by Gemini</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAiPane(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {isAiLoading ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-4 text-slate-400">
                    <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
                    <p className="font-medium animate-pulse">Consulting the math wizards...</p>
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                      <p className="text-slate-700 leading-relaxed text-lg italic">
                        "{aiHint}"
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">How to solve it:</h4>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 text-slate-600">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0 mt-0.5 text-xs font-bold">1</div>
                          <p>Read the numbers carefully.</p>
                        </div>
                        <div className="flex items-start gap-3 text-slate-600">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0 mt-0.5 text-xs font-bold">2</div>
                          <p>Use the hint above to visualize the problem.</p>
                        </div>
                        <div className="flex items-start gap-3 text-slate-600">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0 mt-0.5 text-xs font-bold">3</div>
                          <p>Pick the answer that matches your result!</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-8">
                      <button 
                        onClick={() => setShowAiPane(false)}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl transition-all"
                      >
                        Got it, thanks!
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer / Mobile Nav */}
      <footer className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 p-4 md:hidden">
        <div className="flex justify-around items-center">
           <button onClick={() => setGameState('menu')} className="p-2 text-emerald-500"><BookOpen className="w-6 h-6" /></button>
           <button className="p-2 text-slate-300"><Trophy className="w-6 h-6" /></button>
           <button className="p-2 text-slate-300"><Star className="w-6 h-6" /></button>
        </div>
      </footer>
    </div>
  );
}
