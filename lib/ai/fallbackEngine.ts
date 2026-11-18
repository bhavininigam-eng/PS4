import { Concept, DifficultyLevel, ImportanceLevel, LanguagePreference, Question, TeachingExplanation } from '../types';

export function getDeterministicExplanation(
  conceptName: string,
  language: LanguagePreference = 'english',
  layer?: string
): TeachingExplanation {
  const isHinglish = language === 'hinglish';
  const cLower = conceptName.toLowerCase();

  // Knowledge base for common CS / engineering topics
  if (cLower.includes('loop') || cLower.includes('for') || cLower.includes('while')) {
    return {
      conceptId: 'loops',
      conceptName: 'Loops and Iteration',
      language,
      beginnerELI5: isHinglish
        ? 'Socho ek loop ek CD player ke repeat button jaisa hai. Jab tak gaana khatam nahi hota ya condition true rehti hai, woh code bar-bar execute hota rehta hai.'
        : 'Think of a loop like a music player on repeat. As long as a condition stays true, the player repeats the track over and over without you pressing play every time.',
      conceptual: isHinglish
        ? 'Loops humein repetitive tasks automate karne dete hain. Har loop ke 3 key pillars hote hain: Initialization (shuruat), Condition (kab tak chalega), aur Increment/Decrement (aage badhna).'
        : 'Loops automate repetitive logic by executing a statement block repeatedly until a termination condition evaluates to false. Key components: initialization, termination condition, and loop variable update.',
      stepByStep: isHinglish
        ? [
            '1. Loop counter variable initialize karo (jaise i = 0).',
            '2. Termination condition check karo (jaise i < 10). Agar false ho gaya toh loop turant break hota hai.',
            '3. Loop body ke andar ka code execute karo.',
            '4. Counter ko update karo (i++ ya i--).',
            '5. Step 2 par wapas jao.'
          ]
        : [
            '1. Initialize the iteration control variable (e.g. let i = 0).',
            '2. Evaluate the loop guard condition (e.g. i < 10). If false, terminate immediately.',
            '3. Execute statements inside the loop body.',
            '4. Increment or mutate the control variable (e.g. i++).',
            '5. Return to Step 2 and re-evaluate condition.'
          ],
      realWorldExample: isHinglish
        ? 'WhatsApp group mein har member ko message bhejna: loop ek-ek member ki list traverse karta hai aur message deliver karta hai.'
        : 'Sending a bulk notification to 1,000 university students: the server runs an iteration across student records to dispatch emails.',
      examOrientedAnswer: isHinglish
        ? 'Loops do primary types ke hote hain: Entry-Controlled (for, while jisme pehle condition check hoti hai) aur Exit-Controlled (do-while jisme body at least ek baar execute hoti hai).'
        : 'In programming, iteration statements are categorized into Entry-Controlled (for, while - where condition is evaluated before execution) and Exit-Controlled (do-while - where body executes at least once before verification).',
      commonMistakes: isHinglish
        ? [
            'Infinite Loop: Loop variable ko update karna bhool jana (e.g. i++ miss ho gaya).',
            'Off-by-one Error: <= ki jagah < use karna ya index out of bounds kar dena.',
            'Loop variable scope: Loop ke bahar variable access karne ki koshish karna.'
          ]
        : [
            'Infinite Loop: Forgetting to increment the loop variable inside while loops.',
            'Off-by-One Error (OBOE): Using <= instead of < when iterating 0-indexed arrays.',
            'Unintended Mutation: Modifying collection items while iterating over them directly.'
          ],
      quickRevisionNotes: isHinglish
        ? [
            'For Loop: Jab iterations ka count pehle se pata ho.',
            'While Loop: Jab condition dynamic ho aur ending fixed na ho.',
            'Do-While: Jab code kam se kam 1 baar run hona mandatory ho.'
          ]
        : [
            'For Loop: Best when total iterations are known in advance.',
            'While Loop: Best for event-driven or unknown iteration bounds.',
            'Break vs Continue: break exits entirely; continue skips only current cycle.'
          ],
      recommendedFollowUps: [
        'Nested Loops and Time Complexity O(n²)',
        'Break and Continue Control Flow',
        'Iterating over Arrays & Dictionaries'
      ],
    };
  }

  if (cLower.includes('function') || cLower.includes('recursion') || cLower.includes('method')) {
    return {
      conceptId: 'functions',
      conceptName: 'Functions and Modular Decomposition',
      language,
      beginnerELI5: isHinglish
        ? 'Function ek microwave oven jaisa hai. Aap input daalte ho (jaise popcorn seeds), woh recipe run karta hai, aur output return karta hai (hot popcorn).'
        : 'A function is like a kitchen blender. You put ingredients in (arguments), it performs a specific recipe, and gives you a smoothie back (return value).',
      conceptual: isHinglish
        ? 'Functions reusable blocks of code hote hain jo modularity badhate hain aur code duplication khatam karte hain (DRY Principle - Don\'t Repeat Yourself).'
        : 'Functions are modular self-contained subprograms designed to execute a specific task. They decouple logic, provide abstraction, and enable code reusability adhering to DRY principles.',
      stepByStep: isHinglish
        ? [
            '1. Function declare karo with descriptive name aur parameters.',
            '2. Parameters ke validation check karo.',
            '3. Core computation perform karo.',
            '4. Return statement se result caller ko pass karo.'
          ]
        : [
            '1. Define function signature with meaningful name and typed parameters.',
            '2. Validate incoming argument boundary conditions.',
            '3. Execute the internal calculation or business logic.',
            '4. Explicitly return the calculated output to the caller.'
          ],
      realWorldExample: isHinglish
        ? 'UPI Payment app mein "calculateDiscount(amount, couponCode)" function jo har purchase par discount nikaal kar final bill banata hai.'
        : 'An e-commerce checkout flow calling "calculateTaxAndDiscount(cartTotal, userCoupon)" across multiple regional stores.',
      examOrientedAnswer: isHinglish
        ? 'Pass by Value vs Pass by Reference: Pass by value mein original data copy hota hai, jabki reference mein memory address pass hota hai jisse original object mutate ho sakta hai.'
        : 'Distinction between Pass-by-Value (creates copy of caller\'s primitive value; modifications do not affect caller) and Pass-by-Reference (passes memory reference; mutations alter original instance).',
      commonMistakes: isHinglish
        ? [
            'Return statement bhool jana (undefined return hona).',
            'Function ke andar global variables mutate karna (unintended side-effects).',
            'Recursion mein base case miss kar dena jisse Stack Overflow ho jaye.'
          ]
        : [
            'Omitting explicit return statement resulting in implicit undefined.',
            'Mutating external global state instead of keeping pure functions.',
            'Missing base case in recursive functions, causing Call Stack Overflow.'
          ],
      quickRevisionNotes: isHinglish
        ? [
            'Scope: Local variables sirf function ke andar access hote hain.',
            'Pure Function: Same input dene par hamesha same output milta hai, zero side-effects.',
            'Recursion: Jab function khud ko call kare with a terminating base condition.'
          ]
        : [
            'Lexical Scope: Variables are bound to the block or function where created.',
            'Pure Functions: Deterministic output for given inputs with zero side-effects.',
            'Recursion Requirements: 1) Base condition, 2) Step moving towards base condition.'
          ],
      recommendedFollowUps: [
        'Higher-Order Functions and Callbacks',
        'Memory Call Stack and Recursion',
        'Scope and Closures'
      ],
    };
  }

  // Generic fallback for any other concept
  return {
    conceptId: conceptName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    conceptName,
    language,
    beginnerELI5: isHinglish
      ? `Samjho ${conceptName} ek basic building block hai jo system ko accurately chalane mein help karta hai.`
      : `Understand ${conceptName} as an essential building block that enables software systems to operate predictably.`,
    conceptual: isHinglish
      ? `${conceptName} computer science aur software engineering ka ek critical concept hai jo logical structuring aur data transformation streamline karta hai.`
      : `${conceptName} is a foundational concept in computing that structures data representation, execution predictability, and system efficiency.`,
    stepByStep: isHinglish
      ? [
          `1. ${conceptName} ke core principles aur prerequisites ko samjhein.`,
          `2. Iska simple syntax ya representation declare karein.`,
          `3. Edge cases aur boundary conditions check karein.`,
          `4. Practical problem mein verify karein.`
        ]
      : [
          `1. Establish theoretical foundation and identify prerequisite concepts.`,
          `2. Implement a standard declaration or configuration in code.`,
          `3. Inspect boundary constraints and potential runtime anomalies.`,
          `4. Verify behavior against canonical test vectors.`
        ],
    realWorldExample: isHinglish
      ? `Real world apps (Google, Netflix, UPI) mein ${conceptName} performance aur consistency ensure karne ke liye use hota hai.`
      : `Production applications at scale utilize ${conceptName} to maintain architectural clarity, low latency, and deterministic state.`,
    examOrientedAnswer: isHinglish
      ? `${conceptName} par standard exam questions definition, advantages, limitations aur complexity analysis par aate hain.`
      : `${conceptName} is frequently examined through its structural definition, time/space complexity implications, advantages over alternatives, and implementation pitfalls.`,
    commonMistakes: isHinglish
      ? [
          'Edge conditions aur null values handle na karna.',
          'Prerequisite concepts ko ignore karke directly advanced logic likhna.',
          'Memory efficiency aur runtime cost overlook kar dena.'
        ]
      : [
          'Ignoring boundary edge cases such as null or empty inputs.',
          'Attempting complex implementations before verifying prerequisite mastery.',
          'Overlooking asymptotic runtime and memory constraints.'
        ],
    quickRevisionNotes: isHinglish
      ? [
          'Core formula / definition yaad rakhein.',
          'Best, average aur worst case scenarios compare karein.',
          'Practical example ke saath answer present karein.'
        ]
      : [
          'Review canonical definition and mathematical/logical constraints.',
          'Compare time and space complexities against alternative approaches.',
          'Always state assumptions and boundary checks clearly in answers.'
        ],
    recommendedFollowUps: [
      `Practical Exercises for ${conceptName}`,
      `Exam Short-Answer Practice on ${conceptName}`,
      `Integration with next curriculum topic`
    ],
  };
}

