"use client"
import { generateMnemonic, mnemonicToSeedSync } from "bip39";
import { useState } from "react";

export default function Home() {
 const [mnemonicArray, setMnemonicArray] = useState<string[]>([]);

  let genMnemonic = () => {
    const mnemonic = generateMnemonic();
    const mnemonicWords = mnemonic.split(" ");
    
    setMnemonicArray(mnemonicWords);
  }

  return (
    <>
      <button onClick={()=> {
        genMnemonic();
      }}>Generate Mnemonic</button>
      <h2>Seed</h2>
      <ul>
        {mnemonicArray.map((word, index) => (
          <li key={index}>
            {index + 1}. {word}
          </li>
        ))}
      </ul>
    </>
  );
}
