/**
 * Homophone confusion rules: its/it's, your/you're, their/there/they're and
 * friends.
 *
 * Every pair below is a documented confusion, and every check is a *context*
 * rule, not a blanket replacement: a pattern fires only when the surrounding
 * words make one spelling implausible ("your going", "has past", "and than").
 * That keeps precision high on real prose, and it means the tool never claims to
 * understand a sentence — it claims to know these constructions.
 *
 * Patterns are built by the four helpers below, which exist for one reason:
 * lookaround order is easy to get wrong by hand. A lookbehind written *after*
 * the flagged word is evaluated after it and can never match, so `before()`
 * always emits a leading lookbehind. The conventions:
 *
 *   after(word, followers)   — the flagged word, then context in a lookahead
 *   before(word, context)    — context in a leading lookbehind, then the word
 *   around(word, ctx, fans)  — leading lookbehind plus trailing lookahead
 *   exact(word)              — the word alone, no context at all
 *
 * In every case the whole match is exactly the flagged word, so the reported
 * offset points at the word itself. `suggest` is the spelling the context calls
 * for (or a function when the fix depends on the matched form), and `note`
 * explains why the context is suspicious so a writer can overrule it.
 *
 * The engine is silent about homophones whose context requirements are
 * identical ("read" / "red" both fit "I ___ it"), which is most of them.
 */
export interface HomophoneFinding {
  /** Rule id, e.g. "your-youre". */
  rule: string;
  /** The pair, e.g. "your / you're". */
  pair: string;
  /** The word as written. */
  word: string;
  /** The spelling this context calls for. */
  suggestion: string;
  note: string;
  start: number;
  end: number;
  snippet: string;
}

interface HomophonePattern {
  re: RegExp;
  suggest: string | ((matched: string) => string);
  note?: string;
}

interface HomophoneRule {
  id: string;
  pair: string;
  note: string;
  patterns: HomophonePattern[];
}

type Suggestion = string | ((matched: string) => string);

/** Plural-aware suggestion for a pattern that matches an optional trailing "s". */
const plural =
  (singular: string, pluralForm: string): Suggestion =>
  (matched) =>
    matched.toLowerCase().endsWith("s") ? pluralForm : singular;

const after = (word: string, followers: string, suggest: Suggestion, note?: string): HomophonePattern => ({
  re: new RegExp(`\\b${word}\\b(?=\\s+(?:${followers})\\b)`, "gi"),
  suggest,
  note,
});

const before = (word: string, context: string, suggest: Suggestion, note?: string): HomophonePattern => ({
  re: new RegExp(`(?<=${context})\\b${word}\\b`, "gi"),
  suggest,
  note,
});

const around = (word: string, context: string, followers: string, suggest: Suggestion, note?: string): HomophonePattern => ({
  re: new RegExp(`(?<=${context})\\b${word}\\b(?=\\s+(?:${followers})\\b)`, "gi"),
  suggest,
  note,
});

const exact = (word: string, suggest: Suggestion, note?: string): HomophonePattern => ({
  re: new RegExp(`\\b${word}\\b`, "gi"),
  suggest,
  note,
});

/** Be-verbs and similar: "their is", "their going", "their remains". */
const BE_VERB_FOLLOWERS =
  "is|are|was|were|has|have|had|will|would|should|could|must|might|can|may|seems|appears|comes|goes|remains|exists|been|being|used\\s+to|going|coming|leaving|arriving|moving|planning|working|waiting|trying|looking|sitting|standing";

/** Nouns that follow a possessive ("your car", "their team"). */
const POSSESSED_THINGS =
  "own|house|car|book|books|idea|ideas|job|turn|opinion|answer|fault|problem|money|team|family|friend|friends|company|business|work|life|health|future|plan|plans|choice|mistake|mistakes|help|support|advice|account|password|address|details|information|data|files?|documents?|project|report|application|request|message|question|camera|dog|cat|children|kids|parents|mother|father|brother|sister|partner|colleague|boss|client|clients|name|names|reasons?|efforts?|actions?|version|versions|side|sides|part|parts|role|roles|story|stories|new|old|first|last|next|best|favourite|favorite";

/** Degree adjectives that follow "too" or "two". */
const DEGREE_ADJECTIVES =
  "much|many|late|early|long|short|big|small|far|fast|slow|good|bad|expensive|cheap|difficult|easy|often|soon|high|low|hot|cold|loud|quiet|hard|soft|young|old|heavy|deep|tall|busy|tired|nice|kind|proud|shy|weak|strong|serious|dangerous|risky|complicated|simple|few|little|poor|rich|sweet|salty|bright|dark|thick|thin|narrow|wide";

