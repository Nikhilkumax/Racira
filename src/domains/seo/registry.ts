import { BookKey, BluetoothSearching, FileKey, FileKey2, FolderKey, Key, KeyRound, KeySquare, Keyboard, KeyboardMusic, KeyboardOff, LockKeyhole, LockKeyholeOpen, LucideBookKey, LucideFileKey, LucideFileKey2, AArrowDown, LucideFolderKey, LucideKey, LucideKeyRound, BookType, AlertOctagon, ClipboardType, FileType, Instagram, LucideAlertOctagon, FileType2, LucideKeySquare, LucideInstagram, LucideOctagon, CalendarSearch, Bot, AlarmCheck, AlarmClockCheck, BadgeCheck, File, BookCheck, FileArchive, LucideMessageSquareShare, BookOpenCheck, FileAudio, FileAudio2, BotMessageSquare, LucideBookType, BookmarkCheck, CalendarCheck, CalendarCheck2, Check, AArrowUp, CheckCheck, FileSearch, FileAxis3D, FileAxis3d, FileBadge, FileBadge2, FileBarChart, FileBarChart2, ALargeSmall, FileSearch2, CheckCircle, FileBox, FileChartColumn, FileChartColumnIncreasing, LucideOctagonAlert, FolderSearch, LucideMonitorSmartphone, FolderSearch2, LucideBluetoothSearching, Accessibility, LucideCalendarSearch, LucideFileSearch, Activity, ActivitySquare, AirVent, Airplay, AlarmClock, AlarmClockMinus, AlarmClockOff, ExternalLink, AlarmClockPlus, LucideFileSearch2, LucideClipboardType, BotOff, LucideBot, LucideBotMessageSquare, LucideMap, LucideMapPin, LucideMapPinCheck, FileSymlink, LucideMapPinCheckInside, LucideBotOff, FolderSymlink, LucidePanelBottom, CheckCircle2, LucidePanelBottomClose, LucideSparkle, LucidePanelBottomDashed, AlarmMinus, AlarmPlus, Link, CircleGauge, CheckSquare, AlarmSmoke, CheckSquare2, Gauge, Album, Link2, Link2Off, LucideKeyboard, Linkedin, LucideExternalLink, LucideFileSymlink, LucideFolderSymlink, LucideLink, LucideLink2, LucideLink2Off, FileChartLine, LucideLinkedin, LucideUnlink, LucideUnlink2, Unlink, AlertCircle, Unlink2, AlertTriangle, AlignCenter, AlignCenterHorizontal, LucideFolderSearch, AlignCenterVertical, Barcode, CircleCheck, AlignEndHorizontal, Code, LucideSparkles, Code2, FileChartPie, AlignEndVertical, AlignHorizontalDistributeCenter, AlignHorizontalDistributeEnd, LucideWandSparkles, LucideMapPinHouse, LucideKeyboardMusic, LucideMapPinMinus, LucideMapPinMinusInside, LucideMapPinOff, Sparkle, CodeSquare, FileCheck, FileCheck2, CodeXml, Codepen, Codesandbox, FileCode, FileCode2, FolderCode, LucideBarcode, LucideCode, LucideCode2, LucideCodeSquare, LucideCodeXml, LucideCodepen, LucideCodesandbox, LucideFileCode, LucideFileCode2, LucideFolderCode, LucideMessageCircleCode, LucideMessageSquareCode, LucideScreenShare, LucideScreenShareOff, LucideShare, BookImage, LucideFileType, LucideShare2, MessageSquareShare, ScreenShare, ScreenShareOff, FileImage, FileClock, Sparkles, AlignHorizontalDistributeStart, LucideOctagonMinus, LucideKeyboardOff, AlignHorizontalJustifyCenter, AlignHorizontalJustifyEnd, FileCog, FileCog2, AlignHorizontalJustifyStart, AlignHorizontalSpaceAround, AlignHorizontalSpaceBetween, AreaChart, LucideLockKeyhole, AlignJustify, AlignLeft, WandSparkles, AlignRight, LucideWand, AlignStartHorizontal, LucideFolderSearch2, LucideMailSearch, LucideFileType2, LucideOctagonPause, LucideSplit, FileDiff, FileDigit, FileDown, AlignStartVertical, LucideOctagonX, FileEdit, LucidePackageSearch, Image, LucideScanSearch, AlignVerticalDistributeCenter, AlignVerticalDistributeEnd, FileHeart, FileInput, FileJson, ImageDown, LucideType, ImageMinus, ImageOff, CircleCheckBig, ClipboardCheck, ImagePlay, ImagePlus, ImageUp, ImageUpscale, AlignVerticalDistributeStart, LucideSmartphone, LucideTypeOutline, LucidePauseOctagon, LucidePanelBottomInactive, LucideSmartphoneCharging, GaugeCircle, LucideCircleGauge, LucideMapPinPlus, LucideSmartphoneNfc, LucideGauge, LucideTabletSmartphone, AlignVerticalJustifyCenter, FileJson2, AlignVerticalJustifyEnd, AlignVerticalJustifyStart, AlignVerticalSpaceAround, LucideMapPinPlusInside, LucideWand2, FileLineChart, AlignVerticalSpaceBetween } from "lucide-react";
export type Tool = {
  slug: string;
  name: string;
  description: string;
  category: string;
  icon: any;
  status: "live" | "soon";
};

