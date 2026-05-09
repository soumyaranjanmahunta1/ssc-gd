require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('./models/Question');

const q = (question, options, answer, explanation, subject, chapter) =>
    ({ question, options, answer, explanation, subject, chapter, difficulty: 'Medium', isActive: true });

const questions = [
    // ── REASONING ──────────────────────────────────────────────────────────────
    q('Book : Library :: Painting : ?', ['Museum', 'Gallery', 'Artist', 'Canvas'], 'Gallery', 'A book is kept in a library; a painting is kept in a gallery.', 'Reasoning', 'Analogy'),
    q('Doctor : Hospital :: Teacher : ?', ['College', 'School', 'Office', 'Clinic'], 'School', 'A doctor works in a hospital; a teacher works in a school.', 'Reasoning', 'Analogy'),

    q('Find the odd one: Dog, Cat, Crow, Cow', ['Dog', 'Cat', 'Crow', 'Cow'], 'Crow', 'Crow is a bird; all others are mammals.', 'Reasoning', 'Similarities and Differences'),
    q('Find the odd one: Rose, Lotus, Mango, Tulip', ['Rose', 'Lotus', 'Mango', 'Tulip'], 'Mango', 'Mango is a fruit; all others are flowers.', 'Reasoning', 'Similarities and Differences'),

    q('How many edges does a cube have?', ['8', '10', '12', '14'], '12', 'A cube has 12 edges, 8 vertices and 6 faces.', 'Reasoning', 'Spatial Visualization'),
    q('How many small cubes are in a 3x3x3 cube?', ['9', '18', '27', '36'], '27', '3x3x3 = 27 unit cubes.', 'Reasoning', 'Spatial Visualization'),

    q('A pattern shows: 1, 3, 6, 10, ?', ['13', '14', '15', '16'], '15', 'Triangular numbers: each adds one more. 10+5=15.', 'Reasoning', 'Visual Memory'),
    q('Series: 2, 4, 7, 11, 16, ?', ['20', '21', '22', '23'], '22', 'Differences: 2,3,4,5,6 — next difference is 6, so 16+6=22.', 'Reasoning', 'Visual Memory'),

    q('A is the father of B. C is the mother of A. What is C to B?', ['Mother', 'Grandmother', 'Aunt', 'Sister'], 'Grandmother', 'C is A\'s mother and A is B\'s father, so C is B\'s grandmother.', 'Reasoning', 'Blood Relations'),
    q('X\'s mother is Y. Z is Y\'s father. What is Z to X?', ['Uncle', 'Grandfather', 'Father', 'Brother'], 'Grandfather', 'Z is mother\'s father = maternal grandfather.', 'Reasoning', 'Blood Relations'),

    q('Ram walks 5 km North then 3 km East. Which direction from start?', ['North-East', 'North-West', 'South-East', 'South-West'], 'North-East', 'Moving North then East puts him in the North-East direction.', 'Reasoning', 'Direction Sense'),
    q('A man facing East turns 90 degrees clockwise. Which direction now?', ['North', 'South', 'West', 'East'], 'South', 'East + 90 degrees clockwise = South.', 'Reasoning', 'Direction Sense'),

    q('If CAT=24, DOG=26, then RAT=?', ['37', '38', '39', '40'], '39', 'Sum of positions: R(18)+A(1)+T(20)=39.', 'Reasoning', 'Coding-Decoding'),
    q('If APPLE is coded as BQQMF, then MANGO is coded as?', ['NBOHP', 'NBOIP', 'MBOHP', 'NBNHP'], 'NBOHP', 'Each letter is replaced by the next letter in the alphabet.', 'Reasoning', 'Coding-Decoding'),

    q('Next number: 2, 4, 8, 16, ?', ['24', '28', '32', '36'], '32', 'Each number is doubled: 16x2=32.', 'Reasoning', 'Series'),
    q('Next number: 1, 4, 9, 16, 25, ?', ['30', '35', '36', '42'], '36', 'Perfect squares: 6 squared = 36.', 'Reasoning', 'Series'),

    q('30 students in a class, 1/3 are girls. How many boys?', ['10', '15', '20', '25'], '20', '1/3 of 30 = 10 girls; 30-10 = 20 boys.', 'Reasoning', 'Arithmetical Reasoning'),
    q('A has Rs 500 and spends Rs 150. What fraction remains?', ['1/2', '7/10', '3/10', '2/5'], '7/10', 'Rs 350 remains out of Rs 500 = 7/10.', 'Reasoning', 'Arithmetical Reasoning'),

    q('Which figure has all sides equal AND all angles 90 degrees?', ['Rectangle', 'Rhombus', 'Square', 'Parallelogram'], 'Square', 'A square has all sides equal and all angles = 90 degrees.', 'Reasoning', 'Figural Classification'),
    q('Which shape has exactly 3 sides?', ['Pentagon', 'Hexagon', 'Triangle', 'Quadrilateral'], 'Triangle', 'A triangle has 3 sides.', 'Reasoning', 'Figural Classification'),

    q('Odd one out: January, March, April, July', ['January', 'March', 'April', 'July'], 'April', 'April has 30 days; all others have 31 days.', 'Reasoning', 'Odd One Out'),
    q('Odd one out: 2, 3, 5, 9, 11', ['2', '3', '9', '11'], '9', '9 is not prime (3x3=9); all others are prime.', 'Reasoning', 'Odd One Out'),

    q('All dogs are mammals. Some dogs are pets. Conclusion: Some pets are mammals.', ['True', 'False', 'Cannot determine', 'None of these'], 'True', 'Some pet-dogs are mammals since all dogs are mammals.', 'Reasoning', 'Syllogism'),
    q('All birds can fly. Penguin is a bird. Conclusion: Penguin can fly.', ['True', 'False', 'Uncertain', 'None of these'], 'True', 'Based purely on given premises the conclusion follows logically.', 'Reasoning', 'Syllogism'),

    q('A number divided by 5 gives remainder 3 and by 7 gives remainder 5. Find the number.', ['33', '38', '43', '48'], '33', '33/5=6 rem 3 and 33/7=4 rem 5.', 'Reasoning', 'Puzzles'),
    q('If 2+3=10, 7+2=63, 6+5=66, then 8+4=?', ['80', '88', '96', '104'], '96', 'Pattern: A x (A+B). 8 x (8+4) = 8 x 12 = 96.', 'Reasoning', 'Puzzles'),

    q('A, B, C, D sit in a row. A is left of B. C is right of B. D is right of C. Who is rightmost?', ['A', 'B', 'C', 'D'], 'D', 'Order: A-B-C-D. D is at the rightmost position.', 'Reasoning', 'Seating Arrangement'),
    q('6 people sit in a row. X is at one end, Y is next to X. Who is X\'s neighbour?', ['X', 'Y', 'Z', 'Cannot determine'], 'Y', 'Y is stated to be next to X.', 'Reasoning', 'Seating Arrangement'),

    q('Time in a mirror shows 4:30. What is the actual time?', ['7:00', '7:30', '8:00', '8:30'], '7:30', 'Mirror time = 12:00 minus 4:30 = 7:30.', 'Reasoning', 'Mirror and Water Images'),
    q('In a water image, which direction is flipped?', ['Left-Right', 'Top-Bottom', 'Both', 'None'], 'Top-Bottom', 'Water images flip the image vertically (Top-Bottom).', 'Reasoning', 'Mirror and Water Images'),

    q('A square paper is folded once and a hole is punched. How many holes after unfolding?', ['1', '2', '3', '4'], '2', 'One fold creates a mirror hole on the other half = 2 holes.', 'Reasoning', 'Paper Folding and Cutting'),
    q('A paper folded twice and cut at the corner. How many holes after unfolding?', ['1', '2', '4', '8'], '4', 'Two folds create 4 symmetrical cuts when unfolded.', 'Reasoning', 'Paper Folding and Cutting'),

    // ── GENERAL AWARENESS ──────────────────────────────────────────────────────
    q('Who was the first Governor General of India?', ['Lord Mountbatten', 'Warren Hastings', 'Lord Dalhousie', 'Lord Curzon'], 'Warren Hastings', 'Warren Hastings was the first Governor General of Bengal (1772).', 'GK', 'History'),
    q('The Battle of Plassey was fought in which year?', ['1757', '1764', '1775', '1800'], '1757', 'Battle of Plassey (1757) — British East India Company defeated Siraj ud-Daulah.', 'GK', 'History'),

    q('Which is the longest river in India?', ['Yamuna', 'Ganga', 'Godavari', 'Brahmaputra'], 'Ganga', 'The Ganga (2525 km) is the longest river originating in India.', 'GK', 'Geography'),
    q('Mount Everest is located in which country?', ['India', 'China', 'Nepal', 'Bhutan'], 'Nepal', 'Mount Everest summit lies in Nepal.', 'GK', 'Geography'),

    q('How many articles did the Indian Constitution originally contain?', ['395', '400', '448', '450'], '395', 'The original Constitution had 395 articles, 8 schedules and 22 parts.', 'GK', 'Indian Polity'),
    q('Who is the constitutional head of India?', ['Prime Minister', 'President', 'Chief Justice', 'Speaker'], 'President', 'The President of India is the constitutional head of state.', 'GK', 'Indian Polity'),

    q('What does GDP stand for?', ['Gross Domestic Product', 'General Domestic Product', 'Gross Development Product', 'Global Domestic Product'], 'Gross Domestic Product', 'GDP = total value of goods/services produced in a country.', 'GK', 'Economy'),
    q('Which is the central bank of India?', ['SBI', 'RBI', 'PNB', 'HDFC'], 'RBI', 'The Reserve Bank of India (RBI) is the central bank established in 1935.', 'GK', 'Economy'),

    q('What is the chemical formula of water?', ['H2O', 'CO2', 'O2', 'H2O2'], 'H2O', 'Water is composed of 2 hydrogen atoms and 1 oxygen atom.', 'GK', 'General Science'),
    q('Which planet is known as the Red Planet?', ['Venus', 'Mars', 'Jupiter', 'Saturn'], 'Mars', 'Mars appears red due to iron oxide on its surface.', 'GK', 'General Science'),

    q('Which gas is mainly responsible for the greenhouse effect?', ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], 'Carbon Dioxide', 'CO2 traps heat in the atmosphere causing the greenhouse effect.', 'GK', 'Environment'),
    q('What does WWF stand for?', ['World Wildlife Fund', 'World War Fund', 'World Welfare Federation', 'Wildlife World Fund'], 'World Wildlife Fund', 'WWF = World Wildlife Fund (now World Wide Fund for Nature).', 'GK', 'Environment'),

    q('Which classical dance is associated with Kerala?', ['Bharatanatyam', 'Kathak', 'Kathakali', 'Odissi'], 'Kathakali', 'Kathakali is the classical dance-drama of Kerala.', 'GK', 'Culture'),
    q('Which festival is known as the Festival of Lights?', ['Holi', 'Diwali', 'Eid', 'Pongal'], 'Diwali', 'Diwali (Deepawali) is celebrated with lamps.', 'GK', 'Culture'),

    q('How many players are there in a cricket team?', ['9', '10', '11', '12'], '11', 'A cricket team has 11 players on the field.', 'GK', 'Sports'),
    q('The term "Grand Slam" is associated with which sport?', ['Cricket', 'Tennis', 'Football', 'Hockey'], 'Tennis', 'Grand Slam in tennis = winning all four major tournaments in a year.', 'GK', 'Sports'),

    q('Where are the 2028 Summer Olympics to be held?', ['Paris', 'Los Angeles', 'Brisbane', 'Tokyo'], 'Los Angeles', 'The 2028 Summer Olympics will be held in Los Angeles, USA.', 'GK', 'Current Affairs'),
    q('Who is the Prime Minister of India (2025)?', ['Narendra Modi', 'Amit Shah', 'Rahul Gandhi', 'Arvind Kejriwal'], 'Narendra Modi', 'Narendra Modi has been Prime Minister since May 2014.', 'GK', 'Current Affairs'),

    q('What is the national flower of India?', ['Rose', 'Lotus', 'Sunflower', 'Marigold'], 'Lotus', 'The Lotus is the national flower of India.', 'GK', 'Static GK'),
    q('Which is the largest state of India by area?', ['Maharashtra', 'Rajasthan', 'Uttar Pradesh', 'Madhya Pradesh'], 'Rajasthan', 'Rajasthan (342239 km2) is the largest state of India by area.', 'GK', 'Static GK'),

    // ── MATHEMATICS ────────────────────────────────────────────────────────────
    q('What is the LCM of 12 and 18?', ['24', '36', '48', '72'], '36', 'LCM(12,18) = 36.', 'Math', 'Number System'),
    q('Which is the smallest prime number?', ['0', '1', '2', '3'], '2', '2 is the smallest and only even prime number.', 'Math', 'Number System'),

    q('What is 0.25 as a fraction?', ['1/2', '1/4', '1/5', '1/8'], '1/4', '0.25 = 25/100 = 1/4.', 'Math', 'Decimals and Fractions'),
    q('Which is greater: 3/4 or 5/7?', ['3/4', '5/7', 'Both equal', 'Cannot compare'], '3/4', '3/4=0.75 and 5/7=0.714, so 3/4 is greater.', 'Math', 'Decimals and Fractions'),

    q('What is 20% of 500?', ['50', '80', '100', '120'], '100', '20/100 x 500 = 100.', 'Math', 'Percentage'),
    q('A price increased from Rs 200 to Rs 250. Percentage increase?', ['20%', '25%', '30%', '15%'], '25%', 'Increase=50; % = (50/200)x100 = 25%.', 'Math', 'Percentage'),

    q('If A:B = 2:3 and B:C = 4:5, find A:C.', ['8:15', '4:9', '6:10', '2:5'], '8:15', 'A:B:C = 8:12:15, so A:C = 8:15.', 'Math', 'Ratio and Proportion'),
    q('Two numbers in ratio 3:5 have sum 48. Find the larger number.', ['18', '24', '30', '36'], '30', '8x=48, x=6; larger=5x6=30.', 'Math', 'Ratio and Proportion'),

    q('Average of 5 numbers is 20. What is their sum?', ['80', '100', '120', '60'], '100', 'Sum = Average x Count = 20x5 = 100.', 'Math', 'Average'),
    q('Average of first 10 natural numbers?', ['5', '5.5', '6', '4.5'], '5.5', 'Sum=55; Average=55/10=5.5.', 'Math', 'Average'),

    q('CP=Rs 500, SP=Rs 600. Profit percentage?', ['15%', '20%', '25%', '10%'], '20%', 'Profit=100; %=(100/500)x100=20%.', 'Math', 'Profit and Loss'),
    q('Shopkeeper sells at 10% loss. CP=Rs 400. Find SP.', ['Rs 340', 'Rs 350', 'Rs 360', 'Rs 380'], 'Rs 360', 'SP = 400 x 0.90 = Rs 360.', 'Math', 'Profit and Loss'),

    q('P=Rs 1000, R=5% p.a., T=2 years. Find SI.', ['Rs 50', 'Rs 100', 'Rs 150', 'Rs 200'], 'Rs 100', 'SI=(PxRxT)/100=(1000x5x2)/100=Rs 100.', 'Math', 'Simple Interest'),
    q('In how many years will Rs 1000 double at 10% SI?', ['5', '8', '10', '12'], '10', 'SI=Principal when doubled; 1000=(1000x10xT)/100; T=10 years.', 'Math', 'Simple Interest'),

    q('A can do a job in 10 days, B in 20 days. Together in how many days?', ['5', '6.67', '7', '8'], '6.67', 'Combined rate=1/10+1/20=3/20. Days=20/3=6.67.', 'Math', 'Time and Work'),
    q('5 workers complete a job in 8 days. How many days for 10 workers?', ['2', '4', '6', '8'], '4', '5x8=10xD; D=4 days.', 'Math', 'Time and Work'),

    q('Speed=60 km/h, Time=2 hours. Distance?', ['100 km', '110 km', '120 km', '130 km'], '120 km', 'Distance=Speedx Time=60x2=120 km.', 'Math', 'Time and Distance'),
    q('A 100m train passes a pole in 10 seconds. Speed in km/h?', ['30', '36', '40', '45'], '36', 'Speed=100/10=10 m/s=36 km/h.', 'Math', 'Time and Distance'),

    q('Area of rectangle: length=10 cm, breadth=5 cm.', ['25 cm2', '40 cm2', '50 cm2', '60 cm2'], '50 cm2', 'Area=LxB=10x5=50 cm2.', 'Math', 'Mensuration'),
    q('Perimeter of a square with side 6 cm?', ['12 cm', '24 cm', '30 cm', '36 cm'], '24 cm', 'Perimeter=4xside=4x6=24 cm.', 'Math', 'Mensuration'),

    q('If x+5=12, find x.', ['5', '6', '7', '8'], '7', 'x=12-5=7.', 'Math', 'Algebra'),
    q('Simplify: 2x+3x-x', ['3x', '4x', '5x', '6x'], '4x', '2x+3x-x=4x.', 'Math', 'Algebra'),

    q('Sum of interior angles of a triangle?', ['90', '180', '270', '360'], '180', 'Sum of angles in any triangle=180 degrees.', 'Math', 'Geometry'),
    q('Circumference of a circle with radius 7 cm (pi=22/7)?', ['22 cm', '33 cm', '44 cm', '66 cm'], '44 cm', 'C=2xpixr=2x(22/7)x7=44 cm.', 'Math', 'Geometry'),

    q('Bar chart: Math=80, Science=70, English=60. Average marks?', ['60', '65', '70', '75'], '70', 'Average=(80+70+60)/3=210/3=70.', 'Math', 'Data Interpretation'),
    q('Pie chart: Sports=25%, Studies=30%, TV=20%, Sleep=?', ['20%', '25%', '30%', '35%'], '25%', '100-25-30-20=25% for Sleep.', 'Math', 'Data Interpretation'),

    // ── ENGLISH ────────────────────────────────────────────────────────────────
    q('Passage: "The boy ran quickly to reach school on time." Why did the boy run?', ['For exercise', 'To reach school on time', 'To catch a bus', 'For fun'], 'To reach school on time', 'The passage directly states the reason.', 'English', 'Reading Comprehension'),
    q('The word "comprehension" means:', ['Writing', 'Understanding', 'Speaking', 'Listening'], 'Understanding', 'Comprehension = the ability to understand something.', 'English', 'Reading Comprehension'),

    q('Choose the grammatically correct sentence:', ['She go to school', 'She goes to school', 'She going to school', 'She gone to school'], 'She goes to school', 'Third person singular (She) takes verb+s in present tense.', 'English', 'Grammar'),
    q('What is the past tense of "write"?', ['Writed', 'Written', 'Wrote', 'Writes'], 'Wrote', '"Wrote" is the simple past tense of "write".', 'English', 'Grammar'),

    q('Meaning of "benevolent":', ['Cruel', 'Kind', 'Angry', 'Sad'], 'Kind', 'Benevolent means well-meaning and kindly.', 'English', 'Vocabulary'),
    q('"Diligent" means:', ['Lazy', 'Hardworking', 'Careless', 'Rude'], 'Hardworking', 'Diligent = showing care and effort in work.', 'English', 'Vocabulary'),

    q('Synonym of "Happy":', ['Sad', 'Joyful', 'Angry', 'Tired'], 'Joyful', 'Joyful is a synonym of happy.', 'English', 'Synonyms'),
    q('Synonym of "Brave":', ['Coward', 'Fearful', 'Courageous', 'Weak'], 'Courageous', 'Courageous and brave both mean willing to face danger.', 'English', 'Synonyms'),

    q('Antonym of "Hot":', ['Warm', 'Cold', 'Cool', 'Humid'], 'Cold', 'Cold is the direct opposite of hot.', 'English', 'Antonyms'),
    q('Antonym of "Victory":', ['Win', 'Success', 'Defeat', 'Champion'], 'Defeat', 'Defeat is the opposite of victory.', 'English', 'Antonyms'),

    q('Find the error: "She dont like coffee."', ['She', 'dont', 'like', 'No error'], 'dont', 'With She (3rd person singular), use "doesn\'t" not "don\'t".', 'English', 'Error Spotting'),
    q('Find the error: "He have two brothers."', ['He', 'have', 'two brothers', 'No error'], 'have', 'With He (3rd person singular), use "has" not "have".', 'English', 'Error Spotting'),

    q('Correct: "She is more taller than her sister."', ['She is tallest', 'She is more tall', 'She is taller', 'She is most taller'], 'She is taller', 'Do not use "more" with comparative adjectives ending in -er.', 'English', 'Sentence Correction'),
    q('Correct: "I am knowing him for years."', ['I knew him for years', 'I have known him for years', 'I known him for years', 'I know him for years'], 'I have known him for years', 'Use present perfect for actions continuing to the present.', 'English', 'Sentence Correction'),

    q('She ___ to the market yesterday.', ['go', 'goes', 'went', 'going'], 'went', '"Yesterday" indicates past tense; use "went".', 'English', 'Fill in the Blanks'),
    q('He is ___ honest man.', ['a', 'an', 'the', 'no article needed'], 'an', 'Use "an" before words starting with a vowel sound.', 'English', 'Fill in the Blanks'),

    q('A student must work hard to ___ success.', ['lose', 'achieve', 'avoid', 'miss'], 'achieve', 'One works hard to achieve success.', 'English', 'Cloze Test'),
    q('The weather was so ___ that we stayed indoors.', ['pleasant', 'terrible', 'bright', 'sunny'], 'terrible', 'Staying indoors implies bad/terrible weather.', 'English', 'Cloze Test'),

    q('"Break the ice" means:', ['Start a conversation', 'Break something', 'Cool down', 'Fight'], 'Start a conversation', '"Break the ice" = do something to start a conversation and ease tension.', 'English', 'Idioms and Phrases'),
    q('"Hit the books" means:', ['Beat someone', 'Study', 'Throw books', 'Damage books'], 'Study', '"Hit the books" is an idiom meaning to study.', 'English', 'Idioms and Phrases'),

    q('Correctly spelled word:', ['Accomodation', 'Accommodation', 'Acommodation', 'Accomodattion'], 'Accommodation', 'Accommodation has double-c and double-m.', 'English', 'Spelling'),
    q('Correctly spelled word:', ['Recieve', 'Receive', 'Receeve', 'Receve'], 'Receive', 'i before e except after c: Receive.', 'English', 'Spelling'),

    q('Passive voice of "She writes a letter."', ['A letter is written by her', 'A letter was written by her', 'A letter has been written', 'A letter is being written'], 'A letter is written by her', 'Simple present active to passive: Object+is+V3+by+Subject.', 'English', 'Voice and Narration'),
    q('Indirect speech: He said, "I am happy."', ['He said that he was happy', 'He said that I am happy', 'He told he is happy', 'He said he is happy'], 'He said that he was happy', 'Pronoun: I->he; tense shift: am->was.', 'English', 'Voice and Narration'),

    // ── HINDI ──────────────────────────────────────────────────────────────────
    q('"देव + आलय" की संधि से बना शब्द है:', ['देवालय', 'देवलय', 'देवाालय', 'देवआलय'], 'देवालय', 'अ + आ = आ (दीर्घ स्वर संधि): देव + आलय = देवालय।', 'Hindi', 'Sandhi evam Sandhi-Vichchhed'),
    q('"नमस्ते" में कौन सी संधि है?', ['स्वर संधि', 'व्यंजन संधि', 'विसर्ग संधि', 'कोई नहीं'], 'विसर्ग संधि', 'नमः + ते = नमस्ते — विसर्ग संधि।', 'Hindi', 'Sandhi evam Sandhi-Vichchhed'),

    q('"अनुचित" में उपसर्ग है:', ['अ', 'अन', 'अनु', 'उचित'], 'अनु', '"अनु" उपसर्ग + चित = अनुचित।', 'Hindi', 'Upsarg evam Pratyay'),
    q('"लिखावट" में प्रत्यय है:', ['लिख', 'लिखा', 'आवट', 'वट'], 'आवट', 'लिख + आवट = लिखावट। "आवट" प्रत्यय है।', 'Hindi', 'Upsarg evam Pratyay'),

    q('"सूर्य" का पर्यायवाची शब्द है:', ['चंद्र', 'भानु', 'तारा', 'नक्षत्र'], 'भानु', 'भानु, रवि, दिनकर — सूर्य के पर्यायवाची।', 'Hindi', 'Paryayvachi Shabd'),
    q('"पानी" का पर्यायवाची शब्द है:', ['अग्नि', 'जल', 'वायु', 'पृथ्वी'], 'जल', 'जल, नीर, वारि — पानी के पर्यायवाची।', 'Hindi', 'Paryayvachi Shabd'),

    q('"सुख" का विलोम शब्द है:', ['आनंद', 'खुशी', 'दुख', 'प्रसन्नता'], 'दुख', 'सुख का विपरीत दुख होता है।', 'Hindi', 'Vilom Shabd'),
    q('"दिन" का विलोम शब्द है:', ['सुबह', 'शाम', 'रात', 'संध्या'], 'रात', 'दिन का विपरीत रात होता है।', 'Hindi', 'Vilom Shabd'),

    q('"आँखें चुराना" मुहावरे का अर्थ है:', ['आँख निकालना', 'सामने न आना', 'देखना', 'रोना'], 'सामने न आना', 'आँखें चुराना = किसी से मिलने से बचना।', 'Hindi', 'Muhavare evam Lokoktiyan'),
    q('"अक्ल पर पत्थर पड़ना" का अर्थ है:', ['पत्थर मारना', 'बुद्धि भ्रष्ट होना', 'चोट लगना', 'सोचना'], 'बुद्धि भ्रष्ट होना', 'अक्ल पर पत्थर पड़ना = बुद्धि का नष्ट होना।', 'Hindi', 'Muhavare evam Lokoktiyan'),

    q('शुद्ध शब्द चुनें:', ['कवियत्री', 'कवयित्री', 'कविञित्री', 'कवित्री'], 'कवयित्री', 'महिला कवि के लिए "कवयित्री" शुद्ध है।', 'Hindi', 'Shabd-Shuddhi'),
    q('शुद्ध शब्द है:', ['प्रतीक्षा', 'प्रतिक्षा', 'प्रतीखा', 'प्रतिखा'], 'प्रतीक्षा', '"प्रतीक्षा" का शुद्ध रूप।', 'Hindi', 'Shabd-Shuddhi'),

    q('शुद्ध वाक्य चुनें:', ['मुझे प्यास लग रही है', 'मुझको प्यास लग रहा है', 'मुझे प्यास लग रहा है', 'मैं प्यासा लग रही हूँ'], 'मुझे प्यास लग रही है', '"प्यास" स्त्रीलिंग है अतः "लग रही है" सही है।', 'Hindi', 'Vakya-Shuddhi'),
    q('निम्न में शुद्ध वाक्य है:', ['वह रोज़ व्यायाम करता है', 'वह रोज़ व्यायाम करते है', 'वह रोज़ व्यायाम करता हूँ', 'वह रोज़ व्यायाम करती हूँ'], 'वह रोज़ व्यायाम करता है', 'तृतीय पुरुष एकवचन पुल्लिंग के लिए "करता है" शुद्ध है।', 'Hindi', 'Vakya-Shuddhi'),

    q('"कनक" के अनेकार्थ हैं:', ['सोना और धतूरा', 'चाँदी और ताँबा', 'लोहा और पानी', 'फूल और फल'], 'सोना और धतूरा', 'कनक = सोना (gold) और धतूरा (plant)।', 'Hindi', 'Anekarthak Shabd'),
    q('"अज" का एक अर्थ "बकरा" है, दूसरा अर्थ है:', ['घोड़ा', 'ब्रह्मा', 'गाय', 'हाथी'], 'ब्रह्मा', 'अज = बकरा और अज = ब्रह्मा।', 'Hindi', 'Anekarthak Shabd'),

    q('"जो सब कुछ जानता हो" के लिए एक शब्द:', ['सर्वज्ञ', 'सर्वशक्तिमान', 'सर्वव्यापी', 'सर्वहारा'], 'सर्वज्ञ', 'सर्वज्ञ = सब कुछ जानने वाला।', 'Hindi', 'Vakyansh ke liye ek Shabd'),
    q('"जो कभी न मरे" के लिए एक शब्द:', ['अमर', 'अजर', 'अनश्वर', 'अव्यय'], 'अमर', 'अमर = जो कभी न मरे।', 'Hindi', 'Vakyansh ke liye ek Shabd'),

    q('"राजपुत्र" में समास है:', ['तत्पुरुष', 'द्वंद्व', 'बहुव्रीहि', 'द्विगु'], 'तत्पुरुष', 'राजपुत्र = राजा का पुत्र — षष्ठी तत्पुरुष।', 'Hindi', 'Samas evam Samas-Vigrah'),
    q('"माता-पिता" में समास है:', ['तत्पुरुष', 'द्वंद्व', 'बहुव्रीहि', 'द्विगु'], 'द्वंद्व', 'माता-पिता = माता और पिता — द्वंद्व समास।', 'Hindi', 'Samas evam Samas-Vigrah'),

    q('"वह खाना खा रहा है" में काल है:', ['भूतकाल', 'वर्तमान काल', 'भविष्यकाल', 'सामान्य काल'], 'वर्तमान काल', '"खा रहा है" अपूर्ण वर्तमान काल है।', 'Hindi', 'Kriya evam Kaal'),
    q('"मैंने पढ़ा" में क्रिया का काल है:', ['वर्तमान', 'भूत', 'भविष्य', 'अनिश्चित'], 'भूत', '"पढ़ा" सामान्य भूतकाल का रूप है।', 'Hindi', 'Kriya evam Kaal'),

    q('द्वंद्व समास का उदाहरण है:', ['राजपुत्र', 'देशभक्त', 'माता-पिता', 'पीतांबर'], 'माता-पिता', 'द्वंद्व समास में दोनों पद प्रधान होते हैं।', 'Hindi', 'Dvandva'),
    q('"राम-कृष्ण" में समास है:', ['तत्पुरुष', 'द्वंद्व', 'बहुव्रीहि', 'द्विगु'], 'द्वंद्व', 'राम-कृष्ण = राम और कृष्ण — द्वंद्व समास।', 'Hindi', 'Dvandva'),
];

async function seed() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    await Question.deleteMany({});
    console.log('Cleared existing questions');
    await Question.insertMany(questions);
    console.log(`Seeded ${questions.length} questions across 63 chapters`);
    await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
