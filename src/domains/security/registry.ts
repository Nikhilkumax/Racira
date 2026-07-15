import { Key, Activity, Type, Calculator, Search, CheckSquare, Ruler, Grid3x3, Brain, GitCompare, ShieldCheck, UserCircle, Hourglass, History, KeySquare, Lock, FileDigit, FileSignature, Fingerprint, PenTool, FileText, Mail, BookOpen, Cpu, RotateCw, ListTree, GitCommit, FileCode, Replace, ArrowRightLeft, TrendingUp, Grid, Binary, Columns, Network, Link, Hash, Dices, Layers, FileCode2, Database, Box, Package, LucideHash, LucideSparkles, LucideWandSparkles, Shield, AArrowDown, Sparkles, AArrowUp, ALargeSmall, AlarmCheck, Accessibility, Book, BookA, ActivitySquare, Code2, Barcode, Code, Link2, CodeSquare, AirVent, Airplay, CodeXml, Codepen, Codesandbox, AlarmClock, EyeOff, LucideEyeOff, Ghost, LucideGhost, AlarmClockCheck, FolderCode, AlarmClockMinus, LucideBarcode, AlarmClockOff, BookAudio, AlarmClockPlus, AlarmMinus, AlarmPlus, AlarmSmoke, Album, Globe, LucideCode, LucideCode2, AlertCircle, FileJson, CheckCircle2, BadgeCheck, BookCheck, BookCopy, BookDashed, Globe2, GlobeLock, AlertOctagon, BookKey, BookOpenCheck, BookmarkCheck, LucideShield, LucideShieldAlert, LucideShieldBan, LucideShieldCheck, CalendarCheck, BookDown, BookHeadphones, BookHeart, BookImage, LucideShieldClose, BookLock, BookMarked, LucideShieldEllipsis, ShieldAlert, LucideGlobe, BookMinus, CalendarCheck2, AlertTriangle, Check, AlignCenter, CheckCheck, ScanLine, AlignCenterHorizontal, CheckCircle, BookOpenText, AlignCenterVertical, BookPlus, AlignEndHorizontal, BookTemplate, BookText, AlignEndVertical, AlignHorizontalDistributeCenter, AlignHorizontalDistributeEnd, AlignHorizontalDistributeStart, AlignHorizontalJustifyCenter, AlignHorizontalJustifyEnd, BookType, BookUp, BookUp2, AlignHorizontalJustifyStart, AlignHorizontalSpaceAround, CheckSquare2, BookUser, BookX, Bookmark, LucideShieldHalf, CircleCheck, AlignHorizontalSpaceBetween, AlignJustify, AlignLeft, BookmarkMinus, BookmarkPlus, LucideShieldMinus, BookmarkX, Facebook, WandSparkles, DatabaseZap, LucideBook, LucideShieldOff, AlignRight, LucideBookA, LucideBookAudio, LucideBookCheck, LucideBookCopy, LucideBookDashed } from "lucide-react";
import { ToolResult } from "@/components/CategorySearch";

// Registry of 175 Security & Privacy tools.

export type ToolCategory =
  | "Password Tools"
  | "Cryptography"
  | "Hashing Tools"
  | "Encoding & Obfuscation"
  | "Steganography"
  | "Network & Web Security"
  | "Privacy Tools"
  | "Security Auditing"
  | "Penetration Testing Reference"
  | "Accessibility & Compliance"
  | "Security Utilities";

export interface Tool {
  slug: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: any;
  status: "live" | "soon";
}

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

type Raw = [name: string, description: string, icon: any, live?: boolean];

