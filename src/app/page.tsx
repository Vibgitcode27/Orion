"use client"
import { useState } from "react";
import { useAppSelector , useAppDispatch } from "../lib/hooks";
import { generateSolanaKeypairAndSignMessage } from "./(scripts)/keypair";
import { generateMnemonic, mnemonicToSeedSync } from "bip39";
import { Button, Flex, Pagination } from "antd";
import GenSeed from "./(workflow)/genSeed";
import RecoverWallets from "./(workflow)/recoverWallets";

export default function Home() {

  const [publicKey, setPublicKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [mnemonicArray, setMnemonicArray] = useState<string[]>([]);
  const dispatch = useAppDispatch();

  const [pagination , setPagination] = useState<number>(0);
  const [fork , setFork] = useState<number>(0);


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

  const counter = useAppSelector(state => state.counter.value);

  return (
    <>
      {/* <button onClick={()=> {
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
      
      <button onClick={() => { dispatch(increment()) }}>Increment</button>
      <button onClick={() => { dispatch(decrement()) }}>Decrement</button>
      <p>{counter}</p> */}

      <Flex justify="center" align="center">
        {pagination !== 0 && <Button onClick={() => { setPagination(pagination - 1)}}>Back</Button>}
      </Flex>

      {
        pagination === 0 && (
          <Flex align="center" justify="center" vertical style={{ marginTop : "100px"}}>
            <Button onClick={() => {setPagination(pagination + 1)}} style={{ marginBottom : "20px"}}>Create a new Wallet</Button>
            <Button onClick={() => {setFork(fork + 1) , setPagination(pagination !== 0 ? pagination - 1 : 0)}}>Import Wallet</Button>
          </Flex>
        )
      }

      {
        pagination === 1 && (
          <GenSeed />
        )
      }

      {
        fork === 1 && (
          <RecoverWallets/>
        )
      }
    </>
  );
}