export function parseDeterministicSyllabus(subjectName: string, syllabusText: string): Concept[] {
  const lines = syllabusText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 2 && !l.startsWith('===') && !l.startsWith('---'));

  const parsedConcepts: Concept[] = [];
  const extractedNames: string[] = [];

  for (const line of lines) {
    // Clean leading numbers, bullets, unit markers
    const cleaned = line
      .replace(/^(unit|chapter|module|section|topic|week)\s*\d+[:.-]?/i, '')
      .replace(/^[\d+.)\-*•]+\s*/, '')
      .replace(/[,;:]+$/, '')
      .trim();

    if (cleaned.length > 3 && !extractedNames.includes(cleaned)) {
      extractedNames.push(cleaned);
    }
  }

  // If syllabus was too brief, provide standard high-yield university concepts for the subject
  if (extractedNames.length < 3) {
    if (subjectName.toLowerCase().includes('data') || subjectName.toLowerCase().includes('algorithm') || subjectName.toLowerCase().includes('python') || subjectName.toLowerCase().includes('c++')) {
      extractedNames.push(
        'Variables and Data Types',
        'Control Flow and Conditionals',
        'Loops and Iteration',
        'Functions and Modularity',
        'Arrays and Slicing',
        'Recursion and Call Stack',
        'Time and Space Complexity',
        'Sorting and Searching Algorithms'
      );
    } else if (subjectName.toLowerCase().includes('operating') || subjectName.toLowerCase().includes('os')) {
      extractedNames.push(
        'Processes and Threads',
        'CPU Scheduling Algorithms',
        'Process Synchronization and Semaphores',
        'Deadlocks and Resource Allocation',
        'Memory Management and Paging',
        'Virtual Memory and Page Replacement'
      );
    } else {
      extractedNames.push(
        `${subjectName} Core Fundamentals`,
        `${subjectName} Intermediate Principles`,
        `${subjectName} Applied Problem Solving`,
        `${subjectName} Advanced Concepts & Optimization`
      );
    }
  }

  // Build concepts with prerequisite hierarchy
  for (let idx = 0; idx < extractedNames.length; idx++) {
    const name = extractedNames[idx];
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30) || `concept-${idx + 1}`;

    const prerequisites = idx > 0 ? [parsedConcepts[idx - 1].id] : [];
    const difficulty: DifficultyLevel = idx < 2 ? 'beginner' : idx < 5 ? 'intermediate' : 'advanced';
    const importance: ImportanceLevel = idx === 0 ? 'foundational' : idx % 2 === 1 ? 'critical' : 'high';

    parsedConcepts.push({
      id,
      name,
      category: subjectName,
      prerequisites,
      difficulty,
      estimatedMinutes: 25 + (idx % 3) * 10,
      importance,
      masteryScore: 0,
      status: 'UNASSESSED',
      attemptsCount: 0,
      correctCount: 0,
      revisionIntervalDays: 1,
      retentionRate: 100,
      keyPoints: [
        `Core theoretical definition of ${name}`,
        `Practical syntax and execution patterns`,
        `Real-world application and error management`
      ],
      commonMisconceptions: [
        `Confusing ${name} with its counterpart concepts`,
        `Failing to account for edge cases and boundary limits`
      ],
    });
  }

  return parsedConcepts;
}

