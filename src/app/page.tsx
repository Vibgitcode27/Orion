"use client"
import { useState } from "react";
import "./styles/home.css"
import { useAppSelector , useAppDispatch } from "../lib/hooks";
import { generateSolanaKeypairAndSignMessage } from "./(scripts)/keypair";
import { generateMnemonic, mnemonicToSeedSync } from "bip39";
import { Button, Flex, Pagination } from "antd";
import GenSeed from "./(workflow)/genSeed";
import RecoverWallets from "./(workflow)/recoverWallets";
import Navbar from "./Component/Navbar";
import { BackgroundBeams } from "./Component/hero";

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

  return (
    <>
      {/* <Flex justify="center" align="center">
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
      } */}
      <Navbar/>
      <BackgroundBeams className="absolute inset-0 z-0" />
    </>
  );
}
