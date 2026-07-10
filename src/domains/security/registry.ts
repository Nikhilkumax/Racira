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
  live?: boolean;
}

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

type Raw = [name: string, description: string, live?: boolean];

const groups: Record<ToolCategory, Raw[]> = {
  "Password Tools": [
    ["Password Generator", "Configurable strong password generator", true],
    ["Password Strength Checker", "Score and analyze password strength", true],
    ["Passphrase Generator", "Diceware-style memorable passphrases", true],
    ["Password Entropy Calculator", "Compute Shannon entropy in bits", true],
    ["Password Pattern Analyzer", "Detect common patterns and weaknesses", true],
    ["Common Password Checker", "Check against a list of common passwords", true],
    ["Password Length Estimator", "Estimate crack time by length", true],
    ["PIN Generator", "Random PIN codes of any length", true],
    ["Memorable Password Generator", "Word + symbol blended passwords", true],
    ["Password Comparison Tool", "Compare two passwords side by side", true],
    ["Password Policy Validator", "Validate against a custom policy"],
    ["Random Username Generator", "Generate privacy-friendly usernames"],
    ["Password Aging Calculator", "Estimate password rotation windows"],
    ["Password History Auditor", "Detect reuse across local list"],
    ["Master Password Helper", "Derive site passwords from a master"],
  ],
  "Cryptography": [
    ["AES Encryption/Decryption Tool", "AES-GCM encrypt/decrypt in browser", true],
    ["RSA Key Generator", "Generate RSA keypair in browser", true],
    ["RSA Encrypt/Decrypt Tool", "RSA-OAEP encrypt and decrypt"],
    ["RSA Sign & Verify Tool", "RSA-PSS sign and verify"],
    ["Elliptic Curve Key Generator", "Generate ECDSA keypair in browser", true],
    ["ECDSA Sign & Verify Tool", "Sign and verify with ECDSA"],
    ["PGP Public Key Formatter", "Reformat PGP public key blocks"],
    ["PGP Message Formatter", "Wrap text into PGP armor"],
    ["DES/3DES Educational Tool", "Educational legacy cipher demo"],
    ["ChaCha20 Encryption Tool", "Local ChaCha20 encrypt/decrypt"],
    ["Caesar Cipher Tool", "Classic shift cipher", true],
    ["Vigenère Cipher Tool", "Polyalphabetic key cipher", true],
    ["XOR Cipher Tool", "XOR-based stream cipher", true],
    ["One-Time Pad Generator", "Generate true random pads", true],
    ["Substitution Cipher Tool", "Monoalphabetic substitution"],
    ["Transposition Cipher Tool", "Columnar transposition cipher"],
    ["Rail Fence Cipher Tool", "Zig-zag transposition cipher", true],
    ["Playfair Cipher Tool", "5x5 digraph cipher"],
    ["Base64 Security Encoder", "Base64 with safety options", true],
    ["Crypto Algorithm Comparison", "Compare algorithms reference"],
    ["Diffie-Hellman Visualizer", "Walk through DH key exchange"],
    ["Key Derivation Reference", "KDF reference (PBKDF2/HKDF)"],
    ["Nonce Generator", "Generate cryptographic nonces"],
    ["IV Generator", "Generate initialization vectors"],
    ["Cipher Suite Reference", "TLS cipher suite explorer"],
  ],
  "Hashing Tools": [
    ["MD5 Hash Generator", "Compute MD5 digest (legacy)", true],
    ["SHA-1 Hash Generator", "Compute SHA-1 digest", true],
    ["SHA-256 Hash Generator", "Compute SHA-256 digest", true],
    ["SHA-384 Hash Generator", "Compute SHA-384 digest", true],
    ["SHA-512 Hash Generator", "Compute SHA-512 digest", true],
    ["SHA-3 Hash Generator", "Compute SHA-3 digest"],
    ["RIPEMD-160 Hash Generator", "Compute RIPEMD-160 digest"],
    ["BLAKE2 Hash Generator", "Compute BLAKE2 digest"],
    ["Keccak-256 Hash Generator", "Compute Keccak-256 digest"],
    ["HMAC Generator", "Compute HMAC with SHA family", true],
    ["Argon2 Hash Simulator", "Argon2 parameters reference"],
    ["Bcrypt Hash Generator", "Bcrypt reference & simulator"],
    ["scrypt Hash Simulator", "scrypt parameters reference"],
    ["Hash Comparison Tool", "Constant-time hash compare", true],
    ["File Hash Verifier", "Verify file integrity by hash", true],
    ["CRC32 Calculator", "Compute CRC32 checksum"],
    ["Adler-32 Calculator", "Compute Adler-32 checksum"],
    ["MurmurHash Reference", "Non-cryptographic hash reference"],
    ["xxHash Reference", "Fast non-crypto hash reference"],
    ["Hash Iteration Simulator", "Simulate iterative hashing"],
  ],
  "Encoding & Obfuscation": [
    ["Base64 Encoder/Decoder", "Encode and decode Base64", true],
    ["Base32 Encoder/Decoder", "Encode and decode Base32", true],
    ["Base85 Encoder/Decoder", "Ascii85 encode and decode", true],
    ["Hex Encoder/Decoder", "Encode and decode hexadecimal", true],
    ["ROT13 Encoder", "Apply ROT13 transformation", true],
    ["URL Encode/Decode", "Percent-encode and decode URLs", true],
    ["HTML Entity Encode/Decode", "Encode/decode HTML entities", true],
    ["JavaScript Obfuscator", "Basic JS obfuscation"],
    ["Unicode Obfuscation Tool", "Insert confusables and marks"],
    ["Punycode Encoder/Decoder", "IDN punycode conversion", true],
    ["Binary Encoder/Decoder", "Text ↔ binary representation"],
    ["Octal Encoder/Decoder", "Text ↔ octal"],
    ["Morse Code Translator", "Morse encode and decode"],
    ["Quoted-Printable Encoder", "Encode quoted-printable"],
    ["UUEncode/Decode", "Legacy uuencoding"],
  ],
  "Steganography": [
    ["Text Steganography Tool", "Hide text using whitespace"],
    ["Image Steganography Tool", "LSB image steganography in browser"],
    ["Audio Steganography Reference", "Audio stego concepts reference"],
    ["Steganography Detector", "Basic LSB anomaly detector"],
    ["Zero-Width Character Inserter", "Hide messages in zero-width chars", true],
    ["Invisible Text Encoder", "Encode using invisible Unicode"],
    ["Homoglyph Text Obfuscator", "Swap with look-alike glyphs"],
    ["Watermarked Text Encoder", "Embed invisible watermarks"],
    ["Digital Fingerprint Inserter", "Unique tag per recipient"],
    ["Canary Token Reference Builder", "Build canary token references"],
    ["Whitespace Steganography", "Hide with tabs/spaces"],
    ["Markdown Steganography", "Hide in markdown comments"],
    ["Emoji Steganography", "Hide bits in emoji variations"],
    ["Comment Steganography", "Hide in code comments"],
    ["Metadata Steganography", "Use file metadata fields"],
  ],
  "Network & Web Security": [
    ["SSL Certificate Inspector", "Inspect PEM certificate details"],
    ["CSR Decoder", "Decode certificate signing requests"],
    ["PEM Certificate Decoder", "Parse PEM-encoded data"],
    ["X.509 Certificate Parser", "Parse X.509 fields"],
    ["JWT Decoder", "Decode JWT header & payload", true],
    ["JWT Encoder", "Build a signed JWT (HS256)", true],
    ["JWT Validator", "Validate JWT structure & claims", true],
    ["JWT Signature Verifier", "Verify HS256 signatures", true],
    ["API Key Format Validator", "Validate common API key formats", true],
    ["OAuth 2.0 Flow Reference", "Flow chooser reference"],
    ["CORS Preflight Reference", "CORS header reference"],
    ["DNSSEC Reference", "DNSSEC record explainer"],
    ["TLS Version Reference", "TLS version comparison"],
    ["HSTS Header Builder", "Build HSTS headers"],
    ["Public Key Pinning Reference", "HPKP/Expect-CT reference"],
  ],
  "Privacy Tools": [
    ["Personal Data Audit Checklist", "Track your personal data exposure"],
    ["Data Minimization Checklist", "Reduce collected data"],
    ["Privacy Risk Assessment", "PIA template"],
    ["GDPR Rights Reference", "GDPR data subject rights"],
    ["CCPA Rights Reference", "CCPA consumer rights"],
    ["Privacy Policy Analyzer", "Privacy policy review template"],
    ["Cookie Consent Checklist", "Cookie banner requirements"],
    ["Third-Party Tracker Reference", "Common trackers reference"],
    ["Metadata Cleaner Reference", "Metadata removal checklist"],
    ["Browser Fingerprint Reference", "Fingerprinting vectors reference"],
    ["DNT Header Reference", "Do Not Track header"],
    ["Email Privacy Checker", "Email leak/header reference"],
    ["Photo EXIF Reference", "EXIF privacy fields"],
    ["Telemetry Opt-Out Reference", "Common opt-out steps"],
    ["Privacy Settings Wizard", "Walkthrough common services"],
  ],
  "Security Auditing": [
    ["OWASP Top 10 Reference", "Browse OWASP Top 10 risks"],
    ["Web Security Checklist", "Build a custom checklist"],
    ["Input Validation Reference", "Validation patterns reference"],
    ["XSS Prevention Checklist", "Prevent cross-site scripting"],
    ["SQL Injection Prevention", "SQLi prevention reference"],
    ["CSRF Prevention Reference", "Mitigate CSRF attacks"],
    ["Security Header Checker", "Manual header review tool"],
    ["Content Security Policy Builder", "Build a CSP directive", true],
    ["CSP Validator", "Validate CSP in browser", true],
    ["Subresource Integrity Generator", "Build SRI hashes for scripts", true],
    ["Clickjacking Prevention", "X-Frame-Options reference"],
    ["Mixed Content Checker", "Find mixed content reference"],
    ["SameSite Cookie Reference", "Cookie SameSite explainer"],
    ["Permissions-Policy Builder", "Build Permissions-Policy"],
    ["Referrer-Policy Reference", "Referrer-Policy options"],
  ],
  "Penetration Testing Reference": [
    ["Reconnaissance Checklist", "Recon planning template"],
    ["Vulnerability Assessment", "VA template"],
    ["CVE Reference Browser", "Manual CVE reference"],
    ["CVSS Score Reference", "CVSS scoring reference"],
    ["Threat Modeling Canvas", "STRIDE canvas"],
    ["Attack Surface Mapper", "Manual surface mapping"],
    ["Security Test Case Builder", "Build security test cases"],
    ["Payload Encoding Tool", "Educational payload encoder"],
    ["Security Report Template", "Report template builder"],
    ["Bug Bounty Submission Template", "Structured bounty report"],
    ["Kill Chain Reference", "Cyber kill chain explainer"],
    ["MITRE ATT&CK Reference", "ATT&CK tactics reference"],
    ["OSINT Source Reference", "OSINT sources catalog"],
    ["Red Team Playbook Template", "Red team plan template"],
    ["Blue Team Playbook Template", "Defender playbook template"],
  ],
  "Accessibility & Compliance": [
    ["WCAG 2.1 Compliance Checklist", "WCAG checklist"],
    ["Section 508 Compliance Checklist", "Section 508 reference"],
    ["ISO 27001 Control Reference", "ISO 27001 controls"],
    ["PCI DSS Requirement Reference", "PCI DSS reference"],
    ["SOC 2 Criteria Reference", "SOC 2 trust criteria"],
    ["HIPAA Privacy Rule Reference", "HIPAA privacy rule"],
    ["Incident Response Checklist", "Incident response steps"],
    ["Data Breach Response Template", "Breach notification template"],
    ["Security Policy Template Builder", "Build a security policy"],
    ["Security Awareness Quiz Builder", "Local quiz builder"],
    ["NIST CSF Reference", "NIST CSF functions"],
    ["FedRAMP Reference", "FedRAMP overview"],
    ["GDPR Compliance Checklist", "GDPR compliance steps"],
    ["COPPA Reference", "Children's privacy reference"],
    ["FERPA Reference", "Education records reference"],
  ],
  "Security Utilities": [
    ["UUID Generator", "Generate UUID v4", true],
    ["Random Bytes Generator", "Cryptographically random bytes", true],
    ["Time-based OTP Reference", "TOTP/HOTP reference"],
    ["QR Code Privacy Checker", "QR safety checklist"],
    ["Secure Notes (local)", "Encrypted local-only notes"],
    ["Secure Clipboard Reference", "Clipboard hygiene tips"],
    ["File Shredder Reference", "Secure deletion guidance"],
    ["VPN Comparison Reference", "VPN comparison template"],
    ["Tor Usage Reference", "Tor basics reference"],
    ["E2E Messaging Reference", "Comparison of E2E messengers"],
  ],
};

export const tools: Tool[] = Object.entries(groups).flatMap(([cat, list]) =>
  list.map(([name, description, live]) => ({
    slug: slugify(name),
    name,
    description,
    category: cat as ToolCategory,
    live: !!live,
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
  isBuilt: tool.live ?? false,
}));
