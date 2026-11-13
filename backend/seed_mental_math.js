const db = require('./database');

const mentalMathQuestions = [
  // ── 1. Mental Arithmetic Shortcuts & Number Tricks ──
  {
    topic: "Mental Math - Speed Arithmetic",
    difficulty: "Junior",
    question_text: "What is 45 × 99? (Hint: Use mental shortcut 45 × (100 - 1))",
    option_a: "4,445",
    option_b: "4,455",
    option_c: "4,545",
    option_d: "4,500",
    correct_option: "B",
    explanation: "45 × (100 - 1) = 4500 - 45 = 4455."
  },
  {
    topic: "Mental Math - Speed Arithmetic",
    difficulty: "Junior",
    question_text: "Compute mentally: 25 × 48.",
    option_a: "1,150",
    option_b: "1,200",
    option_c: "1,250",
    option_d: "1,400",
    correct_option: "B",
    explanation: "25 × 48 = (25 × 4) × 12 = 100 × 12 = 1200."
  },
  {
    topic: "Mental Math - Speed Arithmetic",
    difficulty: "Junior",
    question_text: "What is 35²? (Hint: Multiply 3 by 4, then append 25)",
    option_a: "1,125",
    option_b: "1,225",
    option_c: "1,325",
    option_d: "1,425",
    correct_option: "B",
    explanation: "3 × (3 + 1) = 3 × 4 = 12, then append 25 to get 1225."
  },
  {
    topic: "Mental Math - Speed Arithmetic",
    difficulty: "Junior",
    question_text: "Calculate mentally: 1000 - 647.",
    option_a: "343",
    option_b: "353",
    option_c: "363",
    option_d: "453",
    correct_option: "B",
    explanation: "Using 'all from 9 and last from 10': 9-6=3, 9-4=5, 10-7=3 → 353."
  },
  {
    topic: "Mental Math - Speed Arithmetic",
    difficulty: "Junior",
    question_text: "What is 54 × 11?",
    option_a: "544",
    option_b: "584",
    option_c: "594",
    option_d: "604",
    correct_option: "C",
    explanation: "Multiply by 11: keep outer digits 5 and 4, middle digit is 5 + 4 = 9 → 594."
  },
  {
    topic: "Mental Math - Speed Arithmetic",
    difficulty: "Junior",
    question_text: "Quickly evaluate: 360 ÷ 5.",
    option_a: "68",
    option_b: "72",
    option_c: "75",
    option_d: "80",
    correct_option: "B",
    explanation: "Dividing by 5 is doubling then dividing by 10: 360 × 2 = 720, 720 ÷ 10 = 72."
  },
  {
    topic: "Mental Math - Speed Arithmetic",
    difficulty: "Junior",
    question_text: "What is the sum of integers from 1 to 20? (1 + 2 + 3 + ... + 20)",
    option_a: "190",
    option_b: "200",
    option_c: "210",
    option_d: "220",
    correct_option: "C",
    explanation: "Sum = n(n + 1) ÷ 2 = (20 × 21) ÷ 2 = 10 × 21 = 210."
  },

  // ── 2. Algebraic Logic & Mental Balances ──
  {
    topic: "Mental Math - Algebraic Logic",
    difficulty: "Junior",
    question_text: "If a + b = 16 and a - b = 6, what is the value of a × b?",
    option_a: "45",
    option_b: "55",
    option_c: "60",
    option_d: "65",
    correct_option: "B",
    explanation: "Adding gives 2a = 22 → a = 11, then b = 5. So a × b = 11 × 5 = 55."
  },
  {
    topic: "Mental Math - Algebraic Logic",
    difficulty: "Junior",
    question_text: "If m² - n² = 45 and m - n = 5, what is m + n?",
    option_a: "7",
    option_b: "8",
    option_c: "9",
    option_d: "15",
    correct_option: "C",
    explanation: "Difference of squares: m² - n² = (m - n)(m + n) → 45 = 5 × (m + n) → m + n = 9."
  },
  {
    topic: "Mental Math - Algebraic Logic",
    difficulty: "Junior",
    question_text: "Solve mentally: 4x - 9 = 2x + 11.",
    option_a: "8",
    option_b: "9",
    option_c: "10",
    option_d: "11",
    correct_option: "C",
    explanation: "4x - 2x = 11 + 9 → 2x = 20 → x = 10."
  },
  {
    topic: "Mental Math - Algebraic Logic",
    difficulty: "Junior",
    question_text: "If x + 1/x = 5, what is the value of x² + 1/x²?",
    option_a: "21",
    option_b: "23",
    option_c: "25",
    option_d: "27",
    correct_option: "B",
    explanation: "(x + 1/x)² = x² + 2 + 1/x² = 25 → x² + 1/x² = 25 - 2 = 23."
  },
  {
    topic: "Mental Math - Algebraic Logic",
    difficulty: "Junior",
    question_text: "If 2^(x + 3) = 64, find the value of x.",
    option_a: "2",
    option_b: "3",
    option_c: "4",
    option_d: "5",
    correct_option: "B",
    explanation: "64 = 2^6, so x + 3 = 6 → x = 3."
  },
  {
    topic: "Mental Math - Algebraic Logic",
    difficulty: "Junior",
    question_text: "If a/b = 2/3, evaluate: (3a + 2b) ÷ (3a - b).",
    option_a: "2",
    option_b: "3",
    option_c: "4",
    option_d: "6",
    correct_option: "C",
    explanation: "Let a = 2, b = 3: (3(2) + 2(3)) ÷ (3(2) - 3) = (6 + 6) ÷ (6 - 3) = 12 ÷ 3 = 4."
  },

  // ── 3. Percentage, Ratio & Commercial Logic ──
  {
    topic: "Mental Math - Commercial Logic",
    difficulty: "Junior",
    question_text: "Which is greater: 16% of 50 or 50% of 16?",
    option_a: "16% of 50",
    option_b: "50% of 16",
    option_c: "They are exactly equal",
    option_d: "Cannot be determined without a calculator",
    correct_option: "C",
    explanation: "x% of y = (x × y) ÷ 100 = y% of x. Both equal 8."
  },
  {
    topic: "Mental Math - Commercial Logic",
    difficulty: "Junior",
    question_text: "A textbook normally priced at ₦6,000 has its price increased by 10%, then decreased by 10%. What is the final price?",
    option_a: "₦6,000",
    option_b: "₦5,940",
    option_c: "₦5,800",
    option_d: "₦6,060",
    correct_option: "B",
    explanation: "10% increase → ₦6,600. Then 10% decrease of ₦6,600 is ₦660 off → ₦5,940 (always a 1% net drop)."
  },
  {
    topic: "Mental Math - Commercial Logic",
    difficulty: "Junior",
    question_text: "A vendor buys 5 pens for ₦200 and sells 4 pens for ₦200. What is the percentage profit?",
    option_a: "20%",
    option_b: "25%",
    option_c: "30%",
    option_d: "50%",
    correct_option: "B",
    explanation: "Cost per pen = ₦40. Selling price per pen = ₦50. Profit = ₦10 / ₦40 = 25%."
  },
  {
    topic: "Mental Math - Commercial Logic",
    difficulty: "Junior",
    question_text: "If 8 students complete a group project in 6 hours, how many hours will 12 students take working at the same pace?",
    option_a: "3 hours",
    option_b: "4 hours",
    option_c: "4.5 hours",
    option_d: "5 hours",
    correct_option: "B",
    explanation: "Total student-hours = 8 × 6 = 48. With 12 students: 48 ÷ 12 = 4 hours."
  },
  {
    topic: "Mental Math - Commercial Logic",
    difficulty: "Junior",
    question_text: "Divide ₦45,000 between Tayo and Chioma in the ratio 4 : 5. How much does Chioma get?",
    option_a: "₦20,000",
    option_b: "₦22,500",
    option_c: "₦25,000",
    option_d: "₦27,000",
    correct_option: "C",
    explanation: "Total parts = 4 + 5 = 9. 1 part = 45,000 ÷ 9 = ₦5,000. Chioma gets 5 × ₦5,000 = ₦25,000."
  },

  // ── 4. Geometry & Spatial Logic ──
  {
    topic: "Mental Math - Geometry Logic",
    difficulty: "Junior",
    question_text: "A right triangle has legs of length 15 cm and 20 cm. What is the length of the hypotenuse?",
    option_a: "22 cm",
    option_b: "24 cm",
    option_c: "25 cm",
    option_d: "30 cm",
    correct_option: "C",
    explanation: "This is the classic 3-4-5 Pythagorean triple scaled by 5: 3×5=15, 4×5=20, 5×5=25 cm."
  },
  {
    topic: "Mental Math - Geometry Logic",
    difficulty: "Junior",
    question_text: "If the radius of a circle is tripled, by what factor does its area increase?",
    option_a: "3 times",
    option_b: "6 times",
    option_c: "9 times",
    option_d: "27 times",
    correct_option: "C",
    explanation: "Area = πr². If radius becomes 3r, new area = π(3r)² = 9πr², which is 9 times larger."
  },
  {
    topic: "Mental Math - Geometry Logic",
    difficulty: "Junior",
    question_text: "What is the sum of the interior angles of a regular hexagon (6-sided polygon)?",
    option_a: "540°",
    option_b: "720°",
    option_c: "900°",
    option_d: "1080°",
    correct_option: "B",
    explanation: "Sum = (n - 2) × 180° = (6 - 2) × 180° = 4 × 180° = 720°."
  },
  {
    topic: "Mental Math - Geometry Logic",
    difficulty: "Junior",
    question_text: "A square has an area of 196 cm². What is its perimeter?",
    option_a: "48 cm",
    option_b: "52 cm",
    option_c: "56 cm",
    option_d: "64 cm",
    correct_option: "C",
    explanation: "Side = √196 = 14 cm. Perimeter = 4 × 14 = 56 cm."
  },
  {
    topic: "Mental Math - Geometry Logic",
    difficulty: "Junior",
    question_text: "Two angles are supplementary. If one angle is 3 times the other, what is the smaller angle?",
    option_a: "30°",
    option_b: "45°",
    option_c: "60°",
    option_d: "90°",
    correct_option: "B",
    explanation: "Supplementary angles sum to 180°. x + 3x = 180° → 4x = 180° → x = 45°."
  },

  // ── 5. Number Theory, Fractions & Divisibility ──
  {
    topic: "Mental Math - Number Theory",
    difficulty: "Junior",
    question_text: "What is the smallest 3-digit number that is simultaneously divisible by 3, 4, and 5?",
    option_a: "100",
    option_b: "120",
    option_c: "140",
    option_d: "160",
    correct_option: "B",
    explanation: "LCM of 3, 4, and 5 is 60. The smallest 3-digit multiple of 60 is 60 × 2 = 120."
  },
  {
    topic: "Mental Math - Number Theory",
    difficulty: "Junior",
    question_text: "How many prime numbers exist between 20 and 40?",
    option_a: "3",
    option_b: "4",
    option_c: "5",
    option_d: "6",
    correct_option: "B",
    explanation: "The prime numbers between 20 and 40 are 23, 29, 31, and 37 (total of 4)."
  },
  {
    topic: "Mental Math - Number Theory",
    difficulty: "Junior",
    question_text: "Which of the following numbers is divisible by 9?",
    option_a: "4,517",
    option_b: "5,329",
    option_c: "6,435",
    option_d: "7,219",
    correct_option: "C",
    explanation: "A number is divisible by 9 if the sum of its digits is a multiple of 9: 6+4+3+5 = 18 (divisible by 9)."
  },
  {
    topic: "Mental Math - Number Theory",
    difficulty: "Junior",
    question_text: "Which fraction is strictly the largest: 7/8, 8/9, 9/10, or 10/11?",
    option_a: "7/8",
    option_b: "8/9",
    option_c: "9/10",
    option_d: "10/11",
    correct_option: "D",
    explanation: "Each fraction is 1 minus 1/denominator. Since 1/11 is the smallest remainder, 10/11 is closest to 1, hence the largest."
  },
  {
    topic: "Mental Math - Number Theory",
    difficulty: "Junior",
    question_text: "What is the remainder when (7 × 8 × 9 + 5) is divided by 7?",
    option_a: "0",
    option_b: "2",
    option_c: "5",
    option_d: "6",
    correct_option: "C",
    explanation: "7 × 8 × 9 is a multiple of 7, so remainder comes entirely from 5 ÷ 7, which leaves remainder 5."
  },

  // ── 6. Sequences, Patterns & Quantitative Logic ──
  {
    topic: "Mental Math - Quantitative Sequences",
    difficulty: "Junior",
    question_text: "Find the next number in the sequence: 2, 6, 12, 20, 30, ___ ?",
    option_a: "38",
    option_b: "40",
    option_c: "42",
    option_d: "44",
    correct_option: "C",
    explanation: "The differences are +4, +6, +8, +10. Next difference is +12: 30 + 12 = 42 (or n(n+1) for n=6: 6×7=42)."
  },
  {
    topic: "Mental Math - Quantitative Sequences",
    difficulty: "Junior",
    question_text: "Find the missing number: 3, 7, 15, 31, 63, ___ ?",
    option_a: "95",
    option_b: "115",
    option_c: "127",
    option_d: "129",
    correct_option: "C",
    explanation: "Pattern is (previous × 2) + 1: (63 × 2) + 1 = 126 + 1 = 127."
  },
  {
    topic: "Mental Math - Quantitative Sequences",
    difficulty: "Junior",
    question_text: "The sum of 3 consecutive integers is 84. What is the largest of the three integers?",
    option_a: "27",
    option_b: "28",
    option_c: "29",
    option_d: "30",
    correct_option: "C",
    explanation: "The middle integer is the average: 84 ÷ 3 = 28. The consecutive integers are 27, 28, 29. Largest is 29."
  },
  {
    topic: "Mental Math - Quantitative Sequences",
    difficulty: "Junior",
    question_text: "If a train travels at 72 km/h, what is its speed in metres per second (m/s)?",
    option_a: "15 m/s",
    option_b: "18 m/s",
    option_c: "20 m/s",
    option_d: "25 m/s",
    correct_option: "C",
    explanation: "To convert km/h to m/s, multiply by 5/18: 72 × (5/18) = 4 × 5 = 20 m/s."
  },
  {
    topic: "Mental Math - Quantitative Sequences",
    difficulty: "Junior",
    question_text: "A clock shows 3:00. What is the measure of the smaller angle formed between the hour hand and minute hand?",
    option_a: "60°",
    option_b: "75°",
    option_c: "90°",
    option_d: "120°",
    correct_option: "C",
    explanation: "Each hour represents 360° ÷ 12 = 30°. From 12 to 3 is 3 hours: 3 × 30° = 90°."
  },
  {
    topic: "Mental Math - Quantitative Sequences",
    difficulty: "Junior",
    question_text: "If 5 cats catch 5 mice in 5 minutes, how many minutes will 100 cats take to catch 100 mice at the same rate?",
    option_a: "5 minutes",
    option_b: "20 minutes",
    option_c: "50 minutes",
    option_d: "100 minutes",
    correct_option: "A",
    explanation: "Each cat catches 1 mouse in 5 minutes. Therefore, 100 cats simultaneously catch 100 mice in exactly 5 minutes."
  }
];

function seedAll() {
  let inserted = 0;
  let index = 0;

  function processNext() {
    if (index >= mentalMathQuestions.length) {
      console.log(`✅ Seeded ${inserted} new mental math questions into arena_questions table.`);
      db.get('SELECT count(*) as total FROM arena_questions', (e, countRow) => {
        console.log(`📊 Total arena questions available in database now: ${countRow ? countRow.total : 'unknown'}`);
        process.exit(0);
      });
      return;
    }

    const q = mentalMathQuestions[index];
    index++;

    db.get('SELECT id FROM arena_questions WHERE question_text = ?', [q.question_text], (err, row) => {
      if (!row) {
        db.run(
          `INSERT INTO arena_questions (topic, difficulty, question_text, option_a, option_b, option_c, option_d, correct_option, explanation)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [q.topic, q.difficulty, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option, q.explanation],
          (insErr) => {
            if (!insErr) inserted++;
            processNext();
          }
        );
      } else {
        processNext();
      }
    });
  }

  processNext();
}

seedAll();