const groups: Record<ToolCategory, Raw[]> = {
  "Password Tools": [
    ["Password Generator", "Configurable strong password generator", Key, true],
    ["Password Strength Checker", "Score and analyze password strength", Activity, true],
    ["Passphrase Generator", "Diceware-style memorable passphrases", Type, true],
    ["Password Entropy Calculator", "Compute Shannon entropy in bits", Calculator, true],
    ["Password Pattern Analyzer", "Detect common patterns and weaknesses", Search, true],
    ["Common Password Checker", "Check against a list of common passwords", CheckSquare, true],
    ["Password Length Estimator", "Estimate crack time by length", Ruler, true],
    ["PIN Generator", "Random PIN codes of any length", Grid3x3, true],
    ["Memorable Password Generator", "Word + symbol blended passwords", Brain, true],
    ["Password Comparison Tool", "Compare two passwords side by side", GitCompare, true],
    ["Password Policy Validator", "Validate against a custom policy", ShieldCheck],
    ["Random Username Generator", "Generate privacy-friendly usernames", UserCircle],
    ["Password Aging Calculator", "Estimate password rotation windows", Hourglass],
    ["Password History Auditor", "Detect reuse across local list", History],
    ["Master Password Helper", "Derive site passwords from a master", KeySquare],
  ],
  "Cryptography": [
    ["AES Encryption/Decryption Tool", "AES-GCM encrypt/decrypt in browser", Lock, true],
    ["RSA Key Generator", "Generate RSA keypair in browser", Key, true],
    ["RSA Encrypt/Decrypt Tool", "RSA-OAEP encrypt and decrypt", FileDigit],
    ["RSA Sign & Verify Tool", "RSA-PSS sign and verify", FileSignature],
    ["Elliptic Curve Key Generator", "Generate ECDSA keypair in browser", Fingerprint, true],
    ["ECDSA Sign & Verify Tool", "Sign and verify with ECDSA", PenTool],
    ["PGP Public Key Formatter", "Reformat PGP public key blocks", FileText],
    ["PGP Message Formatter", "Wrap text into PGP armor", Mail],
    ["DES/3DES Educational Tool", "Educational legacy cipher demo", BookOpen],
    ["ChaCha20 Encryption Tool", "Local ChaCha20 encrypt/decrypt", Cpu],
    ["Caesar Cipher Tool", "Classic shift cipher", RotateCw, true],
    ["Vigenère Cipher Tool", "Polyalphabetic key cipher", ListTree, true],
    ["XOR Cipher Tool", "XOR-based stream cipher", GitCommit, true],
    ["One-Time Pad Generator", "Generate true random pads", FileCode, true],
    ["Substitution Cipher Tool", "Monoalphabetic substitution", Replace],
    ["Transposition Cipher Tool", "Columnar transposition cipher", ArrowRightLeft],
    ["Rail Fence Cipher Tool", "Zig-zag transposition cipher", TrendingUp, true],
    ["Playfair Cipher Tool", "5x5 digraph cipher", Grid],
    ["Base64 Security Encoder", "Base64 with safety options", Binary, true],
    ["Crypto Algorithm Comparison", "Compare algorithms reference", Columns],
    ["Diffie-Hellman Visualizer", "Walk through DH key exchange", Network],
    ["Key Derivation Reference", "KDF reference (PBKDF2/HKDF)", Link],
    ["Nonce Generator", "Generate cryptographic nonces", Hash],
    ["IV Generator", "Generate initialization vectors", Dices],
    ["Cipher Suite Reference", "TLS cipher suite explorer", Layers],
  ],
  "Hashing Tools": [
    ["MD5 Hash Generator", "Compute MD5 digest (legacy)", Hash, true],
    ["SHA-1 Hash Generator", "Compute SHA-1 digest", FileCode2, true],
    ["SHA-256 Hash Generator", "Compute SHA-256 digest", Database, true],
    ["SHA-384 Hash Generator", "Compute SHA-384 digest", Box, true],
    ["SHA-512 Hash Generator", "Compute SHA-512 digest", Package, true],
    ["SHA-3 Hash Generator", "Compute SHA-3 digest", Hash],
    ["RIPEMD-160 Hash Generator", "Compute RIPEMD-160 digest", LucideHash],
    ["BLAKE2 Hash Generator", "Compute BLAKE2 digest", LucideSparkles],
    ["Keccak-256 Hash Generator", "Compute Keccak-256 digest", LucideWandSparkles],
    ["HMAC Generator", "Compute HMAC with SHA family", Shield, true],
    ["Argon2 Hash Simulator", "Argon2 parameters reference", AArrowDown],
    ["Bcrypt Hash Generator", "Bcrypt reference & simulator", Sparkles],
    ["scrypt Hash Simulator", "scrypt parameters reference", AArrowUp],
    ["Hash Comparison Tool", "Constant-time hash compare", ALargeSmall, true],
    ["File Hash Verifier", "Verify file integrity by hash", AlarmCheck, true],
    ["CRC32 Calculator", "Compute CRC32 checksum", Accessibility],
    ["Adler-32 Calculator", "Compute Adler-32 checksum", Activity],
    ["MurmurHash Reference", "Non-cryptographic hash reference", Book],
    ["xxHash Reference", "Fast non-crypto hash reference", BookA],
    ["Hash Iteration Simulator", "Simulate iterative hashing", ActivitySquare],
  ],
  "Encoding & Obfuscation": [
    ["Base64 Encoder/Decoder", "Encode and decode Base64", Code2, true],
    ["Base32 Encoder/Decoder", "Encode and decode Base32", Barcode, true],
    ["Base85 Encoder/Decoder", "Ascii85 encode and decode", Code, true],
    ["Hex Encoder/Decoder", "Encode and decode hexadecimal", Binary, true],
    ["ROT13 Encoder", "Apply ROT13 transformation", Code2, true],
    ["URL Encode/Decode", "Percent-encode and decode URLs", Link2, true],
    ["HTML Entity Encode/Decode", "Encode/decode HTML entities", CodeSquare, true],
    ["JavaScript Obfuscator", "Basic JS obfuscation", AirVent],
    ["Unicode Obfuscation Tool", "Insert confusables and marks", Airplay],
    ["Punycode Encoder/Decoder", "IDN punycode conversion", CodeXml, true],
    ["Binary Encoder/Decoder", "Text ↔ binary representation", Codepen],
    ["Octal Encoder/Decoder", "Text ↔ octal", Codesandbox],
    ["Morse Code Translator", "Morse encode and decode", AlarmClock],
    ["Quoted-Printable Encoder", "Encode quoted-printable", FileCode],
    ["UUEncode/Decode", "Legacy uuencoding", FileCode2],
  ],
  "Steganography": [
    ["Text Steganography Tool", "Hide text using whitespace", EyeOff],
    ["Image Steganography Tool", "LSB image steganography in browser", LucideEyeOff],
    ["Audio Steganography Reference", "Audio stego concepts reference", Ghost],
    ["Steganography Detector", "Basic LSB anomaly detector", LucideGhost],
    ["Zero-Width Character Inserter", "Hide messages in zero-width chars", AlarmClockCheck, true],
    ["Invisible Text Encoder", "Encode using invisible Unicode", FolderCode],
    ["Homoglyph Text Obfuscator", "Swap with look-alike glyphs", AlarmClockMinus],
    ["Watermarked Text Encoder", "Embed invisible watermarks", LucideBarcode],
    ["Digital Fingerprint Inserter", "Unique tag per recipient", AlarmClockOff],
    ["Canary Token Reference Builder", "Build canary token references", BookAudio],
    ["Whitespace Steganography", "Hide with tabs/spaces", AlarmClockPlus],
    ["Markdown Steganography", "Hide in markdown comments", AlarmMinus],
    ["Emoji Steganography", "Hide bits in emoji variations", AlarmPlus],
    ["Comment Steganography", "Hide in code comments", AlarmSmoke],
    ["Metadata Steganography", "Use file metadata fields", Album],
  ],
  "Network & Web Security": [
    ["SSL Certificate Inspector", "Inspect PEM certificate details", Globe],
    ["CSR Decoder", "Decode certificate signing requests", LucideCode],
    ["PEM Certificate Decoder", "Parse PEM-encoded data", LucideCode2],
    ["X.509 Certificate Parser", "Parse X.509 fields", AlertCircle],
    ["JWT Decoder", "Decode JWT header & payload", FileJson, true],
    ["JWT Encoder", "Build a signed JWT (HS256)", FileCode2, true],
    ["JWT Validator", "Validate JWT structure & claims", CheckCircle2, true],
    ["JWT Signature Verifier", "Verify HS256 signatures", BadgeCheck, true],
    ["API Key Format Validator", "Validate common API key formats", BookCheck, true],
    ["OAuth 2.0 Flow Reference", "Flow chooser reference", BookCopy],
    ["CORS Preflight Reference", "CORS header reference", BookDashed],
    ["DNSSEC Reference", "DNSSEC record explainer", Globe2],
    ["TLS Version Reference", "TLS version comparison", GlobeLock],
    ["HSTS Header Builder", "Build HSTS headers", AlertOctagon],
    ["Public Key Pinning Reference", "HPKP/Expect-CT reference", BookKey],
  ],
  "Privacy Tools": [
    ["Personal Data Audit Checklist", "Track your personal data exposure", BookOpenCheck],
    ["Data Minimization Checklist", "Reduce collected data", BookmarkCheck],
    ["Privacy Risk Assessment", "PIA template", LucideShield],
    ["GDPR Rights Reference", "GDPR data subject rights", LucideShieldAlert],
    ["CCPA Rights Reference", "CCPA consumer rights", LucideShieldBan],
    ["Privacy Policy Analyzer", "Privacy policy review template", LucideShieldCheck],
    ["Cookie Consent Checklist", "Cookie banner requirements", CalendarCheck],
    ["Third-Party Tracker Reference", "Common trackers reference", BookDown],
    ["Metadata Cleaner Reference", "Metadata removal checklist", BookHeadphones],
    ["Browser Fingerprint Reference", "Fingerprinting vectors reference", BookHeart],
    ["DNT Header Reference", "Do Not Track header", BookImage],
    ["Email Privacy Checker", "Email leak/header reference", LucideShieldClose],
    ["Photo EXIF Reference", "EXIF privacy fields", BookLock],
    ["Telemetry Opt-Out Reference", "Common opt-out steps", BookMarked],
    ["Privacy Settings Wizard", "Walkthrough common services", LucideShieldEllipsis],
  ],
  "Security Auditing": [
    ["OWASP Top 10 Reference", "Browse OWASP Top 10 risks", ShieldAlert],
    ["Web Security Checklist", "Build a custom checklist", LucideGlobe],
    ["Input Validation Reference", "Validation patterns reference", BookMinus],
    ["XSS Prevention Checklist", "Prevent cross-site scripting", CalendarCheck2],
    ["SQL Injection Prevention", "SQLi prevention reference", AlertTriangle],
    ["CSRF Prevention Reference", "Mitigate CSRF attacks", BookOpen],
    ["Security Header Checker", "Manual header review tool", Check],
    ["Content Security Policy Builder", "Build a CSP directive", AlignCenter, true],
    ["CSP Validator", "Validate CSP in browser", CheckCheck, true],
    ["Subresource Integrity Generator", "Build SRI hashes for scripts", ScanLine, true],
    ["Clickjacking Prevention", "X-Frame-Options reference", AlignCenterHorizontal],
    ["Mixed Content Checker", "Find mixed content reference", CheckCircle],
    ["SameSite Cookie Reference", "Cookie SameSite explainer", BookOpenText],
    ["Permissions-Policy Builder", "Build Permissions-Policy", AlignCenterVertical],
    ["Referrer-Policy Reference", "Referrer-Policy options", BookPlus],
  ],
  "Penetration Testing Reference": [
    ["Reconnaissance Checklist", "Recon planning template", CheckCircle2],
    ["Vulnerability Assessment", "VA template", AlignEndHorizontal],
    ["CVE Reference Browser", "Manual CVE reference", BookTemplate],
    ["CVSS Score Reference", "CVSS scoring reference", BookText],
    ["Threat Modeling Canvas", "STRIDE canvas", AlignEndVertical],
    ["Attack Surface Mapper", "Manual surface mapping", AlignHorizontalDistributeCenter],
    ["Security Test Case Builder", "Build security test cases", AlignHorizontalDistributeEnd],
    ["Payload Encoding Tool", "Educational payload encoder", AlignHorizontalDistributeStart],
    ["Security Report Template", "Report template builder", AlignHorizontalJustifyCenter],
    ["Bug Bounty Submission Template", "Structured bounty report", AlignHorizontalJustifyEnd],
    ["Kill Chain Reference", "Cyber kill chain explainer", BookType],
    ["MITRE ATT&CK Reference", "ATT&CK tactics reference", BookUp],
    ["OSINT Source Reference", "OSINT sources catalog", BookUp2],
    ["Red Team Playbook Template", "Red team plan template", AlignHorizontalJustifyStart],
    ["Blue Team Playbook Template", "Defender playbook template", AlignHorizontalSpaceAround],
  ],
  "Accessibility & Compliance": [
    ["WCAG 2.1 Compliance Checklist", "WCAG checklist", CheckSquare],
    ["Section 508 Compliance Checklist", "Section 508 reference", CheckSquare2],
    ["ISO 27001 Control Reference", "ISO 27001 controls", BookUser],
    ["PCI DSS Requirement Reference", "PCI DSS reference", BookX],
    ["SOC 2 Criteria Reference", "SOC 2 trust criteria", Bookmark],
    ["HIPAA Privacy Rule Reference", "HIPAA privacy rule", LucideShieldHalf],
    ["Incident Response Checklist", "Incident response steps", CircleCheck],
    ["Data Breach Response Template", "Breach notification template", AlignHorizontalSpaceBetween],
    ["Security Policy Template Builder", "Build a security policy", AlignJustify],
    ["Security Awareness Quiz Builder", "Local quiz builder", AlignLeft],
    ["NIST CSF Reference", "NIST CSF functions", BookmarkMinus],
    ["FedRAMP Reference", "FedRAMP overview", BookmarkPlus],
    ["GDPR Compliance Checklist", "GDPR compliance steps", LucideShieldMinus],
    ["COPPA Reference", "Children's privacy reference", BookmarkX],
    ["FERPA Reference", "Education records reference", Facebook],
  ],
  "Security Utilities": [
    ["UUID Generator", "Generate UUID v4", WandSparkles, true],
    ["Random Bytes Generator", "Cryptographically random bytes", DatabaseZap, true],
    ["Time-based OTP Reference", "TOTP/HOTP reference", LucideBook],
    ["QR Code Privacy Checker", "QR safety checklist", LucideShieldOff],
    ["Secure Notes (local)", "Encrypted local-only notes", AlignRight],
    ["Secure Clipboard Reference", "Clipboard hygiene tips", LucideBookA],
    ["File Shredder Reference", "Secure deletion guidance", LucideBookAudio],
    ["VPN Comparison Reference", "VPN comparison template", LucideBookCheck],
    ["Tor Usage Reference", "Tor basics reference", LucideBookCopy],
    ["E2E Messaging Reference", "Comparison of E2E messengers", LucideBookDashed],
  ],
};

export const tools: Tool[] = Object.entries(groups).flatMap(([cat, list]) =>
  list.map(([name, description, icon, live]) => ({
    slug: slugify(name),
    name,
    description,
    category: cat as ToolCategory,
    icon,
    status: live ? "live" : "soon",
  })),
);

export const categories: ToolCategory[] = Object.keys(groups) as ToolCategory[];

export const totalTools = tools.length;

export const getTool = (slug: string) => tools.find((t) => (t as any).slug === slug);
export const toolsByCategory = (cat: ToolCategory) =>
  tools.filter((t) => (t as any).category === cat);

export const SEARCH_REGISTRY: ToolResult[] = tools.map((tool) => ({
  name: tool.name,
  description: tool.description,
  slug: tool.slug,
  href: `/security/tool/${tool.slug}`,
  category: tool.category,
  isBuilt: tool.status === "live",
}));
