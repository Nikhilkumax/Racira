import type { ReactElement } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Construction, Shield } from "lucide-react";
import { Layout } from "@/components/security/Layout";
import { getTool, toolsByCategory, tools } from "@/lib/security/tools";
import { Button } from "@/components/ui/button";
import * as T from "@/lib/security/tool-impls";
import type { Metadata } from "next";

const IMPLS: Record<string, () => ReactElement> = {
  "password-generator": T.PasswordGenerator,
  "password-strength-checker": T.PasswordStrengthChecker,
  "passphrase-generator": T.PassphraseGenerator,
  "password-entropy-calculator": T.PasswordEntropyCalculator,
  "password-pattern-analyzer": T.PasswordPatternAnalyzer,
  "common-password-checker": T.CommonPasswordChecker,
  "password-length-estimator": T.PasswordLengthEstimator,
  "pin-generator": T.PINGenerator,
  "memorable-password-generator": T.MemorablePasswordGenerator,
  "password-comparison-tool": T.PasswordComparisonTool,
  "aes-encryption-decryption-tool": T.AESTool,
  "rsa-key-generator": T.RSAKeyGen,
  "elliptic-curve-key-generator": T.ECKeyGen,
  "caesar-cipher-tool": T.CaesarCipher,
  "vigen-re-cipher-tool": T.VigenereCipher,
  "xor-cipher-tool": T.XORCipher,
  "one-time-pad-generator": T.OneTimePadGenerator,
  "rail-fence-cipher-tool": T.RailFenceCipher,
  "base64-security-encoder": T.Base64Tool,
  "md5-hash-generator": T.MD5Tool,
  "sha-1-hash-generator": T.SHA1,
  "sha-256-hash-generator": T.SHA256,
  "sha-384-hash-generator": T.SHA384,
  "sha-512-hash-generator": T.SHA512,
  "hmac-generator": T.HMACTool,
  "hash-comparison-tool": T.HashCompare,
  "file-hash-verifier": T.FileHashVerifier,
  "base64-encoder-decoder": T.Base64Tool,
  "base32-encoder-decoder": T.Base32Tool,
  "base85-encoder-decoder": T.Base85Tool,
  "hex-encoder-decoder": T.HexTool,
  "rot13-encoder": T.ROT13Tool,
  "url-encode-decode": T.URLTool,
  "html-entity-encode-decode": T.HTMLEntityTool,
  "punycode-encoder-decoder": T.PunycodeTool,
  "zero-width-character-inserter": T.ZeroWidthInserter,
  "jwt-decoder": T.JWTDecoder,
  "jwt-encoder": T.JWTEncoder,
  "jwt-validator": T.JWTValidator,
  "jwt-signature-verifier": T.JWTVerifier,
  "api-key-format-validator": T.APIKeyValidator,
  "content-security-policy-builder": T.CSPBuilder,
  "csp-validator": T.CSPValidator,
  "subresource-integrity-generator": T.SRIGenerator,
  "uuid-generator": T.UUIDGen,
  "random-bytes-generator": T.RandomBytes,
};

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await params;
  const tool = getTool(p.slug);
  if (!tool) return {};
  return {
    title: `${tool.name} — Racira Security`,
    description: tool.description,
    openGraph: {
      title: `${tool.name} — Racira Security`,
      description: tool.description,
    },
  };
}

export function generateStaticParams() {
  return tools.map((t) => ({ slug: t.slug }));
}

export default async function ToolPage({ params }: Props) {
  const p = await params;
  const tool = getTool(p.slug);
  if (!tool) notFound();

  const Impl = IMPLS[tool.slug];
  const related = toolsByCategory(tool.category).filter((t) => t.slug !== tool.slug).slice(0, 6);
  
  return (
    <Layout>
      <div className="mx-auto max-w-4xl px-4 py-10">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> All tools
        </Link>
        <div className="mb-2 text-xs font-semibold tracking-wider text-primary uppercase">{tool.category}</div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{tool.name}</h1>
        <p className="mt-2 text-muted-foreground">{tool.description}</p>

        <div className="mt-8">
          {Impl ? <Impl /> : <ComingSoon name={tool.name} />}
        </div>

        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-3">More in {tool.category}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {related.map((t) => (
                <Link key={t.slug} href={`/tool/${t.slug}`} className="rounded-lg border border-border bg-card p-3 hover:border-primary/40">
                  <div className="font-medium text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-1">{t.description}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

function ComingSoon({ name }: { name: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-secondary text-primary">
        <Construction className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{name} is coming soon</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
        We're polishing this tool. In the meantime, explore the other 100+ live tools running entirely in your browser.
      </p>
      <Link href="/"><Button variant="outline" className="mt-6"><Shield className="h-4 w-4" /> Browse all tools</Button></Link>
    </div>
  );
}