export function generateDeterministicQuestions(
  conceptId: string,
  conceptName: string,
  difficulty: DifficultyLevel = 'intermediate',
  count: number = 4
): Question[] {
  const cLower = conceptName.toLowerCase();

  if (cLower.includes('loop')) {
    const loopQuestions: Question[] = [
      {
        id: `q-${conceptId}-1`,
        conceptId,
        conceptName,
        difficulty: 'beginner',
        questionType: 'mcq',
        prompt: 'In a standard entry-controlled while loop, what happens if the loop condition is false initially?',
        options: [
          'The loop executes exactly once',
          'The loop never executes',
          'The program throws a compile error',
          'The loop enters an infinite cycle'
        ],
        correctAnswer: 'The loop never executes',
        explanation: 'In entry-controlled loops (while, for), the condition is tested before entering the loop body. If false initially, the body is completely skipped.',
        misconceptionExplanation: 'Do-while loops execute once before checking, but while loops check the condition first.',
      },
      {
        id: `q-${conceptId}-2`,
        conceptId,
        conceptName,
        difficulty: 'intermediate',
        questionType: 'mcq',
        prompt: 'Consider: for (let i = 0; i < 5; i++) { if (i === 3) continue; total += i; }. What happens when i is 3?',
        options: [
          'The loop terminates permanently',
          'Only the addition for i = 3 is skipped, and iteration continues to i = 4',
          'The loop resets back to i = 0',
          'An off-by-one exception occurs'
        ],
        correctAnswer: 'Only the addition for i = 3 is skipped, and iteration continues to i = 4',
        explanation: 'The `continue` statement skips only the remaining instructions of the current iteration cycle and advances to the next step.',
        misconceptionExplanation: '`break` terminates the entire loop, whereas `continue` only bypasses the rest of the current iteration.',
      },
      {
        id: `q-${conceptId}-3`,
        conceptId,
        conceptName,
        difficulty: 'intermediate',
        questionType: 'true_false',
        prompt: 'A do-while loop is guaranteed to execute its block at least once, even if the condition is false initially.',
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: 'Because do-while evaluates its condition at the exit point after the body has executed.',
        misconceptionExplanation: 'This is the fundamental architectural difference between entry-controlled and exit-controlled loops.',
      },
      {
        id: `q-${conceptId}-4`,
        conceptId,
        conceptName,
        difficulty: 'advanced',
        questionType: 'mcq',
        prompt: 'What is the time complexity of two nested loops where the outer runs N times and the inner runs N times?',
        options: ['O(N)', 'O(N log N)', 'O(N²)', 'O(2^N)'],
        correctAnswer: 'O(N²)',
        explanation: 'For each of the N outer iterations, the inner loop executes N times, leading to N * N = N² total operations.',
        misconceptionExplanation: 'Consecutive loops add up (N + N = O(N)), but nested loops multiply (N * N = O(N²)).',
      },
    ];
    return loopQuestions.slice(0, count);
  }

  if (cLower.includes('function') || cLower.includes('recursion')) {
    const funcQuestions: Question[] = [
      {
        id: `q-${conceptId}-1`,
        conceptId,
        conceptName,
        difficulty: 'beginner',
        questionType: 'mcq',
        prompt: 'What is the primary purpose of using functions in programming?',
        options: [
          'To make the code file size as large as possible',
          'To break complex code into reusable, modular, and maintainable blocks',
          'To force the CPU into single-core mode',
          'To eliminate the need for variables'
        ],
        correctAnswer: 'To break complex code into reusable, modular, and maintainable blocks',
        explanation: 'Functions promote the DRY principle (Don\'t Repeat Yourself), improving code readability, maintainability, and testability.',
      },
      {
        id: `q-${conceptId}-2`,
        conceptId,
        conceptName,
        difficulty: 'intermediate',
        questionType: 'mcq',
        prompt: 'In recursive functions, what is the mandatory component that halts further recursive calls?',
        options: ['Loop header', 'Base condition / Base case', 'Global variable', 'Try-catch block'],
        correctAnswer: 'Base condition / Base case',
        explanation: 'The base case provides a deterministic exit condition that prevents unbounded self-invocation and call stack overflow.',
        misconceptionExplanation: 'Without a base case, the function calls itself indefinitely until the runtime runs out of stack memory.',
      },
      {
        id: `q-${conceptId}-3`,
        conceptId,
        conceptName,
        difficulty: 'intermediate',
        questionType: 'true_false',
        prompt: 'In pass-by-value, modifications to a primitive parameter inside a function alter the original caller\'s variable.',
        options: ['True', 'False'],
        correctAnswer: 'False',
        explanation: 'Pass-by-value creates an independent copy in local scope. Modifications affect only the copy, leaving the original variable unchanged.',
      },
      {
        id: `q-${conceptId}-4`,
        conceptId,
        conceptName,
        difficulty: 'advanced',
        questionType: 'mcq',
        prompt: 'What happens if a recursive function does not reach its base case?',
        options: [
          'Stack Overflow Exception',
          'Zero Division Error',
          'Database Timeout',
          'Automatic variable Garbage Collection'
        ],
        correctAnswer: 'Stack Overflow Exception',
        explanation: 'Each function invocation allocates a stack frame on the call stack. Unbounded recursion fills the stack until memory is exhausted.',
      },
    ];
    return funcQuestions.slice(0, count);
  }

  // Generic fallback questions
  const genericQuestions: Question[] = [
    {
      id: `q-${conceptId}-1`,
      conceptId,
      conceptName,
      difficulty: 'beginner',
      questionType: 'mcq',
      prompt: `Which of the following best characterizes the primary purpose of ${conceptName}?`,
      options: [
        `Provides structured, deterministic execution for ${conceptName} operations`,
        `Disables error handling across the application runtime`,
        `Randomizes execution order to optimize cache hits`,
        `Replaces hardware registers with file storage`
      ],
      correctAnswer: `Provides structured, deterministic execution for ${conceptName} operations`,
      explanation: `${conceptName} is designed to enforce predictable, correct data handling and logical organization.`,
    },
    {
      id: `q-${conceptId}-2`,
      conceptId,
      conceptName,
      difficulty: 'intermediate',
      questionType: 'true_false',
      prompt: `Understanding prerequisite foundations is necessary before implementing advanced features of ${conceptName}.`,
      options: ['True', 'False'],
      correctAnswer: 'True',
      explanation: 'Foundational concepts provide the mental scaffolding required to understand boundary conditions and runtime behavior.',
    },
    {
      id: `q-${conceptId}-3`,
      conceptId,
      conceptName,
      difficulty: 'intermediate',
      questionType: 'mcq',
      prompt: `When troubleshooting unexpected behavior in ${conceptName}, what is the recommended first debugging step?`,
      options: [
        'Inspect inputs, variable boundaries, and prerequisite assumptions',
        'Delete all configuration files without checking logs',
        'Disable all unit tests to allow execution to proceed',
        'Reboot the physical machine immediately'
      ],
      correctAnswer: 'Inspect inputs, variable boundaries, and prerequisite assumptions',
      explanation: 'Systematic verification of boundary conditions and foundational state detects root causes quickly.',
    },
    {
      id: `q-${conceptId}-4`,
      conceptId,
      conceptName,
      difficulty: 'advanced',
      questionType: 'mcq',
      prompt: `Which metric is most vital when optimizing performance in ${conceptName}?`,
      options: [
        'Algorithmic time complexity and memory footprint',
        'Length of variable identifier names',
        'Number of comments in the source file',
        'Operating system wallpaper color'
      ],
      correctAnswer: 'Algorithmic time complexity and memory footprint',
      explanation: 'Asymptotic complexity dictates how execution scale impacts latency and memory consumption.',
    },
  ];
  return genericQuestions.slice(0, count);
}
