"use client";

import { useEffect } from 'react';
import Navbar from "@/app/Component/Navbar";
import { BackgroundBeams } from "@/app/Component/heroBeams";
// import { useAppSelector } from "@/lib/hooks";
import { Card, Flex, Typography } from "antd";
import { useAppSelector , useAppDispatch} from '@/lib/hooks';
import { increment } from '@/lib/features/counter/counterSlice';
import { setkeys } from '@/lib/features/keys/keySlice';

export default function Interact() {
  // const solPublicKey = useAppSelector((state) => state.key.solPublicKey);
  // const solPrivateKey = useAppSelector((state) => state.key.solPrivateKey);
  // const ethPublicKey = useAppSelector((state) => state.key.ethPublicKey);
  // const ethPrivateKey = useAppSelector((state) => state.key.ethPrivateKey);

  // useEffect(() => {
  //   console.log('Interact component mounted with state:', {
  //     solPublicKey,
  //     solPrivateKey,
  //     ethPublicKey,
  //     ethPrivateKey,
  //   });
  // }, []);

  const counter = useAppSelector((state) => state.counter.value);
  const dispatch = useAppDispatch();

  const ethPublicKey = useAppSelector(state => state.key.ethPublicKey);
  const ethPrivateKey = useAppSelector(state => state.key.ethPrivateKey);
  const solPublicKey = useAppSelector(state => state.key.solPublicKey);
  const solPrivateKey = useAppSelector(state => state.key.solPrivateKey);


  function handleClick(){
    dispatch(setkeys({
      solPrivateKey: "hi how are yu",
      solPublicKey: "asd",
      ethPrivateKey: "sadasd",
      ethPublicKey: "asdasds",
    }));

  }

  return (
    <div>
      <Navbar />
      <div style={{ position: "relative", zIndex: 1 }}>
        <BackgroundBeams className="absolute inset-0 z-0" />
        <Card style={{ backgroundColor: "#c70300", marginBottom: "20px", padding: "20px", border: "none", borderRadius: "20px" }}>
          <Flex align="center">
            <Typography.Title level={3} style={{ color: "white", margin: 0 }}>Wallet Details</Typography.Title>
          </Flex>
          <div style={{ marginTop: "20px" }}>
            <h2 style={{ color: "white" }}>Ethereum Wallet</h2>
            <p style={{ fontSize: "20px", color: "white" }}>Address: {ethPublicKey || 'Not set'}</p>
            <p style={{ fontSize: "16px", color: "white" }}>Private Key: {ethPrivateKey || 'Not set'}</p>
          </div>
          <div style={{ marginTop: "20px" }}>
            <h2 style={{ color: "white" }}>Solana Wallet</h2>
            <p style={{ fontSize: "20px", color: "white" }}>Public Key: {solPublicKey || 'Not set'}</p>
            <p style={{ fontSize: "16px", color: "white" }}>Private Key: {solPrivateKey || 'Not set'}</p>
            <button onClick={handleClick}>Click here</button>
          </div>
        </Card>
      </div>
    </div>
  );
}