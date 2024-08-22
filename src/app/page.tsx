"use client"
import { useState } from "react";
import "./styles/home.css";
import { useAppDispatch } from "../lib/hooks";
import { generateSolanaKeypairAndSignMessage } from "./(scripts)/keypair";
import { generateMnemonic } from "bip39";
import { Button, Flex, Image, Space } from "antd";
import GenSeed from "./(workflow)/genSeed";
import RecoverWallets from "./(workflow)/recoverWallets";
import Navbar from "./Component/Navbar";
import heroImg from "../app/assets/Clipped_image_20240822_061749.png";
import { BackgroundBeams } from "./Component/hero";
import "./styles/home.css"

export default function Home() {
  const [publicKey, setPublicKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [mnemonicArray, setMnemonicArray] = useState<string[]>([]);
  const dispatch = useAppDispatch();

  const [pagination, setPagination] = useState<number>(0);
  const [fork, setFork] = useState<number>(0);

  const callbackify = () => {
    let { publicKey, secretKey, isValid } = generateSolanaKeypairAndSignMessage("hello world");
    setIsValid(isValid);
    setPublicKey(publicKey);
    setSecretKey(secretKey);
  };

  const genMnemonic = () => {
    const mnemonic = generateMnemonic();
    const mnemonicWords = mnemonic.split(" ");
    setMnemonicArray(mnemonicWords);
  };

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

      <Navbar />
      <div style={{ position: "relative", zIndex: 1 }}>
        <BackgroundBeams className="absolute inset-0 z-0" />

        <Flex
          justify="space-between"
          align="center"
          style={{
            marginInline: "70px",
            marginTop: "-700px", // Adjusted for better spacing
            position: "relative",
            zIndex: 2, // Ensures Flex stays over BackgroundBeams
          }}
        >
          <Flex
            vertical
            style={{
              color: "white",
            }}
          >
            <h1 style={{ fontSize: "75px", margin: "0" }}>
              Crypto <span style={{ color: "rgb(233, 65, 255)" }}>S*_*curity</span>
            </h1>
            <h1 style={{ fontSize: "75px", margin: "0" }}>made easy</h1>
            <p style={{ marginTop : "20px" }}>
              Keep your coins safe and secure with Orion Wallet and backup solutions,
            </p>
            <p style={{ margin: "0" }}>
              ensuring reliable storage, management, and protection.
            </p>
            <Space style={{ marginTop : "40px"}}>
              <Button  className="nav-btn" style={{ backgroundColor : "white" , color : "black" ,  fontSize : "18px" , width : "220px" , fontWeight : "bolder"}}>Create a new Wallet</Button>
              <Button  className="nav-btn" style={{ borderColor : "orangered" , color : "orangered" , fontSize : "18px" , width : "180px"}}>Import Wallet</Button>
            </Space>
          </Flex>

          <Image
            src={heroImg.src}
            style={{
              width: "700px", // Adjust the width for responsiveness
              height: "auto",
              marginTop: "0px", // Adjusted to align with the text
            }}
          />
        </Flex>
      </div>
    </>
  );
}
