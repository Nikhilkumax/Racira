import {
  CheckCircle2, ZoomOut, ZoomIn, AlignLeft, Wallet, Wand2, ZapOff, Zap, BookOpen, Youtube, ArrowRightLeft, YinYang, FileText, XSquare, ListChecks, Hash, Search, XOctagon, Calculator, LineChart, Eye, Lightbulb, XCircle, Unlock, Lock, X, FileCode, Wrench, WrapText, Workflow, WineOff, Wine, PenTool, Wind, Network, Key, Globe, WifiOff, Sprout, Scale, Wifi, Grid3x3, Image, WholeWord, WheatOff, Wheat, Webhook, Webcam, Waves, Watch, Warehouse, Wand, Receipt, Wallpaper, GitCompare, WalletCards, Wallet2, Vote, VolumeX, Volume2, Coins, Volume1, Volume
} from "lucide-react";


export type Tool = {
  slug: string;
  name: string;
  desc: string;
  category: string;
  status: "live" | "soon";
  icon?: any;
};

const mk = (name: string, desc: string, category: string, implemented = false, icon: any): Tool => ({
  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
  name,
  desc,
  category,
  status: implemented ? "live" : "soon",
  icon,
});

export const TOOLS: Tool[] = [
  // Wallet & Address (15)
  mk("Ethereum Address Validator", "Validate ETH addresses & checksums", "Wallet & Address", true, CheckCircle2),
  mk("Bitcoin Address Validator", "Validate BTC addresses (P2PKH, P2SH, Bech32)", "Wallet & Address", true, ZoomOut),
  mk("Solana Address Validator", "Validate Solana Base58 addresses", "Wallet & Address", true, ZoomIn),
  mk("Multi-Chain Address Formatter", "Format addresses across chains", "Wallet & Address", false, AlignLeft),
  mk("Address Checksum Tool EIP-55", "Apply EIP-55 mixed-case checksum", "Wallet & Address", true, Wallet),
  mk("Wallet Address QR Code Generator", "Generate QR codes for addresses", "Wallet & Address", false, Wand2),
  mk("Vanity Address Pattern Checker", "Check vanity address patterns locally", "Wallet & Address", false, ZapOff),
  mk("HD Wallet Path BIP-44 Explorer", "Explore BIP-44 derivation paths", "Wallet & Address", false, Zap),
  mk("Mnemonic Seed Phrase Word List Reference", "Browse BIP-39 wordlist", "Wallet & Address", false, BookOpen),
  mk("Seed Phrase Validator BIP-39", "Validate BIP-39 mnemonics", "Wallet & Address", false, Youtube),
  mk("Private Key to Address Converter", "Educational private key → address", "Wallet & Address", false, ArrowRightLeft),
  mk("Public Key Compressor Decompressor", "Compress/decompress secp256k1 keys", "Wallet & Address", false, YinYang),
  mk("Address Balance Log Manual", "Log balances manually", "Wallet & Address", false, FileText),
  mk("Multi-Wallet Organizer", "Organize wallets locally", "Wallet & Address", false, XSquare),
  mk("Cold Wallet Checklist Builder", "Build cold-storage checklists", "Wallet & Address", false, ListChecks),

  // Transaction (10)
  mk("Transaction Hash Decoder", "Decode tx hashes manually", "Transaction", false, Hash),
  mk("Raw Transaction Inspector Hex", "Inspect raw tx hex", "Transaction", false, Search),
  mk("Gas Price Reference Tool", "Gas price reference", "Transaction", false, BookOpen),
  mk("Gas Limit Estimator Reference", "Gas limit reference", "Transaction", false, XOctagon),
  mk("Gas Fee Calculator", "Calculate gas fees manually", "Transaction", true, Calculator),
  mk("Transaction Nonce Tracker", "Track tx nonces locally", "Transaction", false, LineChart),
  mk("EIP-1559 Fee Structure Visualizer", "Visualize EIP-1559 fees", "Transaction", false, Eye),
  mk("Base Fee Plus Priority Fee Explainer", "Explain base + priority fees", "Transaction", false, Lightbulb),
  mk("Transaction Finality Reference", "Finality concepts reference", "Transaction", false, XCircle),
  mk("Transaction Receipt Decoder", "Decode receipts manually", "Transaction", false, Unlock),

  // Smart Contract (15)
  mk("ABI Encoder", "Encode function calls (ABI)", "Smart Contract", false, Lock),
  mk("ABI Decoder", "Decode ABI-encoded data", "Smart Contract", false, Unlock),
  mk("Function Signature Generator", "Generate 4-byte selectors", "Smart Contract", true, Wand2),
  mk("Event Topic Hash Generator", "Generate event topic0 hashes", "Smart Contract", true, Hash),
  mk("Keccak-256 Hash Tool", "Compute keccak-256 hashes", "Smart Contract", true, X),
  mk("EVM Opcode Reference Browser", "Browse EVM opcodes", "Smart Contract", false, BookOpen),
  mk("Solidity Function Selector Database", "Lookup function selectors", "Smart Contract", false, FileCode),
  mk("Contract ABI Formatter", "Pretty-print JSON ABIs", "Smart Contract", false, AlignLeft),
  mk("ABI to TypeScript Type Generator", "Generate TS types from ABI", "Smart Contract", false, Wrench),
  mk("Smart Contract Event Log Decoder", "Decode event logs manually", "Smart Contract", false, FileText),
  mk("ERC-20 Token Spec Reference", "ERC-20 reference", "Smart Contract", false, WrapText),
  mk("ERC-721 Token Spec Reference", "ERC-721 reference", "Smart Contract", false, Workflow),
  mk("ERC-1155 Token Spec Reference", "ERC-1155 reference", "Smart Contract", false, WineOff),
  mk("EIP Reference Browser", "Browse EIPs", "Smart Contract", false, Wine),
  mk("Contract Bytecode Inspector", "Inspect bytecode basics", "Smart Contract", false, Search),

  // Cryptography (10)
  mk("secp256k1 Key Generator", "Generate secp256k1 keys locally", "Cryptography", false, Wand2),
  mk("ECDSA Signature Verifier", "Verify ECDSA signatures", "Cryptography", false, PenTool),
  mk("SHA-256 Blockchain Hash Tool", "Compute SHA-256 hashes", "Cryptography", true, Hash),
  mk("RIPEMD-160 Address Hash Tool", "Compute RIPEMD-160 hashes", "Cryptography", false, Wind),
  mk("Merkle Tree Visualizer", "Visualize merkle trees", "Cryptography", false, Network),
  mk("Merkle Proof Verifier", "Verify merkle proofs", "Cryptography", false, Wrench),
  mk("PBKDF2 Key Derivation Tool", "Derive keys with PBKDF2", "Cryptography", false, Key),
  mk("BIP-39 Wordlist Browser", "Browse BIP-39 words", "Cryptography", false, Globe),
  mk("BIP-32 Path Visualizer", "Visualize BIP-32 paths", "Cryptography", false, Eye),
  mk("BIP-44 Derivation Path Builder", "Build BIP-44 paths", "Cryptography", false, WifiOff),

  // DeFi (10)
  mk("Liquidity Pool Share Calculator", "Calculate LP share %", "DeFi", false, Calculator),
  mk("Impermanent Loss Visualizer", "Visualize impermanent loss", "DeFi", false, Eye),
  mk("APR vs APY Converter DeFi", "Convert APR ↔ APY", "DeFi", true, ArrowRightLeft),
  mk("Yield Farming Strategy Template", "Yield farming planner", "DeFi", false, Sprout),
  mk("LP Token Estimator", "Estimate LP tokens", "DeFi", false, Scale),
  mk("Slippage Impact Tool", "Estimate slippage impact", "DeFi", false, Wrench),
  mk("DeFi Risk Assessment Checklist", "Assess DeFi risk", "DeFi", false, ListChecks),
  mk("Rug Pull Red Flag Checklist", "Spot rug-pull signals", "DeFi", false, Wifi),
  mk("Protocol Comparison Matrix", "Compare protocols", "DeFi", false, Grid3x3),
  mk("DeFi Glossary Reference Browser", "Browse DeFi terms", "DeFi", false, BookOpen),

  // NFT (10)
  mk("NFT Metadata Formatter JSON", "Format NFT metadata JSON", "NFT", false, AlignLeft),
  mk("NFT Attribute Rarity Estimator", "Estimate trait rarity", "NFT", false, Scale),
  mk("NFT Collection Planning Template", "Plan NFT collections", "NFT", false, Image),
  mk("NFT Trait Combination Counter", "Count trait combinations", "NFT", false, WholeWord),
  mk("IPFS URI Formatter", "Format ipfs:// URIs", "NFT", false, WheatOff),
  mk("NFT Royalty Calculator", "Calculate royalties", "NFT", false, Calculator),
  mk("NFT Gas Cost Estimator", "Estimate mint gas costs", "NFT", false, Wheat),
  mk("ERC-721 Metadata Schema Builder", "Build ERC-721 schema", "NFT", false, Webhook),
  mk("NFT Whitelist Organizer", "Organize whitelists", "NFT", false, Webcam),
  mk("NFT Launch Checklist Builder", "Build launch checklist", "NFT", false, ListChecks),

  // Portfolio (10)
  mk("Crypto Portfolio Tracker", "Local CSV portfolio tracker", "Portfolio", false, LineChart),
  mk("Multi-Coin Holdings Log", "Log multi-coin holdings", "Portfolio", false, FileText),
  mk("Acquisition Price Log", "Log acquisition prices", "Portfolio", false, Waves),
  mk("Cost Basis Calculator FIFO LIFO", "FIFO/LIFO cost basis", "Portfolio", false, Calculator),
  mk("Realized vs Unrealized PnL Tracker", "Track realized/unrealized P&L", "Portfolio", false, Watch),
  mk("Staking Rewards Log", "Log staking rewards", "Portfolio", false, Warehouse),
  mk("Airdrop Log", "Log airdrops", "Portfolio", false, Wand2),
  mk("DCA Investment Log", "Log DCA buys", "Portfolio", false, Wand),
  mk("Tax Event Identifier", "Identify taxable events", "Portfolio", false, Receipt),
  mk("Tax Summary Builder", "Build offline tax summaries", "Portfolio", false, Wallpaper),

  // Education (10)
  mk("Blockchain Block Structure Visualizer", "Visualize block structure", "Education", false, Eye),
  mk("Proof of Work Concept Demonstrator", "Demo proof-of-work", "Education", false, Wrench),
  mk("Proof of Stake Concept Explainer", "Visual PoS explainer", "Education", false, Lightbulb),
  mk("Consensus Mechanism Comparison Tool", "Compare consensus mechanisms", "Education", false, GitCompare),
  mk("Hash Rate Reference Tool", "Hash rate reference", "Education", false, Hash),
  mk("Blockchain Fork Explainer", "Visual fork explainer", "Education", false, WalletCards),
  mk("Layer 1 vs Layer 2 Comparison Matrix", "Compare L1/L2", "Education", false, Grid3x3),
  mk("Cross-Chain Bridge Reference", "Bridge reference", "Education", false, BookOpen),
  mk("Gas Optimization Reference", "Gas optimization tips", "Education", false, Wallet2),
  mk("Network Fee Comparison Tool", "Compare network fees", "Education", false, Wallet),

  // Utilities (10)
  mk("Hex to Decimal Converter Ethereum", "Convert hex ↔ decimal", "Utilities", true, ArrowRightLeft),
  mk("Wei to ETH Unit Converter", "Convert wei ↔ ETH", "Utilities", true, Vote),
  mk("Gwei to ETH Converter", "Convert gwei ↔ ETH", "Utilities", true, VolumeX),
  mk("Satoshi to Bitcoin Converter", "Convert sats ↔ BTC", "Utilities", true, Volume2),
  mk("Token Decimal Normalizer", "Normalize token decimals", "Utilities", true, Coins),
  mk("Unix Timestamp to Block Reference", "Timestamp → block reference", "Utilities", false, BookOpen),
  mk("Blockchain Unit Reference Browser", "Browse blockchain units", "Utilities", false, Volume1),
  mk("Token Supply Dilution Estimator", "Estimate supply dilution", "Utilities", false, Scale),
  mk("Block Reward Reference", "Block reward reference", "Utilities", false, Volume),
  mk("Crypto Glossary Browser", "Browse crypto glossary", "Utilities", false, Globe),
];

