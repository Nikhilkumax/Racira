const fs = require('fs');
const file = 'src/data/calculatorRegistry.ts';
let content = fs.readFileSync(file, 'utf8');
const existingSlugs = new Set([...content.matchAll(/\bslug:\s*"([^"]+)"/g)].map(m => m[1]));

const newEntries = [
  // Technology
  { slug: 'bandwidth-calculator', name: 'Bandwidth Calculator', desc: 'Calculate download and upload times based on file size and internet connection speed.', cat: 'Technology', sub: 'Networking', icon: 'Wifi' },
  { slug: 'subnet-calculator', name: 'IP Subnet Calculator', desc: 'Calculate network, broadcast, and host ranges for IPv4 and IPv6 subnets.', cat: 'Technology', sub: 'Networking', icon: 'Globe' },
  { slug: 'raid-calculator', name: 'RAID Capacity Calculator', desc: 'Determine usable storage capacity and fault tolerance for various RAID configurations (0, 1, 5, 6, 10).', cat: 'Technology', sub: 'Storage', icon: 'HardDrive' },
  { slug: 'pixel-density-calculator', name: 'Pixel Density (PPI) Calculator', desc: 'Calculate Pixels Per Inch (PPI) based on screen resolution and diagonal display size.', cat: 'Technology', sub: 'Display', icon: 'Monitor' },
  { slug: 'aspect-ratio-calculator', name: 'Aspect Ratio Calculator', desc: 'Calculate screen aspect ratios and dimensions for video, images, and monitors.', cat: 'Technology', sub: 'Display', icon: 'Monitor' },
  { slug: 'power-supply-calculator', name: 'PC Power Supply Calculator', desc: 'Estimate required power supply wattage for a custom PC build based on components.', cat: 'Technology', sub: 'Hardware', icon: 'Zap' },
  { slug: 'data-transfer-rate-calculator', name: 'Data Transfer Rate Calculator', desc: 'Convert between different data transfer units (Mbps, MB/s, Gbps, etc.).', cat: 'Technology', sub: 'Networking', icon: 'Wifi' },
  { slug: 'mac-address-generator', name: 'MAC Address Generator', desc: 'Generate random or vendor-specific MAC addresses for network testing.', cat: 'Technology', sub: 'Networking', icon: 'Hash' },
  { slug: 'hash-calculator', name: 'Hash Calculator', desc: 'Generate cryptographic hashes (MD5, SHA-1, SHA-256) for a given text or file.', cat: 'Technology', sub: 'Security', icon: 'Lock' },
  { slug: 'password-entropy-calculator', name: 'Password Entropy Calculator', desc: 'Calculate the strength and entropy of a password to estimate cracking time.', cat: 'Technology', sub: 'Security', icon: 'Shield' },
  { slug: 'uptime-calculator', name: 'Server Uptime Calculator', desc: 'Calculate allowed downtime based on uptime SLA percentages (e.g., 99.9%).', cat: 'Technology', sub: 'Infrastructure', icon: 'Server' },
  { slug: 'vps-pricing-calculator', name: 'VPS Pricing Calculator', desc: 'Estimate monthly cloud hosting costs based on CPU, RAM, and Storage requirements.', cat: 'Technology', sub: 'Infrastructure', icon: 'Cloud' },
  { slug: 'data-storage-converter', name: 'Data Storage Converter', desc: 'Convert between Bytes, Kilobytes, Megabytes, Gigabytes, Terabytes, etc.', cat: 'Technology', sub: 'Storage', icon: 'HardDrive' },
  { slug: 'aws-s3-cost-calculator', name: 'AWS S3 Cost Calculator', desc: 'Estimate monthly AWS S3 storage, request, and data transfer costs.', cat: 'Technology', sub: 'Infrastructure', icon: 'Cloud' },
  { slug: 'docker-image-size-calculator', name: 'Docker Image Size Calculator', desc: 'Estimate the final size of a Docker image based on base image and installed packages.', cat: 'Technology', sub: 'Software', icon: 'Layers' },
  { slug: 'git-repo-size-calculator', name: 'Git Repository Size Calculator', desc: 'Estimate the size of a git repository clone based on commit history and file sizes.', cat: 'Technology', sub: 'Software', icon: 'FileText' },
  { slug: 'cron-expression-calculator', name: 'Cron Expression Calculator', desc: 'Generate and decode cron expressions for scheduling tasks.', cat: 'Technology', sub: 'Software', icon: 'Clock' },
  { slug: 'regex-test-calculator', name: 'Regex Match Calculator', desc: 'Calculate the number of matches and capture groups for a given regular expression.', cat: 'Technology', sub: 'Software', icon: 'Code' },
  { slug: 'rgb-to-hex-converter', name: 'RGB to HEX Converter', desc: 'Convert RGB color values to hexadecimal codes for web design.', cat: 'Technology', sub: 'Design', icon: 'Palette' },
  { slug: 'contrast-ratio-calculator', name: 'Color Contrast Calculator', desc: 'Check WCAG contrast ratios between text and background colors for accessibility.', cat: 'Technology', sub: 'Design', icon: 'Eye' },
  { slug: 'font-size-converter', name: 'Font Size Converter', desc: 'Convert font sizes between Points, Pixels, EMs, and REMs.', cat: 'Technology', sub: 'Design', icon: 'Type' },
  { slug: 'image-file-size-calculator', name: 'Image File Size Calculator', desc: 'Estimate uncompressed image file size based on resolution and color depth.', cat: 'Technology', sub: 'Storage', icon: 'Image' },
  { slug: 'video-file-size-calculator', name: 'Video File Size Calculator', desc: 'Estimate video file size based on bitrate, resolution, and duration.', cat: 'Technology', sub: 'Storage', icon: 'Video' },
  { slug: 'audio-file-size-calculator', name: 'Audio File Size Calculator', desc: 'Calculate audio file sizes based on sample rate, bit depth, and channels.', cat: 'Technology', sub: 'Storage', icon: 'Music' },
  { slug: '3d-print-time-calculator', name: '3D Print Time Calculator', desc: 'Estimate 3D printing time based on layer height, print speed, and model volume.', cat: 'Technology', sub: 'Hardware', icon: 'Box' },
  { slug: 'stepper-motor-calculator', name: 'Stepper Motor Calculator', desc: 'Calculate steps per millimeter for 3D printers and CNC machines.', cat: 'Technology', sub: 'Hardware', icon: 'Settings' },

  // Education
  { slug: 'gpa-calculator', name: 'GPA Calculator', desc: 'Calculate your Grade Point Average (GPA) for high school or college.', cat: 'Education', sub: 'Grades', icon: 'GraduationCap' },
  { slug: 'cumulative-gpa-calculator', name: 'Cumulative GPA Calculator', desc: 'Calculate your overall cumulative GPA including past semesters.', cat: 'Education', sub: 'Grades', icon: 'GraduationCap' },
  { slug: 'final-grade-calculator', name: 'Final Grade Calculator', desc: 'Determine what grade you need on a final exam to achieve a target overall class grade.', cat: 'Education', sub: 'Grades', icon: 'Target' },
  { slug: 'weighted-grade-calculator', name: 'Weighted Grade Calculator', desc: 'Calculate a class grade based on weighted assignment categories (e.g., Exams 50%, Homework 30%).', cat: 'Education', sub: 'Grades', icon: 'Percent' },
  { slug: 'test-grade-calculator', name: 'Test Grade Calculator', desc: 'Quickly generate a grading scale for a test based on the total number of questions.', cat: 'Education', sub: 'Grades', icon: 'FileText' },
  { slug: 'student-loan-calculator', name: 'Student Loan Payoff Calculator', desc: 'Calculate monthly payments and total interest for student loans.', cat: 'Education', sub: 'Finance', icon: 'Landmark' },
  { slug: 'college-savings-calculator', name: 'College Savings Calculator', desc: 'Estimate how much you need to save per month to afford college tuition.', cat: 'Education', sub: 'Finance', icon: 'PiggyBank' },
  { slug: 'reading-speed-calculator', name: 'Reading Speed Calculator', desc: 'Calculate your reading speed in words per minute (WPM).', cat: 'Education', sub: 'Study Skills', icon: 'BookOpen' },
  { slug: 'study-time-calculator', name: 'Study Time Calculator', desc: 'Estimate how many hours you should study per week based on credit hours and course difficulty.', cat: 'Education', sub: 'Study Skills', icon: 'Timer' },
  { slug: 'pomodoro-calculator', name: 'Pomodoro Cycle Calculator', desc: 'Calculate the total study time and break time for a given number of Pomodoro sessions.', cat: 'Education', sub: 'Study Skills', icon: 'Clock' },
  { slug: 'student-budget-calculator', name: 'Student Budget Calculator', desc: 'Manage your monthly student budget including tuition, rent, food, and books.', cat: 'Education', sub: 'Finance', icon: 'Wallet' },
  { slug: 'tuition-roi-calculator', name: 'Tuition ROI Calculator', desc: 'Estimate the return on investment of a college degree based on tuition costs and expected salary.', cat: 'Education', sub: 'Finance', icon: 'TrendingUp' },
  { slug: 'attendance-calculator', name: 'Attendance Calculator', desc: 'Calculate your current attendance percentage and how many classes you can afford to miss.', cat: 'Education', sub: 'Grades', icon: 'Calendar' },
  { slug: 'sat-score-calculator', name: 'SAT Score Calculator', desc: 'Estimate your SAT score based on raw section scores.', cat: 'Education', sub: 'Standardized Tests', icon: 'Award' },
  { slug: 'act-score-calculator', name: 'ACT Score Calculator', desc: 'Estimate your ACT composite score from raw section scores.', cat: 'Education', sub: 'Standardized Tests', icon: 'Award' },
  { slug: 'gre-score-calculator', name: 'GRE Score Percentile Calculator', desc: 'Convert your GRE scores into percentile rankings.', cat: 'Education', sub: 'Standardized Tests', icon: 'Award' },
  { slug: 'gmat-score-calculator', name: 'GMAT Score Percentile Calculator', desc: 'Convert your GMAT scores into percentile rankings.', cat: 'Education', sub: 'Standardized Tests', icon: 'Award' },
  { slug: 'lsat-score-calculator', name: 'LSAT Score Predictor', desc: 'Estimate your LSAT score based on practice test raw scores.', cat: 'Education', sub: 'Standardized Tests', icon: 'Award' },
  { slug: 'mcat-score-calculator', name: 'MCAT Score Converter', desc: 'Convert raw MCAT section scores to scaled scores and percentiles.', cat: 'Education', sub: 'Standardized Tests', icon: 'Award' },
  { slug: 'ap-score-calculator', name: 'AP Score Calculator', desc: 'Estimate your AP Exam score (1-5) based on multiple-choice and free-response performance.', cat: 'Education', sub: 'Standardized Tests', icon: 'Award' },
  { slug: 'ib-grade-calculator', name: 'IB Diploma Grade Calculator', desc: 'Calculate your projected total IB Diploma points based on subject grades and core components.', cat: 'Education', sub: 'Grades', icon: 'Globe' },
  { slug: 'uc-gpa-calculator', name: 'UC GPA Calculator', desc: 'Calculate your University of California (UC) specific GPA.', cat: 'Education', sub: 'Grades', icon: 'GraduationCap' },
  { slug: 'csu-gpa-calculator', name: 'CSU GPA Calculator', desc: 'Calculate your California State University (CSU) specific GPA.', cat: 'Education', sub: 'Grades', icon: 'GraduationCap' },
  { slug: 'oxbridge-interview-calculator', name: 'Oxbridge Interview Probability', desc: 'Estimate the probability of receiving an Oxbridge interview based on academic profile.', cat: 'Education', sub: 'Admissions', icon: 'School' },
  { slug: 'typing-speed-calculator', name: 'Typing Speed (WPM) Calculator', desc: 'Calculate your typing speed in Words Per Minute, adjusting for errors.', cat: 'Education', sub: 'Study Skills', icon: 'Keyboard' }
];

const toAdd = newEntries.filter(e => !existingSlugs.has(e.slug));
const skipped = newEntries.filter(e => existingSlugs.has(e.slug));
if (skipped.length > 0) console.log('Skipped:', skipped.map(e => e.slug));

let str = '\n\n  // ══════════════════════════════════════════════\n  // 💻 TECHNOLOGY & 🎓 EDUCATION\n  // ══════════════════════════════════════════════\n';
toAdd.forEach(e => {
  str += `  { slug: "${e.slug}", name: "${e.name}", description: "${e.desc}", category: "${e.cat}", subcategory: "${e.sub}", icon: ${e.icon}, isBuilt: false },\n`;
});

const insertAt = content.lastIndexOf('];');
content = content.slice(0, insertAt) + str + '\n' + content.slice(insertAt);
fs.writeFileSync(file, content, 'utf8');
const finalCount = [...fs.readFileSync(file, 'utf8').matchAll(/\bslug:\s*"([^"]+)"/g)].length;
console.log(`✅ Added ${toAdd.length} Tech/Edu calculators.`);
console.log(`📊 Total registry count: ${finalCount}`);
