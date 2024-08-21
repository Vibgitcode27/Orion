import { useEffect, useState } from "react";
import { generateMnemonic, mnemonicToSeedSync } from "bip39";
import { Row, Col } from "antd";
import { Keypair } from "@solana/web3.js";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setSeed } from "@/lib/features/seed/seedSlice";

export default function GenSeed() {
  const dispatch = useAppDispatch();
  
  // State variables
  const [mnemonicArray, setMnemonicArray] = useState<string[]>([]);
  const [seed, setSeedHex] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [secretKey, setSecretKey] = useState<string | null>(null);

  // Selector to get the seed value from Redux store
  const ok = useAppSelector(state => state.seed.value)?.toString("hex");

  // Function to generate mnemonic, seed, and keypair
  const genMnemonic = () => {
    const mnemonic = generateMnemonic();
    const mnemonicWords = mnemonic.split(" ");
    
    setMnemonicArray(mnemonicWords);

    // Convert mnemonic to seed
    const seed = mnemonicToSeedSync(mnemonic);
    dispatch(setSeed(seed));  // Store the seed in Redux store

    // Generate keypair from seed
    const keypair = Keypair.fromSeed(seed.slice(0, 32));
    const publicKey = keypair.publicKey.toBase58();
    const secretKey = Buffer.from(keypair.secretKey).toString("hex");

    // Update state with seed and keypair
    setSeedHex(Buffer.from(seed).toString("hex"));
    setPublicKey(publicKey);
    setSecretKey(secretKey);
  };

  // Run genMnemonic on component mount
  useEffect(() => {
    genMnemonic();
  }, []);

  return (
    <>
      <h2>Mnemonic</h2>
      <Row gutter={[16, 16]}>
        {mnemonicArray.map((word, index) => (
          <Col key={index} span={8}>
            <li>
              {index + 1}. {word}
            </li>
          </Col>
        ))}
      </Row>
      <p><strong>Seed (Hex):</strong> {seed}</p>
      <p><strong>Public Key:</strong> {publicKey}</p>
      <p><strong>Secret Key (Hex):</strong> {secretKey}</p>
      <p><strong>Redux Seed (Hex):</strong> {ok}</p>
    </>
  );
}
