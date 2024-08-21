import { useEffect, useState } from "react";
import { generateMnemonic, mnemonicToSeedSync } from "bip39";
import { Row, Col } from "antd";
import { Keypair } from "@solana/web3.js";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setSeed } from "@/lib/features/seed/seedSlice";
import { BIP32Factory } from "bip32";
import ecc from '@bitcoinerlab/secp256k1';
import { ethers } from 'ethers';

export default function GenSeed() {
  const dispatch = useAppDispatch();
  
  // State variables
  const [mnemonicArray, setMnemonicArray] = useState<string[]>([]);
  const [seed, setSeedHex] = useState<string | null>(null);
  const [solanaPublicKey, setSolanaPublicKey] = useState<string | null>(null);
  const [solanaSecretKey, setSolanaSecretKey] = useState<string | null>(null);
  const [ethereumPublicKey, setEthereumPublicKey] = useState<string | null>(null);
  const [ethereumSecretKey, setEthereumSecretKey] = useState<string | null>(null);

  // Selector to get the seed value from Redux store
  const reduxSeed = useAppSelector(state => state.seed.value)?.toString("hex");

  const bip32 = BIP32Factory(ecc);

  // Function to generate mnemonic, seed, and keypairs
  const genMnemonic = () => {
    const mnemonic = generateMnemonic();
    const mnemonicWords = mnemonic.split(" ");
    
    setMnemonicArray(mnemonicWords);

    // Convert mnemonic to seed
    const seed = mnemonicToSeedSync(mnemonic);
    dispatch(setSeed(seed));  // Store the seed in Redux store

    // Derive Solana and Ethereum/Polygon keys
    const solanaPath = "m/44'/501'/0'/0'";
    const solanaChild = bip32.fromSeed(seed).derivePath(solanaPath);
    const solanaKeypair = Keypair.fromSeed(solanaChild.privateKey.slice(0, 32));

    const ethereumPath = "m/44'/60'/0'/0/0";
    const ethereumChild = bip32.fromSeed(seed).derivePath(ethereumPath);
    const ethereumPublicKey = ethers.hexlify(ethereumChild.publicKey).slice(2);
    const ethereumSecretKey = ethers.hexlify(ethereumChild.privateKey);

    // Update state with seed and keypairs
    setSeedHex(Buffer.from(seed).toString("hex"));
    setSolanaPublicKey(solanaKeypair.publicKey.toBase58());
    setSolanaSecretKey(Buffer.from(solanaKeypair.secretKey).toString("hex"));
    setEthereumPublicKey(ethereumPublicKey);
    setEthereumSecretKey(ethereumSecretKey);
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
      {mnemonicArray.map((word) => {
        return (
          <span>{word + " "}</span>
        );
      })}
      <p><strong>Seed (Hex):</strong> {seed}</p>
      <p><strong>Solana Public Key:</strong> {solanaPublicKey}</p>
      <p><strong>Solana Secret Key (Hex):</strong> {solanaSecretKey}</p>
      <p><strong>Ethereum Public Key:</strong> {ethereumPublicKey}</p>
      <p><strong>Ethereum Secret Key (Hex):</strong> {ethereumSecretKey}</p>
      <p><strong>Redux Seed (Hex):</strong> {reduxSeed}</p>
    </>
  );
}

// 4meWxVc6H1EwSiv93WoHYNrCweFMXDQWmXJU4t2Pjmqm