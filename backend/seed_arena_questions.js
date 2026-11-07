const db = require('./database');

const arenaQuestions = [
  // ── From Common Entrance & Quantitative Reasoning Samples (1-10) ──
  {
    topic: "Basic Arithmetic & Decimals",
    difficulty: "Junior",
    question_text: "Simplify: (0.2 × 0.01) ÷ 0.0002",
    option_a: "1",
    option_b: "2",
    option_c: "5",
    option_d: "10",
    correct_option: "D",
    explanation: "0.2 × 0.01 = 0.002. Then 0.002 / 0.0002 = 10."
  },
  {
    topic: "Basic Arithmetic & Decimals",
    difficulty: "Junior",
    question_text: "What is the difference between 100 and 99.999?",
    option_a: "0.01",
    option_b: "0.001",
    option_c: "0.0001",
    option_d: "0.00001",
    correct_option: "B",
    explanation: "100.000 - 99.999 = 0.001."
  },
  {
    topic: "Basic Arithmetic & Decimals",
    difficulty: "Junior",
    question_text: "How many times is 0.01 contained in 10?",
    option_a: "100",
    option_b: "200",
    option_c: "1000",
    option_d: "10000",
    correct_option: "C",
    explanation: "10 ÷ 0.01 = 10 × 100 = 1000."
  },
  {
    topic: "Measurement & Time",
    difficulty: "Junior",
    question_text: "Change 1 hour 1 minute 1 second into total seconds.",
    option_a: "3600 seconds",
    option_b: "3601 seconds",
    option_c: "3660 seconds",
    option_d: "3661 seconds",
    correct_option: "D",
    explanation: "1 hr = 3600s, 1 min = 60s, + 1s = 3661 seconds."
  },
  {
    topic: "Place Value",
    difficulty: "Junior",
    question_text: "What is the place value of the digit 3 in 44.736?",
    option_a: "Tenth",
    option_b: "Hundredth",
    option_c: "Thousandth",
    option_d: "Tens",
    correct_option: "B",
    explanation: "In 44.736, 7 is tenths, 3 is hundredths, and 6 is thousandths."
  },
  {
    topic: "Factors & Multiples",
    difficulty: "Junior",
    question_text: "Find the Highest Common Factor (H.C.F) of 96, 120 and 144.",
    option_a: "12",
    option_b: "24",
    option_c: "48",
    option_d: "72",
    correct_option: "B",
    explanation: "96 = 24×4, 120 = 24×5, 144 = 24×6. The largest common factor is 24."
  },
  {
    topic: "Directed Numbers",
    difficulty: "Junior",
    question_text: "What is the sum of -1 and 4?",
    option_a: "-5",
    option_b: "-3",
    option_c: "3",
    option_d: "5",
    correct_option: "C",
    explanation: "-1 + 4 = 3."
  },
  {
    topic: "Geometry",
    difficulty: "Junior",
    question_text: "A straight line that passes through the centre of a circle dividing it into two equal halves is called a:",
    option_a: "Radius",
    option_b: "Chord",
    option_c: "Diameter",
    option_d: "Circumference",
    correct_option: "C",
    explanation: "The diameter is the longest chord passing through the centre and bisects the circle."
  },
  {
    topic: "Geometry",
    difficulty: "Junior",
    question_text: "The sum of angles on a straight line is equal to:",
    option_a: "90°",
    option_b: "180°",
    option_c: "270°",
    option_d: "360°",
    correct_option: "B",
    explanation: "Angles on a straight line always add up to 180 degrees."
  },
  {
    topic: "Factors & Multiples",
    difficulty: "Junior",
    question_text: "What is the Lowest Common Multiple (L.C.M) of 2 and 4?",
    option_a: "2",
    option_b: "4",
    option_c: "6",
    option_d: "8",
    correct_option: "B",
    explanation: "Multiples of 2: 2, 4, 6... Multiples of 4: 4, 8... The LCM is 4."
  },

  // ── Quantitative Reasoning (11-13) ──
  {
    topic: "Quantitative Reasoning",
    difficulty: "Junior",
    question_text: "Sample: 5 R 4 = 14; 7 R 3 = 17; 10 R 6 = 26. Rule: (First × 2) + Second. Find 12 R 5.",
    option_a: "17",
    option_b: "24",
    option_c: "29",
    option_d: "60",
    correct_option: "C",
    explanation: "(12 × 2) + 5 = 24 + 5 = 29."
  },
  {
    topic: "Quantitative Reasoning",
    difficulty: "Junior",
    question_text: "Sample: 8 // 3 = 14; 3 // 2 = 7; 7 // 8 = 23. Rule: (First × 1) + (Second × 2). Find 5 // 1.",
    option_a: "6",
    option_b: "7",
    option_c: "8",
    option_d: "10",
    correct_option: "B",
    explanation: "8 + (3×2) = 14. For 5 // 1: 5 + (1×2) = 7."
  },
  {
    topic: "Quantitative Reasoning",
    difficulty: "Junior",
    question_text: "Pattern: 4, 9, 14, [ ? ], 24, 29, 34. What is the missing number?",
    option_a: "17",
    option_b: "18",
    option_c: "19",
    option_d: "20",
    correct_option: "C",
    explanation: "The pattern increases by +5 each step: 14 + 5 = 19."
  },

  // ── JSS1 - JSS3 Syllabus: Basic Algebra (14-20) ──
  {
    topic: "Basic Algebra",
    difficulty: "Junior",
    question_text: "Solve for x: 3x - 7 = 14",
    option_a: "x = 5",
    option_b: "x = 7",
    option_c: "x = 9",
    option_d: "x = 21",
    correct_option: "B",
    explanation: "3x = 14 + 7 = 21, so x = 21 / 3 = 7."
  },
  {
    topic: "Basic Algebra",
    difficulty: "Junior",
    question_text: "Expand the algebraic expression: 4(2y - 3)",
    option_a: "8y - 3",
    option_b: "8y - 12",
    option_c: "6y - 7",
    option_d: "8y + 12",
    correct_option: "B",
    explanation: "4 × 2y = 8y and 4 × (-3) = -12, giving 8y - 12."
  },
  {
    topic: "Basic Algebra",
    difficulty: "Junior",
    question_text: "If a = 3 and b = -2, evaluate 2a² - 3b.",
    option_a: "12",
    option_b: "24",
    option_c: "18",
    option_d: "15",
    correct_option: "B",
    explanation: "2(3)² - 3(-2) = 2(9) + 6 = 18 + 6 = 24."
  },
  {
    topic: "Basic Algebra",
    difficulty: "Junior",
    question_text: "Factorize completely: 6xy + 9y",
    option_a: "3y(2x + 3)",
    option_b: "3(2xy + 3y)",
    option_c: "y(6x + 9)",
    option_d: "3x(2y + 3)",
    correct_option: "A",
    explanation: "Common factor is 3y. Factoring out gives 3y(2x + 3)."
  },
  {
    topic: "Basic Algebra",
    difficulty: "Junior",
    question_text: "Solve the linear equation: 5m + 4 = 2m + 19",
    option_a: "m = 3",
    option_b: "m = 5",
    option_c: "m = 7",
    option_d: "m = 15",
    correct_option: "B",
    explanation: "5m - 2m = 19 - 4 => 3m = 15 => m = 5."
  },
  {
    topic: "Basic Algebra",
    difficulty: "Junior",
    question_text: "Simplify: (x³ × x⁴) ÷ x²",
    option_a: "x⁵",
    option_b: "x⁶",
    option_c: "x⁷",
    option_d: "x⁹",
    correct_option: "A",
    explanation: "Using index laws: x^(3+4-2) = x^5."
  },
  {
    topic: "Basic Algebra",
    difficulty: "Junior",
    question_text: "If 4k = 28, what is the value of 3k - 5?",
    option_a: "14",
    option_b: "16",
    option_c: "19",
    option_d: "21",
    correct_option: "B",
    explanation: "k = 28 / 4 = 7. Then 3(7) - 5 = 21 - 5 = 16."
  },

  // ── JSS1 - JSS3 Syllabus: Geometry (21-26) ──
  {
    topic: "Geometry",
    difficulty: "Junior",
    question_text: "The interior angles of a triangle are 50°, 70°, and x°. What is the value of x?",
    option_a: "50°",
    option_b: "60°",
    option_c: "70°",
    option_d: "80°",
    correct_option: "B",
    explanation: "Angles in a triangle add to 180°. x = 180 - (50 + 70) = 180 - 120 = 60°."
  },
  {
    topic: "Geometry",
    difficulty: "Junior",
    question_text: "Calculate the perimeter of a rectangle with length 14cm and breadth 6cm.",
    option_a: "20 cm",
    option_b: "40 cm",
    option_c: "84 cm",
    option_d: "48 cm",
    correct_option: "B",
    explanation: "Perimeter = 2(length + breadth) = 2(14 + 6) = 2(20) = 40 cm."
  },
  {
    topic: "Geometry",
    difficulty: "Junior",
    question_text: "Find the area of a circle whose radius is 7cm (Take π = 22/7).",
    option_a: "44 cm²",
    option_b: "88 cm²",
    option_c: "154 cm²",
    option_d: "308 cm²",
    correct_option: "C",
    explanation: "Area = πr² = (22/7) × 7 × 7 = 154 cm²."
  },
  {
    topic: "Geometry",
    difficulty: "Junior",
    question_text: "Two angles are supplementary. If one angle is 65°, what is the other angle?",
    option_a: "25°",
    option_b: "115°",
    option_c: "125°",
    option_d: "295°",
    correct_option: "B",
    explanation: "Supplementary angles add up to 180°. 180° - 65° = 115°."
  },
  {
    topic: "Geometry",
    difficulty: "Junior",
    question_text: "In a right-angled triangle, the two shorter sides are 6cm and 8cm. Find the hypotenuse.",
    option_a: "9 cm",
    option_b: "10 cm",
    option_c: "12 cm",
    option_d: "14 cm",
    correct_option: "B",
    explanation: "By Pythagoras theorem: c² = 6² + 8² = 36 + 64 = 100. c = √100 = 10 cm."
  },
  {
    topic: "Geometry",
    difficulty: "Junior",
    question_text: "How many sides does a regular octagon have?",
    option_a: "6",
    option_b: "7",
    option_c: "8",
    option_d: "10",
    correct_option: "C",
    explanation: "An octagon is an 8-sided polygon."
  },

  // ── JSS1 - JSS3 Syllabus: Money & Commercial Arithmetic (27-31) ──
  {
    topic: "Money & Commercial Arithmetic",
    difficulty: "Junior",
    question_text: "A trader bought a bag for ₦4,000 and sold it for ₦5,200. Calculate the percentage profit.",
    option_a: "20%",
    option_b: "25%",
    option_c: "30%",
    option_d: "35%",
    correct_option: "C",
    explanation: "Profit = ₦5,200 - ₦4,000 = ₦1,200. Profit % = (1200 / 4000) × 100% = 30%."
  },
  {
    topic: "Money & Commercial Arithmetic",
    difficulty: "Junior",
    question_text: "Calculate the Simple Interest on ₦15,000 for 2 years at 5% per annum.",
    option_a: "₦750",
    option_b: "₦1,500",
    option_c: "₦2,000",
    option_d: "₦3,000",
    correct_option: "B",
    explanation: "I = (P × R × T) / 100 = (15000 × 5 × 2) / 100 = ₦1,500."
  },
  {
    topic: "Money & Commercial Arithmetic",
    difficulty: "Junior",
    question_text: "A book priced at ₦2,500 is offered at a 10% cash discount. How much does a customer pay?",
    option_a: "₦2,200",
    option_b: "₦2,250",
    option_c: "₦2,350",
    option_d: "₦2,400",
    correct_option: "B",
    explanation: "Discount = 10% of 2500 = ₦250. Customer pays ₦2,500 - ₦250 = ₦2,250."
  },
  {
    topic: "Money & Commercial Arithmetic",
    difficulty: "Junior",
    question_text: "If 8 exercise books cost ₦2,400, how much will 5 exercise books cost?",
    option_a: "₦1,200",
    option_b: "₦1,500",
    option_c: "₦1,600",
    option_d: "₦1,800",
    correct_option: "B",
    explanation: "Cost of 1 book = 2400 / 8 = ₦300. Cost of 5 books = 5 × 300 = ₦1,500."
  },
  {
    topic: "Money & Commercial Arithmetic",
    difficulty: "Junior",
    question_text: "Three students share ₦6,000 in the ratio 1 : 2 : 3. What is the largest share?",
    option_a: "₦1,000",
    option_b: "₦2,000",
    option_c: "₦3,000",
    option_d: "₦4,000",
    correct_option: "C",
    explanation: "Total parts = 1 + 2 + 3 = 6. Largest share = (3/6) × 6000 = ₦3,000."
  },

  // ── JSS1 - JSS3 Syllabus: Word Problems (32-36) ──
  {
    topic: "Word Problems",
    difficulty: "Junior",
    question_text: "The sum of three consecutive whole numbers is 42. What is the smallest number?",
    option_a: "12",
    option_b: "13",
    option_c: "14",
    option_d: "15",
    correct_option: "B",
    explanation: "n + (n+1) + (n+2) = 42 => 3n + 3 = 42 => 3n = 39 => n = 13. Numbers are 13, 14, 15."
  },
  {
    topic: "Word Problems",
    difficulty: "Junior",
    question_text: "A father is 4 times as old as his daughter. If the sum of their ages is 50 years, how old is the daughter?",
    option_a: "8 years",
    option_b: "10 years",
    option_c: "12 years",
    option_d: "15 years",
    correct_option: "B",
    explanation: "d + 4d = 50 => 5d = 50 => d = 10 years."
  },
  {
    topic: "Word Problems",
    difficulty: "Junior",
    question_text: "A school bus travels 180 km in 3 hours at uniform speed. What is its average speed in km/h?",
    option_a: "50 km/h",
    option_b: "60 km/h",
    option_c: "65 km/h",
    option_d: "70 km/h",
    correct_option: "B",
    explanation: "Speed = Distance / Time = 180 km / 3 h = 60 km/h."
  },
  {
    topic: "Word Problems",
    difficulty: "Junior",
    question_text: "In a class of 40 students, 60% are girls. How many boys are in the class?",
    option_a: "14",
    option_b: "16",
    option_c: "20",
    option_d: "24",
    correct_option: "B",
    explanation: "Percentage of boys = 100% - 60% = 40%. Boys = 40% of 40 = 0.4 × 40 = 16."
  },
  {
    topic: "Word Problems",
    difficulty: "Junior",
    question_text: "When 15 is subtracted from twice a certain number, the result is 35. Find the number.",
    option_a: "20",
    option_b: "25",
    option_c: "30",
    option_d: "35",
    correct_option: "B",
    explanation: "2x - 15 = 35 => 2x = 50 => x = 25."
  }
];

function seedArenaQuestions() {
  db.serialize(() => {
    db.run("DELETE FROM arena_questions", [], (err) => {
      if (err) console.error("Error clearing arena questions:", err);
    });

    const stmt = db.prepare(`
      INSERT INTO arena_questions (topic, difficulty, question_text, option_a, option_b, option_c, option_d, correct_option, explanation)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    arenaQuestions.forEach((q) => {
      stmt.run([
        q.topic,
        q.difficulty,
        q.question_text,
        q.option_a,
        q.option_b,
        q.option_c,
        q.option_d,
        q.correct_option,
        q.explanation
      ]);
    });

    stmt.finalize(() => {
      console.log(`✅ Successfully seeded ${arenaQuestions.length} Math Arena questions!`);
    });
  });
}

module.exports = { seedArenaQuestions, arenaQuestions };

if (require.main === module) {
  seedArenaQuestions();
}
