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
  },
  // ── Mental Math & Speed Shortcuts (37-46) ──
  {
    topic: "Mental Math & Shortcuts",
    difficulty: "Junior",
    question_text: "Calculate mentally: What is 16% of 50?",
    option_a: "6",
    option_b: "8",
    option_c: "12",
    option_d: "16",
    correct_option: "B",
    explanation: "Mental trick: x% of y = y% of x. 16% of 50 = 50% of 16 = half of 16 = 8."
  },
  {
    topic: "Mental Math & Shortcuts",
    difficulty: "Junior",
    question_text: "What is 65²?",
    option_a: "4,125",
    option_b: "4,225",
    option_c: "4,325",
    option_d: "4,255",
    correct_option: "B",
    explanation: "Mental rule for squaring numbers ending in 5: Multiply tens digit (6) by the next number (7) = 42, then attach 25 -> 4,225."
  },
  {
    topic: "Mental Math & Shortcuts",
    difficulty: "Junior",
    question_text: "Evaluate mentally: 51² - 49²",
    option_a: "100",
    option_b: "150",
    option_c: "200",
    option_d: "250",
    correct_option: "C",
    explanation: "Difference of two squares: a² - b² = (a + b)(a - b) = (51 + 49)(51 - 49) = 100 × 2 = 200."
  },
  {
    topic: "Mental Math & Shortcuts",
    difficulty: "Junior",
    question_text: "What is 45 × 11?",
    option_a: "455",
    option_b: "495",
    option_c: "505",
    option_d: "545",
    correct_option: "B",
    explanation: "Mental shortcut for multiplying by 11: Add 4 + 5 = 9 and place it between 4 and 5 -> 495."
  },
  {
    topic: "Mental Math & Shortcuts",
    difficulty: "Junior",
    question_text: "Multiply mentally: 36 × 25",
    option_a: "850",
    option_b: "900",
    option_c: "950",
    option_d: "1,000",
    correct_option: "B",
    explanation: "Shortcut: Multiplying by 25 is dividing by 4 and multiplying by 100. 36 ÷ 4 = 9; 9 × 100 = 900."
  },
  {
    topic: "Mental Math & Shortcuts",
    difficulty: "Junior",
    question_text: "What is the sum of the first 10 positive odd numbers (1 + 3 + 5 + ... + 19)?",
    option_a: "90",
    option_b: "100",
    option_c: "110",
    option_d: "120",
    correct_option: "B",
    explanation: "The sum of the first n positive odd integers is always n². For n = 10, 10² = 100."
  },
  {
    topic: "Mental Math & Shortcuts",
    difficulty: "Junior",
    question_text: "Find the sum of all integers from 1 to 20: (1 + 2 + 3 + ... + 20)",
    option_a: "190",
    option_b: "200",
    option_c: "210",
    option_d: "220",
    correct_option: "C",
    explanation: "Sum formula: n(n + 1)/2 = 20 × 21 / 2 = 10 × 21 = 210."
  },
  {
    topic: "Mental Math & Shortcuts",
    difficulty: "Junior",
    question_text: "Calculate 15 × 18 mentally using doubling and halving.",
    option_a: "240",
    option_b: "260",
    option_c: "270",
    option_d: "280",
    correct_option: "C",
    explanation: "Double 15 = 30; halve 18 = 9. 30 × 9 = 270."
  },
  {
    topic: "Mental Math & Shortcuts",
    difficulty: "Junior",
    question_text: "What number must be added to 347 to make exactly 1,000?",
    option_a: "643",
    option_b: "653",
    option_c: "663",
    option_d: "753",
    correct_option: "B",
    explanation: "Vedic complement rule (all from 9, last from 10): 9-3=6, 9-4=5, 10-7=3 -> 653."
  },
  {
    topic: "Mental Math & Shortcuts",
    difficulty: "Junior",
    question_text: "Simplify mentally: (2⁸ × 2⁵) ÷ 2¹⁰",
    option_a: "4",
    option_b: "8",
    option_c: "16",
    option_d: "32",
    correct_option: "B",
    explanation: "Laws of indices: 2^(8 + 5 - 10) = 2³ = 8."
  },

  // ── Logical Reasoning & Math Puzzles (47-66) ──
  {
    topic: "Logical Reasoning",
    difficulty: "Junior",
    question_text: "A notebook and a pen cost ₦1,100 in total. If the notebook costs ₦1,000 more than the pen, what is the price of the pen?",
    option_a: "₦50",
    option_b: "₦100",
    option_c: "₦150",
    option_d: "₦200",
    correct_option: "A",
    explanation: "Let pen = p. Notebook = p + 1000. 2p + 1000 = 1100 => 2p = 100 => p = ₦50. (Notebook = ₦1,050)."
  },
  {
    topic: "Geometry & Clock Logic",
    difficulty: "Junior",
    question_text: "At exactly 3:00, what is the angle between the hour hand and the minute hand of a clock?",
    option_a: "60°",
    option_b: "75°",
    option_c: "90°",
    option_d: "120°",
    correct_option: "C",
    explanation: "The minute hand is at 12 and the hour hand is at 3. 3 intervals of 30° = 90°."
  },
  {
    topic: "Geometry & Clock Logic",
    difficulty: "Junior",
    question_text: "At 3:30, what is the angle between the hour hand and the minute hand?",
    option_a: "60°",
    option_b: "75°",
    option_c: "85°",
    option_d: "90°",
    correct_option: "B",
    explanation: "At 3:30, the minute hand points to 6 (180°). The hour hand is halfway between 3 and 4 (3.5 × 30° = 105°). Angle = 180° - 105° = 75°."
  },
  {
    topic: "Logical Reasoning",
    difficulty: "Junior",
    question_text: "If 4 workers take 6 hours to paint a hall, how many hours will 8 workers take at the same pace?",
    option_a: "2 hours",
    option_b: "3 hours",
    option_c: "4 hours",
    option_d: "12 hours",
    correct_option: "B",
    explanation: "Inverse proportion: 4 × 6 = 24 worker-hours. With 8 workers: 24 ÷ 8 = 3 hours."
  },
  {
    topic: "Commercial Arithmetic",
    difficulty: "Junior",
    question_text: "An article is sold for ₦4,000 after a 20% discount. What was the original price?",
    option_a: "₦4,800",
    option_b: "₦5,000",
    option_c: "₦5,200",
    option_d: "₦6,000",
    correct_option: "B",
    explanation: "80% of original price = ₦4,000. Original price = 4000 ÷ 0.8 = ₦5,000."
  },
  {
    topic: "Number Logic",
    difficulty: "Junior",
    question_text: "If the 4-digit number 53A4 is divisible by 9, find the digit A.",
    option_a: "3",
    option_b: "6",
    option_c: "7",
    option_d: "9",
    correct_option: "B",
    explanation: "Sum of digits must be a multiple of 9: 5 + 3 + A + 4 = 12 + A. Next multiple of 9 is 18 => A = 6."
  },
  {
    topic: "Number Logic",
    difficulty: "Junior",
    question_text: "What is the only even prime number?",
    option_a: "0",
    option_b: "1",
    option_c: "2",
    option_d: "4",
    correct_option: "C",
    explanation: "2 is the only even prime number; every larger even number is divisible by 2 and therefore composite."
  },
  {
    topic: "Logical Reasoning",
    difficulty: "Junior",
    question_text: "Five friends meet and each shakes hands with every other person once. How many total handshakes occur?",
    option_a: "5",
    option_b: "10",
    option_c: "15",
    option_d: "20",
    correct_option: "B",
    explanation: "Combinations formula: n(n - 1) / 2 = 5 × 4 / 2 = 10 handshakes."
  },
  {
    topic: "Number Logic",
    difficulty: "Junior",
    question_text: "If today is Wednesday, what day of the week will it be in exactly 100 days?",
    option_a: "Thursday",
    option_b: "Friday",
    option_c: "Saturday",
    option_d: "Sunday",
    correct_option: "B",
    explanation: "100 ÷ 7 = 14 weeks remainder 2 days. Wednesday + 2 days = Friday."
  },
  {
    topic: "Fractions & Number Sense",
    difficulty: "Junior",
    question_text: "Which of the following fractions has the largest numerical value?",
    option_a: "5/6",
    option_b: "6/7",
    option_c: "7/8",
    option_d: "8/9",
    correct_option: "D",
    explanation: "Each fraction is 1 minus 1/n. 1 - 1/9 is closest to 1, so 8/9 is the largest."
  },
  {
    topic: "Basic Algebra",
    difficulty: "Junior",
    question_text: "If x + 1/x = 3, what is the value of x² + 1/x²?",
    option_a: "6",
    option_b: "7",
    option_c: "8",
    option_d: "9",
    correct_option: "B",
    explanation: "Square both sides: (x + 1/x)² = x² + 2 + 1/x² = 3² = 9. So x² + 1/x² = 9 - 2 = 7."
  },
  {
    topic: "Factors & Multiples",
    difficulty: "Junior",
    question_text: "Two positive numbers have a HCF (GCF) of 6 and a LCM of 72. If one number is 24, find the other number.",
    option_a: "12",
    option_b: "18",
    option_c: "36",
    option_d: "48",
    correct_option: "B",
    explanation: "Product of numbers = HCF × LCM => 24 × B = 6 × 72 = 432 => B = 432 / 24 = 18."
  },
  {
    topic: "Statistics & Averages",
    difficulty: "Junior",
    question_text: "The average of 5 consecutive whole numbers is 24. What is the largest of these 5 numbers?",
    option_a: "24",
    option_b: "25",
    option_c: "26",
    option_d: "28",
    correct_option: "C",
    explanation: "In an odd number of consecutive integers, the average is the middle number (24). The numbers are 22, 23, 24, 25, 26. The largest is 26."
  },
  {
    topic: "Mental Math & Shortcuts",
    difficulty: "Junior",
    question_text: "What is the value of 8! ÷ 6!?",
    option_a: "14",
    option_b: "48",
    option_c: "56",
    option_d: "64",
    correct_option: "C",
    explanation: "8! / 6! = (8 × 7 × 6!) / 6! = 8 × 7 = 56."
  },
  {
    topic: "Combinatorics & Logic",
    difficulty: "Junior",
    question_text: "How many 2-digit numbers can be formed where both digits are odd numbers?",
    option_a: "15",
    option_b: "20",
    option_c: "25",
    option_d: "45",
    correct_option: "C",
    explanation: "Odd digits are {1, 3, 5, 7, 9} (5 choices). Tens place = 5 choices, Units place = 5 choices. 5 × 5 = 25 numbers."
  },
  {
    topic: "Word Problems",
    difficulty: "Junior",
    question_text: "A motorist travels the first 60 km of a journey at 60 km/h, and the remaining 60 km at 40 km/h. What is the average speed for the whole 120 km journey?",
    option_a: "48 km/h",
    option_b: "50 km/h",
    option_c: "52 km/h",
    option_d: "55 km/h",
    correct_option: "A",
    explanation: "Time 1 = 60/60 = 1 hr. Time 2 = 60/40 = 1.5 hr. Total time = 2.5 hrs. Average speed = 120 / 2.5 = 48 km/h (Harmonic mean)."
  },
  {
    topic: "Number Logic & Patterns",
    difficulty: "Junior",
    question_text: "What is the units digit of 3⁴⁵?",
    option_a: "1",
    option_b: "3",
    option_c: "7",
    option_d: "9",
    correct_option: "B",
    explanation: "Units digits of powers of 3 cycle through [3, 9, 7, 1] every 4 powers. 45 ÷ 4 = 11 remainder 1. The 1st in the cycle is 3."
  },
  {
    topic: "Geometry",
    difficulty: "Junior",
    question_text: "If the radius of a circle is doubled, by what factor does its area increase?",
    option_a: "2 times",
    option_b: "4 times",
    option_c: "6 times",
    option_d: "8 times",
    correct_option: "B",
    explanation: "Area = πr². If radius doubles to 2r, new area = π(2r)² = 4πr² (increases by 4 times)."
  },
  {
    topic: "Geometry",
    difficulty: "Junior",
    question_text: "A 10-meter ladder leans against a vertical wall with its foot 6 meters away from the base of the wall. How high up the wall does the ladder reach?",
    option_a: "6 m",
    option_b: "7 m",
    option_c: "8 m",
    option_d: "9 m",
    correct_option: "C",
    explanation: "Pythagoras theorem: h² + 6² = 10² => h² + 36 = 100 => h² = 64 => h = 8 meters."
  },
  {
    topic: "Logical Reasoning",
    difficulty: "Junior",
    question_text: "If 5 cats catch 5 mice in 5 minutes, how many minutes will 100 cats take to catch 100 mice at the same rate?",
    option_a: "1 minute",
    option_b: "5 minutes",
    option_c: "20 minutes",
    option_d: "100 minutes",
    correct_option: "B",
    explanation: "Rate logic: 1 cat takes 5 minutes to catch 1 mouse. Operating simultaneously, 100 cats will catch 100 mice in exactly 5 minutes."
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