export type Category = {
  name: string;
  slug: string;
  tools: string[];
};

const raw: { category: string; tools: [string, string, any, boolean][] }[] = [
  {
    category: "Keyword Tools",
    tools: [

      ["Keyword Density Checker", "Check keyword density quickly", BookKey, true],
      ["TF-IDF Analyzer", "Analyze tf-idf for SEO", BluetoothSearching, false],
      ["LSI Keyword Extractor", "Extract lsi keyword", FileKey, false],
      ["Keyword Frequency Counter", "Count keyword frequency", FileKey2, false],
      ["Keyword Prominence Checker", "Check keyword prominence quickly", FolderKey, false],
      ["Keyword in Title Checker", "Check keyword in title quickly", Key, false],
      ["Keyword in Meta Checker", "Check keyword in meta quickly", KeyRound, false],
      ["Keyword in URL Checker", "Check keyword in url quickly", KeySquare, false],
      ["Keyword in H1 Checker", "Check keyword in h1 quickly", Keyboard, false],
      ["Keyword in First Paragraph Checker", "Check keyword in first paragraph quickly", KeyboardMusic, false],
      ["Keyword List Generator", "Generate keyword list instantly", KeyboardOff, false],
      ["Keyword Combination Generator", "Generate keyword combination instantly", LockKeyhole, false],
      ["Long-Tail Keyword Builder", "Advanced keyword tools utility", LockKeyholeOpen, false],
      ["Keyword Permutation Generator", "Generate keyword permutation instantly", LucideBookKey, false],
      ["Question Keyword Generator", "Generate question keyword instantly", LucideFileKey, false],
      ["Semantic Keyword Clusterer", "Advanced keyword tools utility", LucideFileKey2, false],
      ["Search Intent Classifier", "Advanced keyword tools utility", AArrowDown, false],
      ["Stop Word Remover for Keywords", "Advanced keyword tools utility", LucideFolderKey, false],
      ["Keyword Stuffing Detector", "Advanced keyword tools utility", LucideKey, false],
      ["Keyword Gap Analyzer", "Analyze keyword gap for SEO", LucideKeyRound, false],
      ["Title Tag A/B Tester", "Advanced keyword tools utility", BookType, false],
      ["Meta Description A/B Tester", "Advanced keyword tools utility", AlertOctagon, false],
    
    ],
  },
  {
    category: "On-Page SEO Analysis",
    tools: [

      ["Title Tag Analyzer", "Analyze title tag for SEO", ClipboardType, false],
      ["Title Tag Length Checker", "Check title tag length quickly", FileType, false],
      ["Meta Description Analyzer", "Analyze meta description for SEO", Instagram, false],
      ["Meta Description Length Checker", "Check meta description length quickly", LucideAlertOctagon, false],
      ["Title Tag Duplicate Checker", "Check title tag duplicate quickly", FileType2, false],
      ["Meta Keywords Analyzer", "Analyze meta keywords for SEO", LucideKeySquare, false],
      ["Meta Robots Tag Analyzer", "Analyze meta robots tag for SEO", LucideInstagram, false],
      ["Meta Viewport Tag Checker", "Check meta viewport tag quickly", LucideOctagon, false],
      ["Heading Structure Analyzer", "Analyze heading structure for SEO", CalendarSearch, false],
      ["H1 Tag Analyzer", "Analyze h1 tag for SEO", Bot, false],
      ["Multiple H1 Checker", "Check multiple h1 quickly", AlarmCheck, false],
      ["Heading Hierarchy Validator", "Validate heading hierarchy", AlarmClockCheck, false],
      ["Subheading Distribution Checker", "Check subheading distribution quickly", BadgeCheck, false],
      ["Content Outline Extractor", "Extract content outline", File, false],
      ["Word Count Checker", "Check word count quickly", BookCheck, false],
      ["Content Depth Analyzer", "Analyze content depth for SEO", FileArchive, false],
      ["Paragraph Length Checker", "Check paragraph length quickly", LucideMessageSquareShare, false],
      ["Sentence Length Checker", "Check sentence length quickly", BookOpenCheck, false],
      ["Thin Content Detector", "Advanced on-page seo analysis utility", FileAudio, false],
      ["Content Freshness Checker", "Check content freshness quickly", FileAudio2, false],
      ["Heading Tag Counter", "Count heading tag", BotMessageSquare, false],
      ["Duplicate Title Finder", "Advanced on-page seo analysis utility", LucideBookType, false],
    
    ],
  },
  {
    category: "Content Optimization",
    tools: [

      ["Flesch Reading Ease SEO Checker", "Check flesch reading ease seo quickly", BookmarkCheck, false],
      ["Flesch-Kincaid Grade Level Checker", "Check flesch-kincaid grade level quickly", CalendarCheck, false],
      ["Gunning Fog SEO Checker", "Check gunning fog seo quickly", CalendarCheck2, false],
      ["SMOG Index Checker", "Check smog index quickly", Check, false],
      ["Passive Voice Detector", "Advanced content optimization utility", AArrowUp, false],
      ["Transition Words Checker", "Check transition words quickly", CheckCheck, false],
      ["Sentence Variety Analyzer", "Analyze sentence variety for SEO", FileSearch, false],
      ["SEO Content Score Calculator", "Advanced content optimization utility", FileAxis3D, false],
      ["Content Coverage Checker", "Check content coverage quickly", FileAxis3d, false],
      ["Content Gap Analyzer", "Analyze content gap for SEO", FileBadge, false],
      ["Duplicate Content Detector", "Advanced content optimization utility", FileBadge2, false],
      ["Near-Duplicate Content Checker", "Check near-duplicate content quickly", FileBarChart, false],
      ["Content Similarity Score", "Advanced content optimization utility", FileBarChart2, false],
      ["Power Words Counter", "Count power words", ALargeSmall, false],
      ["Emotional Words Analyzer", "Analyze emotional words for SEO", FileSearch2, false],
      ["CTA Effectiveness Checker", "Check cta effectiveness quickly", CheckCircle, false],
      ["Content Brief Generator", "Generate content brief instantly", FileBox, false],
      ["Blog Post Length Optimizer", "Advanced content optimization utility", FileChartColumn, false],
      ["Article Structure Checker", "Check article structure quickly", FileChartColumnIncreasing, false],
      ["Duplicate Meta Finder", "Advanced content optimization utility", LucideOctagonAlert, false],
    
    ],
  },
  {
    category: "SERP & Snippet Tools",
    tools: [

      ["Google SERP Snippet Previewer (desktop)", "Advanced serp & snippet tools utility", FolderSearch, false],
      ["Google SERP Snippet Previewer (mobile)", "Advanced serp & snippet tools utility", LucideMonitorSmartphone, false],
      ["Bing SERP Snippet Previewer", "Advanced serp & snippet tools utility", FolderSearch2, false],
      ["Featured Snippet Preview", "Advanced serp & snippet tools utility", LucideBluetoothSearching, false],
      ["People Also Ask Preview", "Advanced serp & snippet tools utility", Accessibility, false],
      ["Video Rich Snippet Preview", "Advanced serp & snippet tools utility", LucideCalendarSearch, false],
      ["Rich Snippet Previewer", "Advanced serp & snippet tools utility", LucideFileSearch, false],
      ["FAQ Rich Result Preview", "Advanced serp & snippet tools utility", Activity, false],
      ["How-To Rich Result Preview", "Advanced serp & snippet tools utility", ActivitySquare, false],
      ["Recipe Rich Result Preview", "Advanced serp & snippet tools utility", AirVent, false],
      ["Review Rich Result Preview", "Advanced serp & snippet tools utility", Airplay, false],
      ["Product Rich Result Preview", "Advanced serp & snippet tools utility", AlarmClock, false],
      ["Event Rich Result Preview", "Advanced serp & snippet tools utility", AlarmClockMinus, false],
      ["Breadcrumb Rich Result Preview", "Advanced serp & snippet tools utility", AlarmClockOff, false],
      ["Sitelinks Preview", "Advanced serp & snippet tools utility", ExternalLink, false],
      ["Knowledge Panel Preview", "Advanced serp & snippet tools utility", AlarmClockPlus, false],
      ["SERP CTR Estimator", "Advanced serp & snippet tools utility", LucideFileSearch2, false],
      ["Title Attractiveness Scorer", "Advanced serp & snippet tools utility", LucideClipboardType, false],
    
    ],
  },
  {
    category: "Technical SEO",
    tools: [

      ["Robots.txt Validator", "Validate robots.txt", BotOff, false],
      ["Robots.txt Parser", "Advanced technical seo utility", LucideBot, false],
      ["Robots.txt Rule Tester", "Advanced technical seo utility", LucideBotMessageSquare, false],
      ["Sitemap XML Validator", "Validate sitemap xml", LucideMap, false],
      ["Sitemap XML Parser", "Advanced technical seo utility", LucideMapPin, false],
      ["Sitemap Index Generator", "Generate sitemap index instantly", LucideMapPinCheck, false],
      ["Sitemap URL Extractor", "Extract sitemap url", FileSymlink, false],
      ["XML Sitemap Analyzer", "Analyze xml sitemap for SEO", LucideMapPinCheckInside, false],
      ["Canonical Tag Checker", "Check canonical tag quickly", LucideBotOff, false],
      ["Canonical URL Validator", "Validate canonical url", FolderSymlink, false],
      ["Noindex Tag Detector", "Advanced technical seo utility", LucidePanelBottom, false],
      ["Pagination SEO Checker", "Check pagination seo quickly", CheckCircle2, false],
      ["Hreflang Tag Validator", "Validate hreflang tag", LucidePanelBottomClose, false],
      ["Hreflang Matrix Generator", "Generate hreflang matrix instantly", LucideSparkle, false],
      ["X-Robots-Tag Analyzer", "Analyze x-robots-tag for SEO", LucidePanelBottomDashed, false],
      ["HTTP Status Code Reference", "Advanced technical seo utility", AlarmMinus, false],
      ["Redirect Chain Visualizer", "Advanced technical seo utility", AlarmPlus, false],
      ["URL Parameter Impact Analyzer", "Analyze url parameter impact for SEO", Link, false],
      ["Core Web Vitals Reference Guide", "Advanced technical seo utility", CircleGauge, false],
      ["Lazy Load Checker", "Check lazy load quickly", CheckSquare, false],
      ["Redirect Loop Detector", "Advanced technical seo utility", AlarmSmoke, false],
      ["Canonical Conflict Checker", "Check canonical conflict quickly", CheckSquare2, false],
      ["Page Size Estimator", "Advanced technical seo utility", Gauge, false],
      ["DOM Element Counter", "Count dom element", Album, false],
    
    ],
  },
  {
    category: "Link & URL Tools",
    tools: [

      ["URL Structure Analyzer", "Analyze url structure for SEO", Link2, false],
      ["URL Length Checker", "Check url length quickly", Link2Off, false],
      ["URL Keyword Extractor", "Extract url keyword", LucideKeyboard, false],
      ["URL Slug Generator & Optimizer", "Advanced link & url tools utility", Linkedin, false],
      ["URL Depth Calculator", "Advanced link & url tools utility", LucideExternalLink, false],
      ["URL Parameter Stripper", "Advanced link & url tools utility", LucideFileSymlink, false],
      ["URL Cleaner", "Advanced link & url tools utility", LucideFolderSymlink, false],
      ["Absolute vs Relative URL Checker", "Check absolute vs relative url quickly", LucideLink, false],
      ["Internal Link Analyzer", "Analyze internal link for SEO", LucideLink2, false],
      ["External Link Analyzer", "Analyze external link for SEO", LucideLink2Off, false],
      ["Anchor Text Analyzer", "Analyze anchor text for SEO", FileChartLine, false],
      ["Nofollow Link Checker", "Check nofollow link quickly", LucideLinkedin, false],
      ["Link Equity Estimator", "Advanced link & url tools utility", LucideUnlink, false],
      ["Broken Link Detector", "Advanced link & url tools utility", LucideUnlink2, false],
      ["Link Ratio Calculator", "Advanced link & url tools utility", Unlink, false],
      ["UTM Parameter Builder", "Advanced link & url tools utility", AlertCircle, false],
      ["UTM Link Validator", "Validate utm link", Unlink2, false],
      ["UTM Campaign Tracker", "Advanced link & url tools utility", AlertTriangle, false],
      ["Campaign URL Builder", "Advanced link & url tools utility", AlignCenter, false],
      ["Tracking Parameter Reference", "Advanced link & url tools utility", AlignCenterHorizontal, false],
      ["External Link Count Analyzer", "Analyze external link count for SEO", LucideFolderSearch, false],
      ["Internal Linking Opportunity Finder", "Advanced link & url tools utility", AlignCenterVertical, false],
    
    ],
  },
  {
    category: "Local SEO",
    tools: [

      ["Local Business Schema Generator", "Generate local business schema instantly", Barcode, false],
      ["NAP Consistency Checker", "Check nap consistency quickly", CircleCheck, false],
      ["Address Formatter", "Advanced local seo utility", AlignEndHorizontal, false],
      ["Opening Hours Schema Generator", "Generate opening hours schema instantly", Code, false],
      ["Service Area Generator", "Generate service area instantly", LucideSparkles, false],
      ["Local Business JSON-LD Builder", "Advanced local seo utility", Code2, false],
      ["GBP Post Character Counter", "Count gbp post character", FileChartPie, false],
      ["GBP Description Optimizer", "Advanced local seo utility", AlignEndVertical, false],
      ["GBP Category Reference", "Advanced local seo utility", AlignHorizontalDistributeCenter, false],
      ["GBP Attribute Reference", "Advanced local seo utility", AlignHorizontalDistributeEnd, false],
      ["Review Response Template Generator", "Generate review response template instantly", LucideWandSparkles, false],
      ["Local Citation Checker", "Check local citation quickly", LucideMapPinHouse, false],
      ["Local Keyword Builder", "Advanced local seo utility", LucideKeyboardMusic, false],
      ["Geo Sitemap Generator", "Generate geo sitemap instantly", LucideMapPinMinus, false],
      ["Local Landing Page Optimizer", "Advanced local seo utility", LucideMapPinMinusInside, false],
      ["Geographic Targeting Checker", "Check geographic targeting quickly", LucideMapPinOff, false],
      ["KML File Generator", "Generate kml file instantly", Sparkle, false],
      ["Local Schema Markup Validator", "Validate local schema markup", CodeSquare, false],
    
    ],
  },
  {
    category: "Structured Data",
    tools: [

      ["Article Schema Generator", "Generate article schema instantly", FileCheck, false],
      ["Blog Post Schema Generator", "Generate blog post schema instantly", FileCheck2, false],
      ["FAQ Schema Generator", "Generate faq schema instantly", CodeXml, false],
      ["How-To Schema Generator", "Generate how-to schema instantly", Codepen, false],
      ["Recipe Schema Generator", "Generate recipe schema instantly", Codesandbox, false],
      ["Review Schema Generator", "Generate review schema instantly", FileCode, false],
      ["Aggregate Rating Schema Generator", "Generate aggregate rating schema instantly", FileCode2, false],
      ["Product Schema Generator", "Generate product schema instantly", FolderCode, false],
      ["Event Schema Generator", "Generate event schema instantly", LucideBarcode, false],
      ["Person Schema Generator", "Generate person schema instantly", LucideCode, false],
      ["Organization Schema Generator", "Generate organization schema instantly", LucideCode2, false],
      ["Website Schema Generator", "Generate website schema instantly", LucideCodeSquare, false],
      ["Breadcrumb Schema Generator", "Generate breadcrumb schema instantly", LucideCodeXml, false],
      ["Video Schema Generator", "Generate video schema instantly", LucideCodepen, false],
      ["JSON-LD Validator", "Validate json-ld", LucideCodesandbox, false],
      ["Schema Markup Minifier", "Advanced structured data utility", LucideFileCode, false],
      ["Schema Markup Formatter", "Advanced structured data utility", LucideFileCode2, false],
      ["Schema Type Reference", "Advanced structured data utility", LucideFolderCode, false],
      ["Schema Property Lookup", "Advanced structured data utility", LucideMessageCircleCode, false],
      ["Schema Markup Comparator", "Advanced structured data utility", LucideMessageSquareCode, false],
    
    ],
  },
  {
    category: "Social & Open Graph",
    tools: [

      ["Open Graph Tag Generator", "Generate open graph tag instantly", LucideScreenShare, false],
      ["Open Graph Tag Analyzer", "Analyze open graph tag for SEO", LucideScreenShareOff, false],
      ["Open Graph Preview", "Advanced social & open graph utility", LucideShare, false],
      ["OG Image Size Checker", "Check og image size quickly", BookImage, false],
      ["Open Graph Title Length Checker", "Check open graph title length quickly", LucideFileType, false],
      ["Open Graph Description Length Checker", "Check open graph description length quickly", LucideShare2, false],
      ["Twitter Card Generator", "Generate twitter card instantly", MessageSquareShare, false],
      ["Twitter Card Previewer", "Advanced social & open graph utility", ScreenShare, false],
      ["Twitter Card Validator", "Validate twitter card", ScreenShareOff, false],
      ["Twitter Image Size Checker", "Check twitter image size quickly", FileImage, false],
      ["LinkedIn Post Inspector Preview", "Advanced social & open graph utility", FileClock, false],
      ["Pinterest Rich Pin Generator", "Generate pinterest rich pin instantly", Sparkles, false],
      ["WhatsApp Link Preview", "Advanced social & open graph utility", AlignHorizontalDistributeStart, false],
      ["Social Meta Tag Completeness Checker", "Check social meta tag completeness quickly", LucideOctagonMinus, false],
    
    ],
  },
  {
    category: "SEO Analytics & Metrics",
    tools: [

      ["Keyword-to-Content Ratio Calculator", "Advanced seo analytics & metrics utility", LucideKeyboardOff, false],
      ["Internal Link Density Calculator", "Advanced seo analytics & metrics utility", AlignHorizontalJustifyCenter, false],
      ["External Link Ratio Calculator", "Advanced seo analytics & metrics utility", AlignHorizontalJustifyEnd, false],
      ["Image-to-Text Ratio Calculator", "Advanced seo analytics & metrics utility", FileCog, false],
      ["Content-to-Code Ratio Calculator", "Advanced seo analytics & metrics utility", FileCog2, false],
      ["Ad Density Calculator", "Advanced seo analytics & metrics utility", AlignHorizontalJustifyStart, false],
      ["Estimated Traffic Calculator", "Advanced seo analytics & metrics utility", AlignHorizontalSpaceAround, false],
      ["Organic CTR Calculator", "Advanced seo analytics & metrics utility", AlignHorizontalSpaceBetween, false],
      ["SEO ROI Calculator", "Advanced seo analytics & metrics utility", AreaChart, false],
      ["Keyword Ranking Value Estimator", "Advanced seo analytics & metrics utility", LucideLockKeyhole, false],
      ["Click Value Calculator", "Advanced seo analytics & metrics utility", AlignJustify, false],
      ["Impression Share Estimator", "Advanced seo analytics & metrics utility", AlignLeft, false],
      ["SEO Score Card Generator", "Generate seo score card instantly", WandSparkles, false],
      ["Page SEO Checklist", "Advanced seo analytics & metrics utility", AlignRight, false],
      ["SEO Audit Template Generator", "Generate seo audit template instantly", LucideWand, false],
      ["Monthly SEO Report Template", "Ready-to-use monthly seo report template", AlignStartHorizontal, false],
      ["Script Count Analyzer", "Analyze script count for SEO", LucideFolderSearch2, false],
      ["Font Request Analyzer", "Analyze font request for SEO", LucideMailSearch, false],
    
    ],
  },
  {
    category: "Competitive Analysis",
    tools: [

      ["Competitor Title Tag Comparator", "Advanced competitive analysis utility", LucideFileType2, false],
      ["Competitor Meta Description Comparator", "Advanced competitive analysis utility", LucideOctagonPause, false],
      ["Competitor Heading Structure Comparator", "Advanced competitive analysis utility", LucideSplit, false],
      ["Content Length Comparator", "Advanced competitive analysis utility", FileDiff, false],
      ["Content Overlap Checker", "Check content overlap quickly", FileDigit, false],
      ["Anchor Text Comparator", "Advanced competitive analysis utility", FileDown, false],
      ["URL Structure Comparator", "Advanced competitive analysis utility", AlignStartVertical, false],
      ["Meta Tag Difference Checker", "Check meta tag difference quickly", LucideOctagonX, false],
      ["Content Freshness Comparator", "Advanced competitive analysis utility", FileEdit, false],
      ["SERP Feature Gap Analyzer", "Analyze serp feature gap for SEO", LucidePackageSearch, false],
      ["Image Count Analyzer", "Analyze image count for SEO", Image, false],
      ["CSS File Count Analyzer", "Analyze css file count for SEO", LucideScanSearch, false],
      ["Third-Party Script Impact Calculator", "Advanced competitive analysis utility", AlignVerticalDistributeCenter, false],
      ["Technical SEO Score Calculator", "Advanced competitive analysis utility", AlignVerticalDistributeEnd, false],
    
    ],
  },
  {
    category: "Image & Media SEO",
    tools: [

      ["Image Alt Text Analyzer", "Analyze image alt text for SEO", FileHeart, false],
      ["Missing Alt Text Detector", "Advanced image & media seo utility", FileInput, false],
      ["Alt Text Quality Checker", "Check alt text quality quickly", FileJson, false],
      ["Image Filename SEO Checker", "Check image filename seo quickly", ImageDown, false],
      ["Image Title Attribute Checker", "Check image title attribute quickly", LucideType, false],
      ["Decorative Image Checker", "Check decorative image quickly", ImageMinus, false],
      ["Image File Size Estimator", "Advanced image & media seo utility", ImageOff, false],
      ["WebP Compatibility Checker", "Check webp compatibility quickly", CircleCheckBig, false],
      ["Lazy Loading Attribute Checker", "Check lazy loading attribute quickly", ClipboardCheck, false],
      ["Image Sitemap Generator", "Generate image sitemap instantly", ImagePlay, false],
      ["Responsive Image Checker", "Check responsive image quickly", ImagePlus, false],
      ["Image SEO Score Calculator", "Advanced image & media seo utility", ImageUp, false],
      ["Image Count Analyzer (Media)", "Advanced image & media seo utility", ImageUpscale, false],
      ["Media SEO Checklist", "Advanced image & media seo utility", AlignVerticalDistributeStart, false],
    
    ],
  },
  {
    category: "Mobile & Page Experience",
    tools: [

      ["Mobile Viewport Tag Checker", "Check mobile viewport tag quickly", LucideSmartphone, false],
      ["Mobile Title Length Checker", "Check mobile title length quickly", LucideTypeOutline, false],
      ["Mobile Meta Description Checker", "Check mobile meta description quickly", LucidePauseOctagon, false],
      ["AMP Tag Validator", "Validate amp tag", LucidePanelBottomInactive, false],
      ["Mobile-Friendly Checklist", "Advanced mobile & page experience utility", LucideSmartphoneCharging, false],
      ["Font Size Readability Checker", "Check font size readability quickly", GaugeCircle, false],
      ["Tap Target Size Checker", "Check tap target size quickly", LucideCircleGauge, false],
      ["Mobile Sitemap Validator", "Validate mobile sitemap", LucideMapPinPlus, false],
      ["Accelerated Mobile Page Reference", "Advanced mobile & page experience utility", LucideSmartphoneNfc, false],
      ["Core Web Vitals Mobile Reference", "Advanced mobile & page experience utility", LucideGauge, false],
      ["Mobile SEO Checklist", "Advanced mobile & page experience utility", LucideTabletSmartphone, false],
      ["Page Experience Score", "Advanced mobile & page experience utility", AlignVerticalJustifyCenter, false],
    
    ],
  },
  {
    category: "SEO Content Templates",
    tools: [

      ["Blog Post SEO Template", "Ready-to-use blog post seo template", FileJson2, false],
      ["Product Page SEO Template", "Ready-to-use product page seo template", AlignVerticalJustifyEnd, false],
      ["Landing Page SEO Template", "Ready-to-use landing page seo template", AlignVerticalJustifyStart, false],
      ["Category Page SEO Template", "Ready-to-use category page seo template", AlignVerticalSpaceAround, false],
      ["Local Landing Page Template", "Ready-to-use local landing page template", LucideMapPinPlusInside, false],
      ["SEO Brief Generator", "Generate seo brief instantly", LucideWand2, false],
      ["Content Freshness Checker (Template)", "Advanced seo content templates utility", FileLineChart, false],
      ["SEO Writing Guide", "Advanced seo content templates utility", AlignVerticalSpaceBetween, false],
    
    ],
  },
];

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const CATEGORIES: Category[] = raw.map((c) => ({
  name: c.category,
  slug: slugify(c.category),
  tools: c.tools,
}));

const seen = new Set<string>();
export const TOOLS: Tool[] = raw.flatMap((c) =>
  c.tools.map(([name, desc, icon, isLive]) => {
    let slug = slugify(name);
    while (seen.has(slug)) slug += "-2";
    seen.add(slug);
    return {
      slug,
      name,
      description: desc,
      category: c.category,
      icon,
      status: isLive ? "live" : "soon",
    };
  })
);

export const TOOL_BY_SLUG = new Map(TOOLS.map((t) => [(t as any).slug, t]));
export const TOOLS_BY_CATEGORY = (cat: string) =>
  TOOLS.filter((t) => (t as any).category === cat);

export const TOTAL_TOOLS = TOOLS.length;

import { ToolResult } from "@/components/CategorySearch";
export const SEARCH_REGISTRY: ToolResult[] = TOOLS.map((tool) => ({
  name: tool.name,
  description: tool.description,
  slug: tool.slug,
  href: `/seo/tools/${tool.slug}`,
  category: tool.category,
  isBuilt: tool.status === "live",
}));
