"use client";
import { generateMnemonic, mnemonicToSeedSync } from "bip39";
import { useState } from "react";
import { Keypair } from "@solana/web3.js";

export default function Home() {
  const [mnemonicArray, setMnemonicArray] = useState<string[]>([]);
  const [seed, setSeed] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [secretKey, setSecretKey] = useState<string | null>(null);

  const genMnemonic = () => {
    const mnemonic = generateMnemonic();
    const mnemonicWords = mnemonic.split(" ");
    
    setMnemonicArray(mnemonicWords);

    // Convert mnemonic to seed
    const seed = mnemonicToSeedSync(mnemonic);

    // Generate key pair from seed
    const keypair = Keypair.fromSeed(seed.slice(0, 32));
    const publicKey = keypair.publicKey.toBase58();
    const secretKey = Buffer.from(keypair.secretKey).toString("hex");

    // Update state with seed and key pair
    setSeed(Buffer.from(seed).toString("hex"));
    setPublicKey(publicKey);
    setSecretKey(secretKey);
  };

  return (
    <>
      <button onClick={genMnemonic}>Generate Mnemonic</button>
      <h2>Mnemonic</h2>
      <ul>
        {mnemonicArray.map((word, index) => (
          <li key={index}>
            {index + 1}. {word}
          </li>
        ))}
      </ul>
      {seed && (
        <>
          <h2>Seed</h2>
          <p>{seed}</p>
        </>
      )}
      {publicKey && (
        <>
          <h2>Public Key</h2>
          <p>{publicKey}</p>
        </>
      )}
      {secretKey && (
        <>
          <h2>Secret Key</h2>
          <p>{secretKey}</p>
        </>
      )}
    </>
  );
}
