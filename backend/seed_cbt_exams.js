const db = require('./database');

const examsData = [
  {
    id: 1,
    title: "JSS1 Mathematics Championship",
    grade_level: "JSS1",
    subject: "Mathematics",
    duration_minutes: 25,
    total_questions: 15,
    instructions: "Standard JSS1 National Curriculum & Lagos State Unified Scheme. Answer all 15 questions. Scientific calculators not allowed.",
    questions: [
      {
        question_number: 1,
        question_text: "What is the place value of the digit 7 in the number 472,981?",
        option_a: "700 (Hundreds)",
        option_b: "7,000 (Thousands)",
        option_c: "70,000 (Ten Thousands)",
        option_d: "700,000 (Hundred Thousands)",
        correct_option: "C",
        explanation: "In 472,981, counting from the right: 1 is Units, 8 is Tens, 9 is Hundreds, 2 is Thousands, and 7 is Ten Thousands (70,000)."
      },
      {
        question_number: 2,
        question_text: "Find the Highest Common Factor (H.C.F) of 24, 36, and 48.",
        option_a: "6",
        option_b: "12",
        option_c: "18",
        option_d: "24",
        correct_option: "B",
        explanation: "Prime factorizations: 24 = 2³ × 3; 36 = 2² × 3²; 48 = 2⁴ × 3. The common prime factors with lowest powers are 2² × 3 = 4 × 3 = 12."
      },
      {
        question_number: 3,
        question_text: "Express 3/8 as a percentage.",
        option_a: "37.5%",
        option_b: "35.0%",
        option_c: "32.5%",
        option_d: "40.0%",
        correct_option: "A",
        explanation: "To convert a fraction to a percentage, multiply by 100%: (3 / 8) × 100% = 300 / 8 = 37.5%."
      },
      {
        question_number: 4,
        question_text: "Simplify: 2 1/3 + 1 1/2 - 5/6.",
        option_a: "2 1/2",
        option_b: "3",
        option_c: "3 1/6",
        option_d: "3 1/3",
        correct_option: "B",
        explanation: "Add whole numbers: 2 + 1 = 3. Add fractions: 1/3 + 1/2 - 5/6 with common denominator 6: (2 + 3 - 5)/6 = 0/6 = 0. Total = 3."
      },
      {
        question_number: 5,
        question_text: "Simplify: -18 - (-7) + (-5).",
        option_a: "-20",
        option_b: "-16",
        option_c: "-6",
        option_d: "-30",
        correct_option: "B",
        explanation: "Subtracting a negative is adding: -18 + 7 - 5 = -11 - 5 = -16."
      },
      {
        question_number: 6,
        question_text: "Solve for x in the equation: 4x - 9 = 27.",
        option_a: "7",
        option_b: "8",
        option_c: "9",
        option_d: "10",
        correct_option: "C",
        explanation: "Add 9 to both sides: 4x = 27 + 9 = 36. Divide by 4: x = 36 / 4 = 9."
      },
      {
        question_number: 7,
        question_text: "Two complementary angles are in the ratio 2 : 3. Find the measure of the larger angle.",
        option_a: "36°",
        option_b: "54°",
        option_c: "72°",
        option_d: "108°",
        correct_option: "B",
        explanation: "Complementary angles add up to 90°. Total ratio parts = 2 + 3 = 5. The larger angle = (3/5) × 90° = 3 × 18° = 54°."
      },
      {
        question_number: 8,
        question_text: "A rectangular sports pitch has a length of 18 meters and a width of 12 meters. Calculate its perimeter.",
        option_a: "60 m",
        option_b: "216 m",
        option_c: "30 m",
        option_d: "120 m",
        correct_option: "A",
        explanation: "Perimeter = 2 × (Length + Width) = 2 × (18 m + 12 m) = 2 × 30 m = 60 m."
      },
      {
        question_number: 9,
        question_text: "In triangle ABC, angle A = 65° and angle B = 45°. What is the measure of angle C?",
        option_a: "60°",
        option_b: "70°",
        option_c: "75°",
        option_d: "80°",
        correct_option: "B",
        explanation: "The interior angles of any triangle sum to 180°. Angle C = 180° - (65° + 45°) = 180° - 110° = 70°."
      },
      {
        question_number: 10,
        question_text: "Round the decimal number 0.04863 to two significant figures.",
        option_a: "0.04",
        option_b: "0.048",
        option_c: "0.049",
        option_d: "0.050",
        correct_option: "C",
        explanation: "The first non-zero digit is 4 (1st sig fig), followed by 8 (2nd sig fig). The next digit is 6 (>= 5), so 8 rounds up to 9, giving 0.049."
      },
      {
        question_number: 11,
        question_text: "Divide ₦15,000 between Jeffrey and Tolu in the ratio 2 : 3. How much does Tolu receive?",
        option_a: "₦6,000",
        option_b: "₦7,500",
        option_c: "₦9,000",
        option_d: "₦10,000",
        correct_option: "C",
        explanation: "Total parts = 2 + 3 = 5. One part = ₦15,000 / 5 = ₦3,000. Tolu has 3 parts: 3 × ₦3,000 = ₦9,000."
      },
      {
        question_number: 12,
        question_text: "Find the mode of the numbers: 5, 8, 3, 5, 9, 5, 2, 8.",
        option_a: "8",
        option_b: "5",
        option_c: "3",
        option_d: "6",
        correct_option: "B",
        explanation: "The mode is the number appearing with the highest frequency. 5 appears 3 times, while 8 appears twice."
      },
      {
        question_number: 13,
        question_text: "Convert the binary number 11011₂ to base ten.",
        option_a: "23",
        option_b: "25",
        option_c: "27",
        option_d: "29",
        correct_option: "C",
        explanation: "1×2⁴ + 1×2³ + 0×2² + 1×2¹ + 1×2⁰ = 16 + 8 + 0 + 2 + 1 = 27."
      },
      {
        question_number: 14,
        question_text: "Calculate the Simple Interest on ₦8,000 borrowed for 3 years at 5% per annum.",
        option_a: "₦400",
        option_b: "₦800",
        option_c: "₦1,200",
        option_d: "₦1,500",
        correct_option: "C",
        explanation: "Simple Interest I = (Principal × Rate × Time) / 100 = (8,000 × 5 × 3) / 100 = ₦1,200."
      },
      {
        question_number: 15,
        question_text: "How many lines of reflective symmetry does an equilateral triangle have?",
        option_a: "1",
        option_b: "2",
        option_c: "3",
        option_d: "0",
        correct_option: "C",
        explanation: "An equilateral triangle has 3 lines of symmetry, each passing from a vertex to the midpoint of the opposite side."
      }
    ]
  },
  {
    id: 2,
    title: "JSS2 Mathematics Championship",
    grade_level: "JSS2",
    subject: "Mathematics",
    duration_minutes: 30,
    total_questions: 15,
    instructions: "Standard JSS2 National Curriculum & Lagos State Scheme. Focus on standard form, algebra, Pythagoras theorem, and mensuration.",
    questions: [
      {
        question_number: 1,
        question_text: "Express 0.000378 in standard form (scientific notation).",
        option_a: "3.78 × 10⁻⁴",
        option_b: "3.78 × 10⁻³",
        option_c: "37.8 × 10⁻⁵",
        option_d: "3.78 × 10⁴",
        correct_option: "A",
        explanation: "Move the decimal point 4 places to the right to place it between 3 and 7: 3.78 × 10⁻⁴."
      },
      {
        question_number: 2,
        question_text: "Expand and simplify the algebraic expression: (2x - 3)(x + 5).",
        option_a: "2x² + 7x - 15",
        option_b: "2x² - 7x - 15",
        option_c: "2x² + 10x - 15",
        option_d: "2x² + 7x + 15",
        correct_option: "A",
        explanation: "Using FOIL: 2x(x) + 2x(5) - 3(x) - 3(5) = 2x² + 10x - 3x - 15 = 2x² + 7x - 15."
      },
      {
        question_number: 3,
        question_text: "Factorize completely: 8ax - 12ay + 4a.",
        option_a: "4a(2x - 3y)",
        option_b: "4a(2x - 3y + 1)",
        option_c: "2a(4x - 6y + 2)",
        option_d: "4a(2x + 3y - 1)",
        correct_option: "B",
        explanation: "The highest common factor of all three terms is 4a. Factoring out 4a gives 4a(2x - 3y + 1)."
      },
      {
        question_number: 4,
        question_text: "Solve for x: 5(x - 3) = 2(x + 6).",
        option_a: "x = 7",
        option_b: "x = 8",
        option_c: "x = 9",
        option_d: "x = 11",
        correct_option: "C",
        explanation: "Expand: 5x - 15 = 2x + 12. Rearrange: 5x - 2x = 12 + 15 => 3x = 27 => x = 9."
      },
      {
        question_number: 5,
        question_text: "Solve the linear inequality: 3x - 4 > 11.",
        option_a: "x > 3",
        option_b: "x > 5",
        option_c: "x < 5",
        option_d: "x ≥ 5",
        correct_option: "B",
        explanation: "Add 4 to both sides: 3x > 15. Divide by 3: x > 5."
      },
      {
        question_number: 6,
        question_text: "In a right-angled triangle, the two shorter sides measure 9 cm and 12 cm. Find the hypotenuse.",
        option_a: "14 cm",
        option_b: "15 cm",
        option_c: "16 cm",
        option_d: "21 cm",
        correct_option: "B",
        explanation: "By Pythagoras' theorem: c² = a² + b² = 9² + 12² = 81 + 144 = 225. c = √225 = 15 cm."
      },
      {
        question_number: 7,
        question_text: "Find the area of a parallelogram with a base of 15 cm and a perpendicular height of 8 cm.",
        option_a: "60 cm²",
        option_b: "110 cm²",
        option_c: "120 cm²",
        option_d: "150 cm²",
        correct_option: "C",
        explanation: "Area of parallelogram = Base × Perpendicular Height = 15 cm × 8 cm = 120 cm²."
      },
      {
        question_number: 8,
        question_text: "Find the circumference of a circle whose radius is 14 cm. (Take π = 22/7).",
        option_a: "44 cm",
        option_b: "88 cm",
        option_c: "132 cm",
        option_d: "616 cm",
        correct_option: "B",
        explanation: "Circumference = 2πr = 2 × (22/7) × 14 = 2 × 22 × 2 = 88 cm."
      },
      {
        question_number: 9,
        question_text: "Calculate the sum of the interior angles of a regular pentagon (5-sided polygon).",
        option_a: "360°",
        option_b: "540°",
        option_c: "720°",
        option_d: "900°",
        correct_option: "B",
        explanation: "Sum of interior angles = (n - 2) × 180° = (5 - 2) × 180° = 3 × 180° = 540°."
      },
      {
        question_number: 10,
        question_text: "A single fair six-sided die is rolled once. What is the probability of rolling a prime number?",
        option_a: "1/6",
        option_b: "1/3",
        option_c: "1/2",
        option_d: "2/3",
        correct_option: "C",
        explanation: "The prime numbers on a die are {2, 3, 5} (3 possible outcomes out of 6). P = 3/6 = 1/2."
      },
      {
        question_number: 11,
        question_text: "If 8 workers can construct a laboratory wall in 6 days, how many days will 12 workers take at the same rate?",
        option_a: "3 days",
        option_b: "4 days",
        option_c: "5 days",
        option_d: "9 days",
        correct_option: "B",
        explanation: "Inverse proportion: Total worker-days = 8 × 6 = 48. Days required for 12 workers = 48 / 12 = 4 days."
      },
      {
        question_number: 12,
        question_text: "A trader bought a scientific calculator for ₦3,000 and sold it for ₦3,750. What was the percentage profit?",
        option_a: "20%",
        option_b: "25%",
        option_c: "30%",
        option_d: "35%",
        correct_option: "B",
        explanation: "Profit = ₦3,750 - ₦3,000 = ₦750. Percentage profit = (750 / 3,000) × 100% = 25%."
      },
      {
        question_number: 13,
        question_text: "Simplify using the laws of indices: (3⁴ × 3⁵) ÷ 3⁷.",
        option_a: "3",
        option_b: "6",
        option_c: "9",
        option_d: "27",
        correct_option: "C",
        explanation: "Applying index laws: 3^(4 + 5 - 7) = 3² = 9."
      },
      {
        question_number: 14,
        question_text: "The mean of five test scores: 12, 16, 20, x, and 28 is 20. Find the value of x.",
        option_a: "20",
        option_b: "22",
        option_c: "24",
        option_d: "26",
        correct_option: "C",
        explanation: "Sum = Mean × 5 = 20 × 5 = 100. 12 + 16 + 20 + 28 = 76. Therefore, x = 100 - 76 = 24."
      },
      {
        question_number: 15,
        question_text: "If the three-figure bearing of point A from point B is 065°, what is the back bearing of B from A?",
        option_a: "115°",
        option_b: "205°",
        option_c: "245°",
        option_d: "295°",
        correct_option: "C",
        explanation: "Since the forward bearing is less than 180°, add 180°: 065° + 180° = 245°."
      }
    ]
  },
  {
    id: 3,
    title: "JSS3 BECE Math Excellence Contest",
    grade_level: "JSS3",
    subject: "Mathematics",
    duration_minutes: 30,
    total_questions: 15,
    instructions: "Official BECE & Junior WAEC Examination Standard. Questions test mastery of simultaneous equations, trigonometry, quadratic expressions, and geometry.",
    questions: [
      {
        question_number: 1,
        question_text: "Evaluate in base two: 1101₂ + 1011₂.",
        option_a: "10100₂",
        option_b: "11000₂",
        option_c: "11010₂",
        option_d: "11100₂",
        correct_option: "B",
        explanation: "1101₂ = 13 in base 10; 1011₂ = 11 in base 10. 13 + 11 = 24. Converting 24 back to base 2 yields 11000₂."
      },
      {
        question_number: 2,
        question_text: "Solve the simultaneous equations: 2x + y = 11 and x - y = 1.",
        option_a: "x = 3, y = 5",
        option_b: "x = 4, y = 3",
        option_c: "x = 5, y = 1",
        option_d: "x = 4, y = 2",
        correct_option: "B",
        explanation: "Adding both equations eliminates y: (2x + y) + (x - y) = 11 + 1 => 3x = 12 => x = 4. Substitute into 2nd equation: 4 - y = 1 => y = 3."
      },
      {
        question_number: 3,
        question_text: "Factorize completely the quadratic expression: x² - 8x + 15.",
        option_a: "(x - 3)(x - 5)",
        option_b: "(x + 3)(x + 5)",
        option_c: "(x - 2)(x - 6)",
        option_d: "(x - 1)(x - 15)",
        correct_option: "A",
        explanation: "Find two factors whose product is +15 and whose sum is -8: (-3) and (-5). Hence (x - 3)(x - 5)."
      },
      {
        question_number: 4,
        question_text: "Evaluate without tables or calculator: 65² - 35².",
        option_a: "2,500",
        option_b: "3,000",
        option_c: "3,500",
        option_d: "4,000",
        correct_option: "B",
        explanation: "Difference of two squares formula: a² - b² = (a - b)(a + b) = (65 - 35)(65 + 35) = 30 × 100 = 3,000."
      },
      {
        question_number: 5,
        question_text: "A 12-meter ladder leans against a vertical classroom wall making an angle of 30° with the ground. How high does it reach? (sin 30° = 0.5).",
        option_a: "6 meters",
        option_b: "8 meters",
        option_c: "10 meters",
        option_d: "10.4 meters",
        correct_option: "A",
        explanation: "sin(30°) = Height / Hypotenuse => Height = 12 × sin(30°) = 12 × 0.5 = 6 meters."
      },
      {
        question_number: 6,
        question_text: "Find the volume of a solid cylinder of radius 7 cm and height 10 cm. (Take π = 22/7).",
        option_a: "440 cm³",
        option_b: "770 cm³",
        option_c: "1,540 cm³",
        option_d: "3,080 cm³",
        correct_option: "C",
        explanation: "Volume = πr²h = (22/7) × 7 × 7 × 10 = 22 × 7 × 10 = 1,540 cm³."
      },
      {
        question_number: 7,
        question_text: "Make t the subject of the formula: v = u + at.",
        option_a: "t = (v + u) / a",
        option_b: "t = (v - u) / a",
        option_c: "t = a / (v - u)",
        option_d: "t = v - ua",
        correct_option: "B",
        explanation: "Subtract u: v - u = at. Divide by a: t = (v - u) / a."
      },
      {
        question_number: 8,
        question_text: "Find the slope (gradient) of the straight line joining the points P(3, 4) and Q(7, 16).",
        option_a: "2",
        option_b: "3",
        option_c: "4",
        option_d: "5",
        correct_option: "B",
        explanation: "Gradient m = (y₂ - y₁) / (x₂ - x₁) = (16 - 4) / (7 - 3) = 12 / 4 = 3."
      },
      {
        question_number: 9,
        question_text: "Calculate the Compound Interest on ₦20,000 for 2 years at 10% per annum compounded annually.",
        option_a: "₦2,000",
        option_b: "₦4,000",
        option_c: "₦4,200",
        option_d: "₦4,400",
        correct_option: "C",
        explanation: "Year 1 interest = 10% of 20,000 = ₦2,000 (New principal = ₦22,000). Year 2 interest = 10% of 22,000 = ₦2,200. Total CI = 2,000 + 2,200 = ₦4,200."
      },
      {
        question_number: 10,
        question_text: "If y varies directly as the square of x, and y = 32 when x = 4, find y when x = 3.",
        option_a: "12",
        option_b: "18",
        option_c: "24",
        option_d: "28",
        correct_option: "B",
        explanation: "y = kx² => 32 = k(4²) => 32 = 16k => k = 2. When x = 3, y = 2(3²) = 2 × 9 = 18."
      },
      {
        question_number: 11,
        question_text: "Simplify the algebraic fraction: (x² - 16) / (x - 4), where x ≠ 4.",
        option_a: "x - 4",
        option_b: "x + 4",
        option_c: "x + 16",
        option_d: "1",
        correct_option: "B",
        explanation: "Factor numerator as difference of squares: (x - 4)(x + 4) / (x - 4) = x + 4."
      },
      {
        question_number: 12,
        question_text: "In a survey of 120 students, 40 chose Mathematics as their favorite subject. What angle represents this on a pie chart?",
        option_a: "90°",
        option_b: "100°",
        option_c: "120°",
        option_d: "150°",
        correct_option: "C",
        explanation: "Sector angle = (Frequency / Total) × 360° = (40 / 120) × 360° = (1/3) × 360° = 120°."
      },
      {
        question_number: 13,
        question_text: "A cone has a base radius of 6 cm and a vertical height of 8 cm. Find its slant height.",
        option_a: "9 cm",
        option_b: "10 cm",
        option_c: "12 cm",
        option_d: "14 cm",
        correct_option: "B",
        explanation: "By Pythagoras: l² = r² + h² = 6² + 8² = 36 + 64 = 100 => l = √100 = 10 cm."
      },
      {
        question_number: 14,
        question_text: "Solve the quadratic equation by factoring: x² - 5x = 0.",
        option_a: "x = 0 or x = -5",
        option_b: "x = 0 or x = 5",
        option_c: "x = 5 only",
        option_d: "x = -5 only",
        correct_option: "B",
        explanation: "Factor out x: x(x - 5) = 0 => x = 0 or x - 5 = 0 => x = 0 or x = 5."
      },
      {
        question_number: 15,
        question_text: "Solve for x: (2/3)x + 1/2 = 5/6.",
        option_a: "1/4",
        option_b: "1/2",
        option_c: "3/4",
        option_d: "1",
        correct_option: "B",
        explanation: "Subtract 1/2: (2/3)x = 5/6 - 3/6 = 2/6 = 1/3. Multiply both sides by 3/2: x = (1/3) × (3/2) = 1/2."
      }
    ]
  },
  {
    id: 4,
    title: "Inter-Class Mega Clash (JSS1 vs JSS2 vs JSS3)",
    grade_level: "Inter-Class",
    subject: "Mathematics",
    duration_minutes: 35,
    total_questions: 20,
    instructions: "High-speed inter-class contest. Combines arithmetic agility, algebraic precision, and geometric reasoning across all junior secondary classes.",
    questions: [
      {
        question_number: 1,
        question_text: "Find the L.C.M of 12, 18, and 30.",
        option_a: "60",
        option_b: "120",
        option_c: "180",
        option_d: "360",
        correct_option: "C",
        explanation: "12 = 2² × 3; 18 = 2 × 3²; 30 = 2 × 3 × 5. LCM = 2² × 3² × 5 = 4 × 9 × 5 = 180."
      },
      {
        question_number: 2,
        question_text: "What is 15% of ₦48,000?",
        option_a: "₦6,400",
        option_b: "₦7,200",
        option_c: "₦7,500",
        option_d: "₦8,000",
        correct_option: "B",
        explanation: "(15 / 100) × 48,000 = 15 × 480 = ₦7,200."
      },
      {
        question_number: 3,
        question_text: "If 3x + 7 = 34, find the value of 2x - 3.",
        option_a: "15",
        option_b: "18",
        option_c: "21",
        option_d: "24",
        correct_option: "A",
        explanation: "3x = 34 - 7 = 27 => x = 9. Then 2x - 3 = 2(9) - 3 = 18 - 3 = 15."
      },
      {
        question_number: 4,
        question_text: "The interior angles of a quadrilateral are 2x, 3x, 4x, and 90°. Find the value of x.",
        option_a: "25°",
        option_b: "30°",
        option_c: "35°",
        option_d: "40°",
        correct_option: "B",
        explanation: "Sum of angles in quadrilateral = 360°. 2x + 3x + 4x + 90 = 360 => 9x = 270 => x = 30°."
      },
      {
        question_number: 5,
        question_text: "Evaluate: (-4) × (-6) ÷ (-2).",
        option_a: "12",
        option_b: "-12",
        option_c: "24",
        option_d: "-24",
        correct_option: "B",
        explanation: "(-4) × (-6) = +24. Then +24 ÷ (-2) = -12."
      },
      {
        question_number: 6,
        question_text: "Convert 45 (base 10) to a binary number.",
        option_a: "101101₂",
        option_b: "110101₂",
        option_c: "101011₂",
        option_d: "111001₂",
        correct_option: "A",
        explanation: "45 = 32 + 8 + 4 + 1 = 1×2⁵ + 0×2⁴ + 1×2³ + 1×2² + 0×2¹ + 1×2⁰ = 101101₂."
      },
      {
        question_number: 7,
        question_text: "A car travels 240 km in 3 hours. How far will it travel in 5 hours at the same constant speed?",
        option_a: "360 km",
        option_b: "400 km",
        option_c: "420 km",
        option_d: "480 km",
        correct_option: "B",
        explanation: "Speed = 240 / 3 = 80 km/h. In 5 hours, Distance = 80 × 5 = 400 km."
      },
      {
        question_number: 8,
        question_text: "Find the area of a circle with a diameter of 14 cm. (π = 22/7).",
        option_a: "88 cm²",
        option_b: "154 cm²",
        option_c: "308 cm²",
        option_d: "616 cm²",
        correct_option: "B",
        explanation: "Radius r = 14 / 2 = 7 cm. Area = πr² = (22/7) × 7 × 7 = 154 cm²."
      },
      {
        question_number: 9,
        question_text: "If a = 3 and b = -2, evaluate a² - 2ab + b².",
        option_a: "1",
        option_b: "25",
        option_c: "13",
        option_d: "37",
        correct_option: "B",
        explanation: "a² - 2ab + b² = (a - b)² = (3 - (-2))² = (3 + 2)² = 5² = 25."
      },
      {
        question_number: 10,
        question_text: "A bag contains 5 red balls, 3 blue balls, and 2 green balls. A ball is picked at random. What is the probability of picking a blue ball?",
        option_a: "1/5",
        option_b: "3/10",
        option_c: "1/2",
        option_d: "3/7",
        correct_option: "B",
        explanation: "Total balls = 5 + 3 + 2 = 10. Blue balls = 3. P(Blue) = 3/10."
      },
      {
        question_number: 11,
        question_text: "In a right-angled triangle, if cos θ = 4/5, what is tan θ?",
        option_a: "3/5",
        option_b: "3/4",
        option_c: "4/3",
        option_d: "5/4",
        correct_option: "B",
        explanation: "Adjacent = 4, Hypotenuse = 5. By Pythagoras, Opposite = √(5² - 4²) = √(25 - 16) = √9 = 3. tan θ = Opp / Adj = 3/4."
      },
      {
        question_number: 12,
        question_text: "Factorize completely: 4x² - 25y².",
        option_a: "(2x - 5y)²",
        option_b: "(2x - 5y)(2x + 5y)",
        option_c: "(4x - 5y)(x + 5y)",
        option_d: "2(x² - 12.5y²)",
        correct_option: "B",
        explanation: "Difference of two squares: (2x)² - (5y)² = (2x - 5y)(2x + 5y)."
      },
      {
        question_number: 13,
        question_text: "Solve the simultaneous equations: x + 2y = 8 and 3x - 2y = 8.",
        option_a: "x = 4, y = 2",
        option_b: "x = 2, y = 3",
        option_c: "x = 3, y = 2.5",
        option_d: "x = 4, y = 3",
        correct_option: "A",
        explanation: "Add both equations: 4x = 16 => x = 4. Substitute: 4 + 2y = 8 => 2y = 4 => y = 2."
      },
      {
        question_number: 14,
        question_text: "Find the median of the following test scores: 14, 18, 11, 15, 20, 13, 17.",
        option_a: "14",
        option_b: "15",
        option_c: "16",
        option_d: "17",
        correct_option: "B",
        explanation: "Arrange in ascending order: 11, 13, 14, 15, 17, 18, 20. The middle (4th) number is 15."
      },
      {
        question_number: 15,
        question_text: "What is the perimeter of a regular hexagon with each side measuring 7.5 cm?",
        option_a: "37.5 cm",
        option_b: "42.0 cm",
        option_c: "45.0 cm",
        option_d: "52.5 cm",
        correct_option: "C",
        explanation: "A regular hexagon has 6 equal sides. Perimeter = 6 × 7.5 cm = 45.0 cm."
      },
      {
        question_number: 16,
        question_text: "Express 54,000,000 in standard scientific form.",
        option_a: "5.4 × 10⁶",
        option_b: "5.4 × 10⁷",
        option_c: "54 × 10⁶",
        option_d: "5.4 × 10⁸",
        correct_option: "B",
        explanation: "Move the decimal point 7 places to the left: 5.4 × 10⁷."
      },
      {
        question_number: 17,
        question_text: "The price of a school uniform is discounted by 20% from ₦12,000. What is the new selling price?",
        option_a: "₦9,600",
        option_b: "₦10,000",
        option_c: "₦10,400",
        option_d: "₦2,400",
        correct_option: "A",
        explanation: "Discount = 20% of ₦12,000 = ₦2,400. New price = ₦12,000 - ₦2,400 = ₦9,600."
      },
      {
        question_number: 18,
        question_text: "Solve the inequality: 7 - 2x ≤ 3.",
        option_a: "x ≤ 2",
        option_b: "x ≥ 2",
        option_c: "x ≥ -2",
        option_d: "x ≤ -2",
        correct_option: "B",
        explanation: "-2x ≤ 3 - 7 => -2x ≤ -4. Dividing by -2 reverses the inequality sign: x ≥ 2."
      },
      {
        question_number: 19,
        question_text: "Find the surface area of a cube whose volume is 64 cm³.",
        option_a: "48 cm²",
        option_b: "64 cm²",
        option_c: "96 cm²",
        option_d: "128 cm²",
        correct_option: "C",
        explanation: "Side length s = ∛64 = 4 cm. Total surface area = 6s² = 6 × (4²) = 6 × 16 = 96 cm²."
      },
      {
        question_number: 20,
        question_text: "In the Caesium Vault inter-class tournament, JSS1 scored 85 points and JSS2 scored 95 points. What is the percentage of JSS2's score relative to the combined total?",
        option_a: "47.2%",
        option_b: "52.8%",
        option_c: "55.0%",
        option_d: "60.0%",
        correct_option: "B",
        explanation: "Total score = 85 + 95 = 180 points. JSS2 percentage = (95 / 180) × 100% = 52.77% ≈ 52.8%."
      }
    ]
  }
];