/** Comparatives that must be followed by "than". */
const COMPARATIVES =
  "more|less|rather|other|greater|fewer|better|worse|longer|shorter|higher|lower|older|younger|bigger|smaller|faster|slower|easier|harder|cheaper|larger|richer|poorer|stronger|weaker|farther|further|smarter|taller|wiser|closer|smoother|funnier|heavier|lighter|nicer|safer";

export const HOMOPHONE_RULES: HomophoneRule[] = [
  {
    id: "its-its",
    pair: "its / it's",
    note: "\"its\" is possessive; a following verb phrase needs \"it's\" (it is).",
    patterns: [
      after(
        "its",
        "been|being|not|going|gonna|just|only|always|very|really|a|an|the\\s+(?:best|only|first|last|worst)|over|about\\s+to|time\\s+to|important|clear|possible|likely|unlikely|worth|here|there|too|so|my|your|his|her|our|their",
        "it's",
      ),
      after(
        "it's",
        "own|purpose|place|use|name|design|origin|value|size|form|shape|colour|color|contents|role|job|meaning|main|unique|intended|very\\s+own|roof|tail|collar|cover|edges?|corners?|surface|texture|tone|top|bottom|back|front|eyes|hands|head|leaves|wings|legs|centre|center",
        "its",
      ),
    ],
  },
  {
    id: "your-youre",
    pair: "your / you're",
    note: "\"your\" is possessive; \"you're\" is \"you are\".",
    patterns: [
      after(
        "your",
        "going|coming|doing|gonna|kidding|welcome|right|wrong|invited|fired|hired|amazing|awesome|crazy|not|so\\s+(?:kind|good|sweet)|the\\s+best|such|always|never|probably|clearly|obviously|very|too",
        "you're",
      ),
      after("you're", POSSESSED_THINGS, "your"),
    ],
  },
  {
    id: "their-there-theyre",
    pair: "their / there / they're",
    note: "\"their\" is possessive, \"there\" points at a place or existence, \"they're\" is \"they are\".",
    patterns: [
      after("their", BE_VERB_FOLLOWERS, "there"),
      after("there", POSSESSED_THINGS, "their"),
      after("they're", "is|was|has|been|seems|appears", "there"),
      exact("thier", "their", "\"thier\" is a misspelling of \"their\"."),
    ],
  },
  {
    id: "to-too-two",
    pair: "to / too / two",
    note: "A degree word before an adjective is \"too\"; a preposition before a noun phrase is \"to\".",
    patterns: [
      after("to", DEGREE_ADJECTIVES, "too"),
      after(
        "too",
        "the|a|an|my|your|his|her|our|their|this|that|these|those|it|them|him|me|us|you|work|school|bed|town|sleep|speak|talk|walk|go|come|say|tell|ask|see|eat|drink|read|write|buy|pay|send|take|give|get|make|do",
        "to",
      ),
      after("two", DEGREE_ADJECTIVES, "too"),
    ],
  },
  {
    id: "then-than",
    pair: "then / than",
    note: "A comparison takes \"than\"; a sequence takes \"then\".",
    patterns: [
      before("then", `\\b(?:${COMPARATIVES})\\s+`, "than"),
      before("than", "\\band\\s+", "then", "\"and than\" is almost always \"and then\"."),
    ],
  },
  {
    id: "affect-effect",
    pair: "affect / effect",
    note: "\"affect\" is the verb, \"effect\" the noun.",
    patterns: [
      after("affect", "on|upon|of", "effect", "\"effect on\" is the noun phrase."),
      before(
        "affects?",
        "\\b(?:the|an|any|no|some|side|positive|negative|overall|real|big|huge|significant|major|minor|lasting|immediate|same|direct|indirect|little|great)\\s+",
        plural("effect", "effects"),
      ),
      before("effects?", "\\b(?:will|would|can|could|may|might|to|doesn't|don't|didn't|never|not)\\s+", plural("affect", "affects")),
    ],
  },
  {
    id: "lose-loose",
    pair: "lose / loose",
    note: "\"loose\" means not tight; the verb is \"lose\".",
    patterns: [
      after(
        "loose",
        "weight|money|time|interest|control|focus|track|hope|faith|sleep|customers|clients|business|jobs?|the\\s+game|the\\s+race|my|your|his|her|our|their|it|them|you|me|us|him|speed|momentum|patience|points?|votes?",
        "lose",
      ),
      before(
        "loose",
        "\\b(?:to|will|would|won't|don't|doesn't|didn't|never|might|could|should|must|can|not|going\\s+to|trying\\s+to|about\\s+to|want\\s+to|need\\s+to|hate\\s+to|likely\\s+to|bound\\s+to|expected\\s+to|help\\s+you|help\\s+me|help\\s+us)\\s+",
        "lose",
      ),
      after(
        "lose",
        "change|ends?|thread|fit|fitting|clothes|clothing|leaf|leaves|soil|gravel|screws?|buttons?|wire|connection|canon|structure|court|team|group|coalition|alliance|talk|tooth|teeth",
        "loose",
        "\"lose change\" and \"lose ends\" need the adjective \"loose\".",
      ),
    ],
  },
  {
    id: "whose-whos",
    pair: "whose / who's",
    note: "\"whose\" is possessive; \"who's\" is \"who is\".",
    patterns: [
      after(
        "whose",
        "going|coming|gonna|doing|ready|next|up|here|there|the\\s+best|the\\s+one|responsible|in\\s+charge|to\\s+blame|at\\s+the\\s+door",
        "who's",
      ),
      after("who's", `${POSSESSED_THINGS}|responsibility|turn`, "whose"),
    ],
  },
  {
    id: "passed-past",
    pair: "passed / past",
    note: "\"passed\" is the verb; \"past\" is the preposition, adverb or adjective.",
    patterns: [
      before("past", "\\b(?:have|has|had|having|already|just|never)\\s+", "passed"),
      after("passed", "few|two|three|several|couple", "past"),
      around("passed", "\\bthe\\s+", "week|month|year|decade|century|few|two|three|several|couple", "past"),
    ],
  },
  {
    id: "quiet-quite",
    pair: "quiet / quite",
    note: "\"quite\" is the degree word; \"quiet\" means little noise.",
    patterns: [
      after(
        "quiet",
        "a\\s+lot|good|bad|nice|big|small|easy|hard|fast|slow|different|important|useful|clear|simple|common|rare|possible|interesting|difficult|expensive|cheap|quick|soon|well|often|likely|unlikely|similar|obvious|surprising|funny|strange|tall|short|young|old|heavy|light|warm|cold|busy|happy|sad|angry|tired|serious|dangerous|safe|loud|soft|strong|weak|deep|bright|dark|rich|poor|far|close|near|high|low|proud|keen|fond|willing|unusual",
        "quite",
      ),
      after(
        "quite",
        "person|man|woman|boy|girl|room|street|night|place|voice|town|village|house|car|dog|cat|children|kids|music|neighborhood|neighbourhood|library|corner|park|beach|garden|office|morning|evening|afternoon",
        "quiet",
        "If you meant calm or silent, the adjective is \"quiet\".",
      ),
    ],
  },
  {
    id: "accept-except",
    pair: "accept / except",
    note: "\"accept\" means to receive; \"except\" means to exclude.",
    patterns: [
      before(
        "accept",
        "\\b(?:everyone|everybody|all|nobody|none|everything|anything|nothing|each|anyone|anybody)\\s+",
        "except",
      ),
      after(
        "except",
        "(?:the\\s+)?(?:job|offer|gift|invitation|apology|responsibility|award|terms|payment|position|role|challenge|cash|card|credit\\s+card|friend\\s+request|proposal|plan|conditions?|help)",
        "accept",
      ),
    ],
  },
  {
    id: "advice-advise",
    pair: "advice / advise",
    note: "\"advice\" is the noun; \"advise\" is the verb.",
    patterns: [
      before(
        "advise",
        "\\b(?:the|some|any|my|your|his|her|our|their|good|bad|better|best|great|sound|poor|expert|legal|medical|professional|practical|valuable|useful|helpful|honest|sensible|careful|free|independent|useless|wrong)\\s+",
        "advice",
      ),
      after("advice", "me|us|him|her|them|you|against|on|about|that|to|everyone", "advise"),
    ],
  },
  {
    id: "peace-piece",
    pair: "peace / piece",
    note: "\"peace\" is calm; \"piece\" is a part. The idiom \"peace and quiet\" is correct as written.",
    patterns: [
      after("peace", "of\\s+(?:mind|cake|paper|artwork|furniture|information|equipment|music|land|property|luggage|advice|the\\s+action|work)", "piece"),
      after("piece", "of\\s+mind|and\\s+quiet|and\\s+love|treaty|agreement|talks|process|deal|accord|offering|keepers?|dividend|move|meal|work", "peace"),
    ],
  },
  {
    id: "principal-principle",
    pair: "principal / principle",
    note: "\"principal\" is the head or the main thing; \"principle\" is a rule or truth.",
    patterns: [
      before(
        "principals?",
        "\\b(?:moral|ethical|basic|fundamental|same|guiding|core|general|important|key|central|underlying|first|scientific|legal|mathematical|design|accounting|democratic)\\s+",
        plural("principle", "principles"),
      ),
      after(
        "principle",
        "investigator|reason|argument|component|balance|amount|office|residence|engineer|architect|photographer|conductor|owner|of\\s+the\\s+school|of\\s+the\\s+college|of\\s+the\\s+academy",
        "principal",
      ),
      after(
        "principals?",
        "of\\s+(?:physics|thermodynamics|least|equivalence|uncertainty|relativity|conservation|parsimony|nonviolence|motion|optics|accounting|economics)",
        plural("principle", "principles"),
      ),
    ],
  },
  {
    id: "stationary-stationery",
    pair: "stationary / stationery",
    note: "\"stationary\" means not moving; \"stationery\" is paper goods.",
    patterns: [
      after(
        "stationary",
        "shop|store|department|supplies|supply|paper|envelope|envelopes|catalog|catalogue|note|notes|card|cards|pen|pens|order|orders|company|brand|items?|for|at|in|from|to|and|or|needed|required|ordered|is|was",
        "stationery",
      ),
      after(
        "stationery",
        "car|vehicle|bike|bicycle|train|object|front|remained|stayed|state|position|exercise|cycle|engine|point|target|mode|orbit|wave|population|economy|for|at|in|that|which",
        "stationary",
      ),
    ],
  },
  {
    id: "complement-compliment",
    pair: "complement / compliment",
    note: "\"complement\" completes; \"compliment\" praises.",
    patterns: [
      after(
        "compliment",
        "each\\s+other|the\\s+(?:colors|colours|flavors|flavours|dish|wine|meal|design|set|pair|sauce|cheese|coffee|furniture|decor|curtains|jacket|shoes|outfit|soup|salad)",
        "complement",
      ),
      after("complement", "me|him|her|us|them|you|the\\s+chef|the\\s+host|the\\s+staff|her\\s+work|his\\s+work", "compliment"),
    ],
  },
  {
    id: "cite-site-sight",
    pair: "cite / site / sight",
    note: "\"cite\" quotes a source, \"site\" is a place, \"sight\" is seeing.",
    patterns: [
      around(
        "sights?",
        "\\b(?:the|a|an|this|that|these|those|no|any)\\s+",
        "source|sources|article|articles|paper|papers|study|studies|reference|references|author|authors|book|books|journal|journals|website|provider|page|pages|evidence|examples?",
        plural("cite", "cites"),
      ),
      after(
        "cites?",
        "address|location|map|visit|work|workplace|survey|inspection|plans?|check|supervisor|manager|foreman|agent|engineer|license|licence|permit|contractor|blasting|crane|fence|parking|boundary|plan|construction",
        plural("site", "sites"),
      ),
    ],
  },
  {
    id: "brake-break",
    pair: "brake / break",
    note: "\"brake\" stops a vehicle; \"break\" is the verb for damage and pauses.",
    patterns: [
      after(
        "break",
        "(?:the\\s+)?(?:car|vehicle|bike|pedal|pedals|lights?|pads?|disc|discs|fluid|hoses?|system|systems|failure|lever|cables?|drum|shoes|calipers?)",
        "brake",
      ),
      after(
        "brake",
        "(?:the\\s+)?(?:rules?|laws?|promise|promises|records?|silence|news|hearts?|bones?|legs?|arms?|windows?|glass|habits?|contract|agreement|deal|down|up|through|into|open|free|even|away|apart)",
        "break",
      ),
    ],
  },
  {
    id: "lead-led",
    pair: "lead / led",
    note: "The past tense of \"lead\" is \"led\".",
    patterns: [before("lead", "\\b(?:has|have|had|having|was|were)\\s+", "led")],
  },
  {
    id: "everyday-every-day",
    pair: "everyday / every day",
    note: "\"everyday\" is the adjective (\"everyday life\"); \"every day\" is the adverb (\"I write every day\").",
    patterns: [
      after(
        "everyday",
        "I|we|they|he|she|you|it|is|are|was|were|and|but|so|because|this|that|my|your|his|her|our|their|to|for|in|at|on",
        "every day",
      ),
      {
        // An adjective cannot stand alone: "I write everyday." needs "every day".
        re: /\beveryday\b(?=\s*[.,;:!?)"']|\s*$)/gim,
        suggest: "every day",
        note: "\"everyday\" is an adjective and needs a noun after it; standing alone it is \"every day\".",
      },
      after(
        "day",
        "life|lives|use|routine|basis|occurrence|activity|activities|tasks?|objects?|items?|language|problems?|situations?|conversation|wear|clothes|car|things?|habits?|person|people|moments?|experience|experiences|struggle|struggles|joys?|practice|practices|necessities|essentials",
        "everyday",
      ),
    ],
  },
  {
    id: "alot",
    pair: "a lot",
    note: "\"alot\" is not a word; it is \"a lot\".",
    patterns: [exact("alot", "a lot")],
  },
  {
    id: "weather-whether",
    pair: "weather / whether",
    note: "\"weather\" is the noun; \"whether\" introduces a choice.",
    patterns: [
      after(
        "weather",
        "or\\s+not|you|I|we|they|he|she|it|to|this|that|our|my|your|his|her|it's|we\\s+should|we\\s+can|they\\s+should|I\\s+should|we\\s+want|I\\s+want",
        "whether",
      ),
      after("whether", "forecast|conditions|report|channel|service|warning|pattern|system|station|data|today|tomorrow|yesterday|permits?|allows?", "weather"),
    ],
  },
  {
    id: "desert-dessert",
    pair: "desert / dessert",
    note: "\"desert\" is the dry place (and the verb to abandon); \"dessert\" is the sweet course.",
    patterns: [
      after("dessert", "island|storm|ed|ing|the\\s+army|him|her|them|us|you|me|his|my|your|their", "desert"),
      after("desert", "menu|spoon|plate|wine|trolley|cart|for\\s+two|today|tonight|first|last", "dessert"),
    ],
  },
  {
    id: "hole-whole",
    pair: "hole / whole",
    note: "\"hole\" is an opening; \"whole\" is the entire thing.",
    patterns: [
      after("whole", "in\\s+(?:the|my|your|his|her|our|their|one)|dug|drilled|cut|torn|poked|ripped", "hole"),
      around(
        "hole",
        "\\bthe\\s+",
        "day|week|month|year|time|team|world|story|thing|situation|class|group|point|idea|life|city|country|company|family|project|process|picture|plan|truth|night|morning|afternoon|evening|summer|winter|audience|room",
        "whole",
      ),
    ],
  },
  {
    id: "wait-weight",
    pair: "wait / weight",
    note: "\"wait\" is the pause; \"weight\" is the mass.",
    patterns: [
      after("weight", "for|until|here|off|around|outside|inside|in\\s+line|while|and\\s+see", "wait"),
      after("wait", "lifting|issue|problem|training|class|limit|gain|management|scale|machine|plate|bar", "weight"),
    ],
  },
  {
    id: "threw-through",
    pair: "threw / through",
    note: "\"threw\" is the past tense of throw; \"through\" is the preposition.",
    patterns: [
      after(
        "threw",
        "(?:the\\s+)?(?:door|window|tunnel|park|forest|city|night|period|crowd|process|system|phase|stage|time|years|decades|country|town|village|chapter|portal|gate|gateway)",
        "through",
      ),
      after("through", "(?:the\\s+)?(?:ball|stone|rock|party|dinner|a\\s+fit|a\\s+tantrum|a\\s+curve)", "threw"),
    ],
  },
  {
    id: "right-write",
    pair: "right / write",
    note: "\"right\" is correct or a direction; \"write\" is to put words down.",
    patterns: [
      after(
        "right",
        "(?:a\\s+|an\\s+|the\\s+)?(?:letter|letters|email|e-mail|essay|book|report|article|paper|novel|poem|note|notes|message|answer|answers|check|cheque|summary|review|blog|post|paragraph|sentence|chapter|test|exam|code|program|programme|script|document|documents|word|words|speech|story|song|list|draft)",
        "write",
      ),
      after(
        "write",
        "now|here|away|answer|answers|decision|choice|time|place|direction|side|person|people|thing|things|way|ways|amount|number|kind|type|sort|moment|question|questions|word|words|hand|foot|leg|arm|shoulder|knee|eye|ear|turn|track|field|path|road",
        "right",
      ),
    ],
  },
  {
    id: "which-witch",
    pair: "which / witch",
    note: "\"which\" selects; \"witch\" is the folk figure.",
    patterns: [
      after(
        "witch",
        "one|ones|is|are|was|were|of|you|do|does|did|way|ways|option|options|would|should|will|can|could|to|means|makes|brings|happened|happens|side|type|kind|part|version|method",
        "which",
      ),
      after("which", "craft|hunt|house|doctor|doctors|trial|magic|talents?|hat|hats|broom|potion|spell|spells|hazel", "witch"),
    ],
  },
  {
    id: "steal-steel",
    pair: "steal / steel",
    note: "\"steal\" is to take; \"steel\" is the metal.",
    patterns: [
      after(
        "steel",
        "(?:(?:the|my|your|his|her|our|their|a|an)\\s+)?(?:money|it|them|from|idea|ideas|car|bike|phone|wallet|purse|credit|design|content|work|thunder|show|scene|attention|glory|spotlight|time|data|information|glance|peak|peek)",
        "steal",
      ),
      after(
        "steal",
        "beams?|rods?|plates?|mill|industry|market|prices|doors?|frames?|bars?|structures?|factory|plants?|works|mills?|alloy|alloys|tubes?|pipes?|wire|mesh|reinforced|toe|toes?|guitar|drum",
        "steel",
      ),
    ],
  },
  {
    id: "meat-meet",
    pair: "meat / meet",
    note: "\"meat\" is food; \"meet\" is to come together.",
    patterns: [
      after("meat", "me|us|you|them|him|her|the\\s+team|at|in|up|with|for|halfway", "meet"),
      after("meet", "balls?|loaf|market|pies?|sauce|grinder|grinders?|cleavers?|eaters?|lovers?|free|less|packing|processing|products?|industry|substitutes?|dishes|stews?|curries?|tenderizer", "meat"),
    ],
  },
  {
    id: "one-won",
    pair: "one / won",
    note: "\"won\" is the past tense of win; \"one\" is the number.",
    patterns: [
      after("one", "(?:the\\s+)?(?:first\\s+place|medals?|lottery|election|contest|competition|awards?|prizes?|by\\s+a|over\\s+the|hearts)", "won"),
      before("one", "\\b(?:have|has|had|having|just|finally|already|never|recently|easily|narrowly|convincingly|clearly|comfortably|almost)\\s+", "won"),
      after(
        "won",
        "of\\s+the|of\\s+my|of\\s+your|of\\s+his|of\\s+her|of\\s+our|of\\s+their|of\\s+those|of\\s+them|of\\s+us|more|day|days|hour|hours|week|weeks|month|months|year|years|person|people|things?|tickets?|apple|apples|slice|piece|number",
        "one",
      ),
    ],
  },
  {
    id: "sea-see",
    pair: "sea / see",
    note: "\"sea\" is the water; \"see\" is to look or understand.",
    patterns: [
      after(
        "sea",
        "you|him|her|us|them|it|the\\s+(?:doctor|point|problem|difference|light|reason|result|issue|details?|sign|picture|future)|that|this|what|how|if|a\\s+doctor|clearly|why|where|whether|more|less",
        "see",
      ),
      after(
        "see",
        "level|levels|food|side|sides?|shore|weed|weeds?|water|breeze|gulls?|views?|bass|bream|captain|port|harbor|harbour|route|voyage|cruise|depth|depths|floor|bed|salt|shell|shells?|fish|birds?|air|spray|wall|front|change|urchin",
        "sea",
      ),
    ],
  },
  {
    id: "sun-son",
    pair: "sun / son",
    note: "\"sun\" is the star; \"son\" is a male child.",
    patterns: [
      before("sun", "\\b(?:my|his|her|their|your|our|first|only|youngest|oldest|eldest|second|third|newborn|baby|little|beloved)\\s+", "son"),
      after("son", "light|lights|shine|shines|shining|rise|rises|set|sets|setting|screens?|glasses|cream|burns?|damage|energy|exposure|protection|flowers?|dried|dry|hats?|roof|heat|block|umbrella|bed|tea|care", "sun"),
    ],
  },
  {
    id: "tail-tale",
    pair: "tail / tale",
    note: "\"tail\" is the appendage; \"tale\" is the story.",
    patterns: [
      after("tail", "of\\s+two\\s+cities|told|tellers?|about|begins|ends|is\\s+told", "tale"),
      after("tale", "feather|fin|fins|coat|lights?|gate|gating|spins?|wags?|wind|bones?", "tail"),
    ],
  },
  {
    id: "weak-week",
    pair: "weak / week",
    note: "\"weak\" is lack of strength; \"week\" is seven days.",
    patterns: [
      after("weak", "end|ends|day|days|ly|long|after|before|ago|of\\s+the|earlier|later|passed|by\\s+week|ahead|prior|last|this|next|following", "week"),
      after(
        "week",
        "arguments?|excuses?|ness|nesses?|points?|signals?|links?|knees?|hearts?|immune|passwords?|forces?|spots?|positions?|hands?|sides?|voices?|reasons?|evidence|support|case|character|characters?|will|minded|willed|lings?",
        "weak",
      ),
    ],
  },
  {
    id: "aloud-allowed",
    pair: "aloud / allowed",
    note: "\"aloud\" means out loud; \"allowed\" means permitted.",
    patterns: [
      before("aloud", "\\b(?:is|are|was|were|not|never|no\\s+longer|already)\\s+", "allowed"),
      before(
        "allowed",
        "\\b(?:read|reads|reading|say|says|saying|said|sing|sings|singing|sang|think|thinks|thinking|thought|laugh|laughs|laughing|laughed|speak|speaks|speaking|spoke|spoken|count|counts|counting|wonder|wonders|wondering|wondered)\\s+",
        "aloud",
      ),
    ],
  },
  {
    id: "bare-bear",
    pair: "bare / bear",
    note: "\"bare\" is uncovered; \"bear\" is to carry, endure or the animal.",
    patterns: [
      before(
        "bare",
        "\\b(?:can't|cannot|couldn't|can|could|will|would|won't|must|to|hard\\s+to|able\\s+to|trying\\s+to|have\\s+to|had\\s+to|got\\s+to|help\\s+but|not)\\s+",
        "bear",
      ),
      after("bear", "feet|foot|hands|hand|skin|walls?|bones?|minimum|necessities|essentials|facts|truth|ideas?|basics|legs?|arms?|shoulders?|chest|back|head", "bare"),
    ],
  },
  {
    id: "throne-thrown",
    pair: "throne / thrown",
    note: "\"thrown\" is the past participle of throw; \"throne\" is the chair.",
    patterns: [before("throne", "\\b(?:was|were|had|has|have|having|being|got|gets|getting)\\s+", "thrown")],
  },
  {
    id: "mail-male",
    pair: "mail / male",
    note: "\"mail\" is post; \"male\" is the gender.",
    patterns: [
      after("mail", "pattern|nurse|nurses|model|models|friend|friends|colleague|colleagues|actor|actors|voice|voices|dominated|order|chauvinism|chauvinist|toilet|fashion|gaze", "male"),
      after("male", "me|us|you|him|her|them|it|the\\s+(?:letter|package|order|check|cheque)|to|from|order|boxes|carrier|carriers|server|servers|service|services|delivery|deliveries", "mail"),
    ],
  },
  {
    id: "plain-plane",
    pair: "plain / plane",
    note: "\"plain\" is simple; \"plane\" is the aircraft or a flat surface.",
    patterns: [
      after("plain", "tickets?|fares?|flights?|seats?|trips?|journey|landing|crash|crashes|passengers?|pilots?|airline|carrier|travel|mode|ride|wing", "plane"),
      after("plane", "and\\s+simple|simple|text|texts|english|language|sights?|views?|clothes|clothing|shirts?|t-shirt|paper|truth|facts?|answers?|words?|speaking|folks?|people|yogurt|yoghurt|rice|bread|cake|flour|water|cigarettes?", "plain"),
    ],
  },
  {
    id: "board-bored",
    pair: "board / bored",
    note: "\"board\" is the panel or committee; \"bored\" is uninterested.",
    patterns: [
      after("board", "out\\s+of|with|at\\s+home|to\\s+death|to\\s+tears|of\\s+it|of\\s+them|stiff", "bored"),
      after("bored", "of\\s+directors|members?|meeting|meetings?|rooms?|committee", "board"),
    ],
  },
  {
    id: "flour-flower",
    pair: "flour / flower",
    note: "\"flour\" is the baking ingredient; \"flower\" is the bloom.",
    patterns: [
      after("flour", "gardens?|pots?|beds?|arrangements?|bouquets?|petals?|shops?|market|stall|vase|vases?|display|blooms?|petal", "flower"),
      after("flower", "(?:the\\s+)?(?:bakery|bread|cake|tortillas?|wheat|dough|mix|mixture|sacks?|bags?|mill)", "flour"),
    ],
  },
  {
    id: "pair-pear",
    pair: "pair / pear",
    note: "\"pair\" is two of something; \"pear\" is the fruit.",
    patterns: [
      after("pair", "trees?|fruit|juice|salad|slices?|shaped|cider|orchard", "pear"),
      after("pear", "of\\s+(?:shoes|socks|glasses|pants|jeans|scissors|hands|eyes|trousers|earrings?|shorts|gloves|boots|sneakers|tweezers|pliers|binoculars)", "pair"),
    ],
  },
  {
    id: "waist-waste",
    pair: "waist / waste",
    note: "\"waist\" is the body line; \"waste\" is squandering or rubbish.",
    patterns: [
      after("waist", "of\\s+time|of\\s+money|of\\s+space|of\\s+effort|disposal|management|basket|paper|land|water|food|energy|money|time|resources?|opportunity|chance", "waste"),
    ],
  },
];

/** Number of confusion pairs the tool documents. */
export const HOMOPHONE_PAIR_COUNT = new Set(HOMOPHONE_RULES.map((rule) => rule.pair)).size;

/** Findings are capped so a pathological input cannot return tens of thousands of rows. */
export const MAX_HOMOPHONE_FINDINGS = 400;

function snippet(text: string, index: number, length: number): string {
  const start = Math.max(0, index - 30);
  const end = Math.min(text.length, index + length + 30);
  return `${start > 0 ? "…" : ""}${text.slice(start, end).replace(/\s+/g, " ").trim()}${end < text.length ? "…" : ""}`;
}

function applySuggestion(pattern: HomophonePattern, matched: string): string {
  const suggested = typeof pattern.suggest === "function" ? pattern.suggest(matched) : pattern.suggest;
  // Preserve the writer's capitalisation of the first letter.
  if (matched[0] !== matched[0].toLowerCase() && matched[0] === matched[0].toUpperCase()) {
    return suggested[0].toUpperCase() + suggested.slice(1);
  }
  return suggested;
}

/** Run every documented rule and return the findings in document order. */
export function findHomophoneConfusions(text: string, rules: HomophoneRule[] = HOMOPHONE_RULES): HomophoneFinding[] {
  const findings: HomophoneFinding[] = [];
  const seen = new Set<string>();

  for (const rule of rules) {
    for (const pattern of rule.patterns) {
      pattern.re.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = pattern.re.exec(text)) !== null) {
        const word = match[0];
        if (pattern.re.lastIndex === match.index) pattern.re.lastIndex += 1;
        const key = `${rule.id}:${match.index}:${word}`;
        if (seen.has(key)) continue;
        const suggestion = applySuggestion(pattern, word);
        if (suggestion.toLowerCase() === word.toLowerCase()) continue;
        seen.add(key);
        findings.push({
          rule: rule.id,
          pair: rule.pair,
          word,
          suggestion,
          note: pattern.note ?? rule.note,
          start: match.index,
          end: match.index + word.length,
          snippet: snippet(text, match.index, word.length),
        });
        if (findings.length >= MAX_HOMOPHONE_FINDINGS) return findings.sort((a, b) => a.start - b.start);
      }
    }
  }

  return findings.sort((a, b) => a.start - b.start);
}

/** Findings per pair, for the summary table. */
export function homophoneCounts(findings: HomophoneFinding[]): { pair: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const finding of findings) counts.set(finding.pair, (counts.get(finding.pair) ?? 0) + 1);
  return [...counts.entries()]
    .map(([pair, count]) => ({ pair, count }))
    .sort((a, b) => b.count - a.count || a.pair.localeCompare(b.pair));
}

/** Report text for the copy/download buttons. */
export function formatHomophoneReport(findings: HomophoneFinding[], pairsChecked: number): string {
  if (findings.length === 0) {
    return `No suspicious homophones. ${pairsChecked} confusion pairs checked.`;
  }
  return [
    `Possible homophone confusions: ${findings.length}`,
    `Pairs checked: ${pairsChecked}`,
    "",
    ...findings.map((finding) => `${finding.word} → ${finding.suggestion}  (${finding.pair})\n    ${finding.snippet}`),
  ].join("\n");
}
