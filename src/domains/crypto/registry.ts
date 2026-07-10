import { ToolResult } from "@/components/CategorySearch";

export type Tool = {
  slug: string;
  name: string;
  desc: string;
  category: string;
  implemented?: boolean;
};

const mk = (name: string, desc: string, category: string, implemented = false): Tool => ({
  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
  name,
  desc,
  category,
  implemented,
});

export const TOOLS: Tool[] = [
  // Wallet & Address (15)
  mk("Ethereum Address Validator", "Validate ETH addresses & checksums", "Wallet & Address", true),
  mk("Bitcoin Address Validator", "Validate BTC addresses (P2PKH, P2SH, Bech32)", "Wallet & Address", true),
  mk("Solana Address Validator", "Validate Solana Base58 addresses", "Wallet & Address", true),
  mk("Multi-Chain Address Formatter", "Format addresses across chains", "Wallet & Address"),
  mk("Address Checksum Tool EIP-55", "Apply EIP-55 mixed-case checksum", "Wallet & Address", true),
  mk("Wallet Address QR Code Generator", "Generate QR codes for addresses", "Wallet & Address"),
  mk("Vanity Address Pattern Checker", "Check vanity address patterns locally", "Wallet & Address"),
  mk("HD Wallet Path BIP-44 Explorer", "Explore BIP-44 derivation paths", "Wallet & Address"),
  mk("Mnemonic Seed Phrase Word List Reference", "Browse BIP-39 wordlist", "Wallet & Address"),
  mk("Seed Phrase Validator BIP-39", "Validate BIP-39 mnemonics", "Wallet & Address"),
  mk("Private Key to Address Converter", "Educational private key → address", "Wallet & Address"),
  mk("Public Key Compressor Decompressor", "Compress/decompress secp256k1 keys", "Wallet & Address"),
  mk("Address Balance Log Manual", "Log balances manually", "Wallet & Address"),
  mk("Multi-Wallet Organizer", "Organize wallets locally", "Wallet & Address"),
  mk("Cold Wallet Checklist Builder", "Build cold-storage checklists", "Wallet & Address"),

  // Transaction (10)
  mk("Transaction Hash Decoder", "Decode tx hashes manually", "Transaction"),
  mk("Raw Transaction Inspector Hex", "Inspect raw tx hex", "Transaction"),
  mk("Gas Price Reference Tool", "Gas price reference", "Transaction"),
  mk("Gas Limit Estimator Reference", "Gas limit reference", "Transaction"),
  mk("Gas Fee Calculator", "Calculate gas fees manually", "Transaction", true),
  mk("Transaction Nonce Tracker", "Track tx nonces locally", "Transaction"),
  mk("EIP-1559 Fee Structure Visualizer", "Visualize EIP-1559 fees", "Transaction"),
  mk("Base Fee Plus Priority Fee Explainer", "Explain base + priority fees", "Transaction"),
  mk("Transaction Finality Reference", "Finality concepts reference", "Transaction"),
  mk("Transaction Receipt Decoder", "Decode receipts manually", "Transaction"),

  // Smart Contract (15)
  mk("ABI Encoder", "Encode function calls (ABI)", "Smart Contract"),
  mk("ABI Decoder", "Decode ABI-encoded data", "Smart Contract"),
  mk("Function Signature Generator", "Generate 4-byte selectors", "Smart Contract", true),
  mk("Event Topic Hash Generator", "Generate event topic0 hashes", "Smart Contract", true),
  mk("Keccak-256 Hash Tool", "Compute keccak-256 hashes", "Smart Contract", true),
  mk("EVM Opcode Reference Browser", "Browse EVM opcodes", "Smart Contract"),
  mk("Solidity Function Selector Database", "Lookup function selectors", "Smart Contract"),
  mk("Contract ABI Formatter", "Pretty-print JSON ABIs", "Smart Contract"),
  mk("ABI to TypeScript Type Generator", "Generate TS types from ABI", "Smart Contract"),
  mk("Smart Contract Event Log Decoder", "Decode event logs manually", "Smart Contract"),
  mk("ERC-20 Token Spec Reference", "ERC-20 reference", "Smart Contract"),
  mk("ERC-721 Token Spec Reference", "ERC-721 reference", "Smart Contract"),
  mk("ERC-1155 Token Spec Reference", "ERC-1155 reference", "Smart Contract"),
  mk("EIP Reference Browser", "Browse EIPs", "Smart Contract"),
  mk("Contract Bytecode Inspector", "Inspect bytecode basics", "Smart Contract"),

  // Cryptography (10)
  mk("secp256k1 Key Generator", "Generate secp256k1 keys locally", "Cryptography"),
  mk("ECDSA Signature Verifier", "Verify ECDSA signatures", "Cryptography"),
  mk("SHA-256 Blockchain Hash Tool", "Compute SHA-256 hashes", "Cryptography", true),
  mk("RIPEMD-160 Address Hash Tool", "Compute RIPEMD-160 hashes", "Cryptography"),
  mk("Merkle Tree Visualizer", "Visualize merkle trees", "Cryptography"),
  mk("Merkle Proof Verifier", "Verify merkle proofs", "Cryptography"),
  mk("PBKDF2 Key Derivation Tool", "Derive keys with PBKDF2", "Cryptography"),
  mk("BIP-39 Wordlist Browser", "Browse BIP-39 words", "Cryptography"),
  mk("BIP-32 Path Visualizer", "Visualize BIP-32 paths", "Cryptography"),
  mk("BIP-44 Derivation Path Builder", "Build BIP-44 paths", "Cryptography"),

  // DeFi (10)
  mk("Liquidity Pool Share Calculator", "Calculate LP share %", "DeFi"),
  mk("Impermanent Loss Visualizer", "Visualize impermanent loss", "DeFi"),
  mk("APR vs APY Converter DeFi", "Convert APR ↔ APY", "DeFi", true),
  mk("Yield Farming Strategy Template", "Yield farming planner", "DeFi"),
  mk("LP Token Estimator", "Estimate LP tokens", "DeFi"),
  mk("Slippage Impact Tool", "Estimate slippage impact", "DeFi"),
  mk("DeFi Risk Assessment Checklist", "Assess DeFi risk", "DeFi"),
  mk("Rug Pull Red Flag Checklist", "Spot rug-pull signals", "DeFi"),
  mk("Protocol Comparison Matrix", "Compare protocols", "DeFi"),
  mk("DeFi Glossary Reference Browser", "Browse DeFi terms", "DeFi"),

  // NFT (10)
  mk("NFT Metadata Formatter JSON", "Format NFT metadata JSON", "NFT"),
  mk("NFT Attribute Rarity Estimator", "Estimate trait rarity", "NFT"),
  mk("NFT Collection Planning Template", "Plan NFT collections", "NFT"),
  mk("NFT Trait Combination Counter", "Count trait combinations", "NFT"),
  mk("IPFS URI Formatter", "Format ipfs:// URIs", "NFT"),
  mk("NFT Royalty Calculator", "Calculate royalties", "NFT"),
  mk("NFT Gas Cost Estimator", "Estimate mint gas costs", "NFT"),
  mk("ERC-721 Metadata Schema Builder", "Build ERC-721 schema", "NFT"),
  mk("NFT Whitelist Organizer", "Organize whitelists", "NFT"),
  mk("NFT Launch Checklist Builder", "Build launch checklist", "NFT"),

  // Portfolio (10)
  mk("Crypto Portfolio Tracker", "Local CSV portfolio tracker", "Portfolio"),
  mk("Multi-Coin Holdings Log", "Log multi-coin holdings", "Portfolio"),
  mk("Acquisition Price Log", "Log acquisition prices", "Portfolio"),
  mk("Cost Basis Calculator FIFO LIFO", "FIFO/LIFO cost basis", "Portfolio"),
  mk("Realized vs Unrealized PnL Tracker", "Track realized/unrealized P&L", "Portfolio"),
  mk("Staking Rewards Log", "Log staking rewards", "Portfolio"),
  mk("Airdrop Log", "Log airdrops", "Portfolio"),
  mk("DCA Investment Log", "Log DCA buys", "Portfolio"),
  mk("Tax Event Identifier", "Identify taxable events", "Portfolio"),
  mk("Tax Summary Builder", "Build offline tax summaries", "Portfolio"),

  // Education (10)
  mk("Blockchain Block Structure Visualizer", "Visualize block structure", "Education"),
  mk("Proof of Work Concept Demonstrator", "Demo proof-of-work", "Education"),
  mk("Proof of Stake Concept Explainer", "Visual PoS explainer", "Education"),
  mk("Consensus Mechanism Comparison Tool", "Compare consensus mechanisms", "Education"),
  mk("Hash Rate Reference Tool", "Hash rate reference", "Education"),
  mk("Blockchain Fork Explainer", "Visual fork explainer", "Education"),
  mk("Layer 1 vs Layer 2 Comparison Matrix", "Compare L1/L2", "Education"),
  mk("Cross-Chain Bridge Reference", "Bridge reference", "Education"),
  mk("Gas Optimization Reference", "Gas optimization tips", "Education"),
  mk("Network Fee Comparison Tool", "Compare network fees", "Education"),

  // Utilities (10)
  mk("Hex to Decimal Converter Ethereum", "Convert hex ↔ decimal", "Utilities", true),
  mk("Wei to ETH Unit Converter", "Convert wei ↔ ETH", "Utilities", true),
  mk("Gwei to ETH Converter", "Convert gwei ↔ ETH", "Utilities", true),
  mk("Satoshi to Bitcoin Converter", "Convert sats ↔ BTC", "Utilities", true),
  mk("Token Decimal Normalizer", "Normalize token decimals", "Utilities", true),
  mk("Unix Timestamp to Block Reference", "Timestamp → block reference", "Utilities"),
  mk("Blockchain Unit Reference Browser", "Browse blockchain units", "Utilities"),
  mk("Token Supply Dilution Estimator", "Estimate supply dilution", "Utilities"),
  mk("Block Reward Reference", "Block reward reference", "Utilities"),
  mk("Crypto Glossary Browser", "Browse crypto glossary", "Utilities"),
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
  isBuilt: t.implemented === true,
}));