function seed() {
  db.serialize(() => {
    console.log("🌱 Seeding CBT Examination Competitions...");

    examsData.forEach((exam) => {
      // Upsert exam
      db.run(
        `INSERT OR REPLACE INTO exams (id, title, grade_level, subject, duration_minutes, total_questions, instructions)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [exam.id, exam.title, exam.grade_level, exam.subject, exam.duration_minutes, exam.total_questions, exam.instructions],
        function (err) {
          if (err) {
            console.error(`Error inserting exam ${exam.title}:`, err.message);
            return;
          }

          // Delete existing questions for this exam to prevent duplication
          db.run(`DELETE FROM exam_questions WHERE exam_id = ?`, [exam.id], (err) => {
            const stmt = db.prepare(`
              INSERT INTO exam_questions (exam_id, question_number, question_text, option_a, option_b, option_c, option_d, correct_option, explanation)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

            exam.questions.forEach((q) => {
              stmt.run(
                exam.id,
                q.question_number,
                q.question_text,
                q.option_a,
                q.option_b,
                q.option_c,
                q.option_d,
                q.correct_option,
                q.explanation
              );
            });

            stmt.finalize();
            console.log(`✅ Loaded ${exam.questions.length} questions for: ${exam.title} (${exam.grade_level})`);
          });
        }
      );
    });
  });
}

setTimeout(() => {
  seed();
}, 1000);
