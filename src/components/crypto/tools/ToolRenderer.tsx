import { EthValidator } from "./impl/EthValidator";
import { BtcValidator } from "./impl/BtcValidator";
import { SolValidator } from "./impl/SolValidator";
import { Eip55Checksum } from "./impl/Eip55Checksum";
import { GasFee } from "./impl/GasFee";
import { FunctionSelector } from "./impl/FunctionSelector";
import { EventTopic } from "./impl/EventTopic";
import { Keccak } from "./impl/Keccak";
import { Sha256 } from "./impl/Sha256";
import { AprApy } from "./impl/AprApy";
import { HexDec } from "./impl/HexDec";
import { WeiEth } from "./impl/WeiEth";
import { GweiEth } from "./impl/GweiEth";
import { SatBtc } from "./impl/SatBtc";
import { TokenDecimal } from "./impl/TokenDecimal";

const MAP: Record<string, React.FC> = {
  "ethereum-address-validator": EthValidator,
  "bitcoin-address-validator": BtcValidator,
  "solana-address-validator": SolValidator,
  "address-checksum-tool-eip-55": Eip55Checksum,
  "gas-fee-calculator": GasFee,
  "function-signature-generator": FunctionSelector,
  "event-topic-hash-generator": EventTopic,
  "keccak-256-hash-tool": Keccak,
  "sha-256-blockchain-hash-tool": Sha256,
  "apr-vs-apy-converter-defi": AprApy,
  "hex-to-decimal-converter-ethereum": HexDec,
  "wei-to-eth-unit-converter": WeiEth,
  "gwei-to-eth-converter": GweiEth,
  "satoshi-to-bitcoin-converter": SatBtc,
  "token-decimal-normalizer": TokenDecimal,
};

export function ToolRenderer({ slug }: { slug: string }) {
  const C = MAP[slug];
  if (!C) return <div className="text-muted-foreground">Tool unavailable.</div>;
  return (
    <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <C />
    </div>
  );
}