// Pad to 170 with "coming soon" placeholders so the catalog matches the spec total.
const extraCategories = [
  ["Wallet & Address", "Wallet Activity Snapshot"],
  ["Wallet & Address", "Multi-Sig Setup Reference"],
  ["Wallet & Address", "Wallet Recovery Drill Planner"],
  ["Transaction", "Mempool Concept Explainer"],
  ["Transaction", "Replace-By-Fee (RBF) Reference"],
  ["Transaction", "Transaction Type Identifier"],
  ["Transaction", "Cross-Chain Tx Mapping Tool"],
  ["Smart Contract", "Storage Slot Calculator"],
  ["Smart Contract", "Proxy Pattern Reference"],
  ["Smart Contract", "Reentrancy Pattern Checker"],
  ["Smart Contract", "Constructor Argument Decoder"],
  ["Smart Contract", "Solidity Version Compatibility Matrix"],
  ["Cryptography", "Schnorr Signature Reference"],
  ["Cryptography", "BLS Signature Reference"],
  ["Cryptography", "Zero-Knowledge Proof Concept Tool"],
  ["Cryptography", "Commitment Scheme Visualizer"],
  ["Cryptography", "Bloom Filter Visualizer"],
  ["DeFi", "Stablecoin Comparison Matrix"],
  ["DeFi", "Lending Protocol Calculator"],
  ["DeFi", "Borrow Health Factor Estimator"],
  ["DeFi", "Vault Strategy Planner"],
  ["DeFi", "Perp Funding Rate Reference"],
  ["NFT", "NFT Floor Tracking Log"],
  ["NFT", "Generative Art Trait Planner"],
  ["NFT", "NFT Marketplace Comparison"],
  ["NFT", "Mint Phase Planner"],
  ["NFT", "Metadata Reveal Scheduler"],
  ["Portfolio", "Wallet Cohort Tracker"],
  ["Portfolio", "Stablecoin Allocation Log"],
  ["Portfolio", "Rebalancing Planner"],
  ["Portfolio", "Realized Yield Log"],
  ["Portfolio", "Wash Sale Concept Reference"],
  ["Education", "Mining Difficulty Reference"],
  ["Education", "Bitcoin Halving Reference"],
  ["Education", "Ethereum Upgrade History"],
  ["Education", "Rollup Reference (Optimistic vs ZK)"],
  ["Education", "MEV Concept Explainer"],
  ["Education", "Wallet Security 101"],
  ["Education", "Phishing Pattern Reference"],
  ["Utilities", "Lovelace to ADA Converter"],
  ["Utilities", "Lamport to SOL Converter"],
  ["Utilities", "Plank to DOT Converter"],
  ["Utilities", "Drop to XRP Converter"],
  ["Utilities", "Atom Micro Unit Converter"],
  ["Utilities", "Stroop to XLM Converter"],
  ["Utilities", "Cosmos Unit Reference"],
  ["Utilities", "Address Length Reference Browser"],
  ["Utilities", "BIP Number Lookup"],
  ["Utilities", "Chain ID Reference"],
  ["Utilities", "RPC Method Reference Browser"],
  ["Utilities", "WebSocket Subscription Reference"],
  ["Utilities", "Block Time Reference Tool"],
  ["Utilities", "Network Status Page Reference"],
  ["Utilities", "Genesis Block Reference"],
  ["Utilities", "Address Format Identifier"],
  ["Utilities", "Hash Length Identifier"],
  ["Utilities", "Token Symbol Lookup Sheet"],
  ["Utilities", "Wallet Naming Convention Tool"],
  ["Utilities", "Hardware Wallet Comparison"],
  ["Utilities", "Backup Strategy Checklist"],
  ["Utilities", "Recovery Phrase Storage Planner"],
  ["Utilities", "Passphrase Strength Reference"],
  ["Utilities", "OPSEC Checklist for Crypto"],
  ["Utilities", "Cold Storage Migration Planner"],
  ["Utilities", "Crypto Travel Checklist"],
  ["Utilities", "Crypto Tax Region Reference"],
  ["Utilities", "Block Explorer Comparison"],
  ["Utilities", "Bridge Safety Checklist"],
  ["Utilities", "Exchange Withdrawal Checklist"],
  ["Utilities", "Approval Revocation Reminder"],
];

for (const [category, name] of extraCategories) {
  TOOLS.push(mk(name, "Coming soon", category));
}

export const CATEGORIES = Array.from(new Set(TOOLS.map((t) => (t as any).category)));

export function getTool(slug: string) {
  return TOOLS.find((t) => (t as any).slug === slug);
}

export const SEARCH_REGISTRY: ToolResult[] = TOOLS.map((t) => ({
  name: t.name,
  description: t.desc,
  slug: t.slug,
  href: `/crypto/tool/${t.slug}`,
  category: t.category,
  isBuilt: t.status === "live",
}));
