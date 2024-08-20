"use client"
import { generateSolanaKeypairAndSignMessage } from "./(scripts)/keypair";
import { generateMnemonic, mnemonicToSeedSync } from "bip39";
import { useState } from "react";

export default function Home() {

  const [publicKey, setPublicKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [mnemonicArray, setMnemonicArray] = useState<string[]>([]);

  let callbackify = () => {
    let { publicKey, secretKey, isValid } = generateSolanaKeypairAndSignMessage("hello world");

    setIsValid(isValid);
    setPublicKey(publicKey);
    setSecretKey(secretKey);
  }

  let genMnemonic = () => {
    const mnemonic = generateMnemonic();
    const mnemonicWords = mnemonic.split(" ");
    
    setMnemonicArray(mnemonicWords);
  }

  return (
    <>
      <button onClick={()=> {
        callbackify();
      }}>Sign a message</button>

      <h2>Public Key:</h2>
      <p>{publicKey}</p>
      <h2>Secret Key</h2>
      <p>{secretKey}</p>
      <h2>Is Valid:</h2>
      <p>{isValid.toString()}</p>    

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
