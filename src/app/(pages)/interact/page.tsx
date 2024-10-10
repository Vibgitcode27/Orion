"use client";

import { useEffect, useState } from 'react';
import Navbar from "@/app/Component/Navbar";
import { Card, Flex, Typography } from "antd";
import { Button ,Divider, Avatar , message } from "antd";
import { useAppSelector , useAppDispatch} from '@/lib/hooks';
import { setkeys } from '@/lib/features/keys/keySlice';
import eth from "../../assets/etherium.png"
import sol from "../../assets/solana-sol-icon.png"
import { CopyOutlined, FileExcelOutlined, PlusOutlined } from "@ant-design/icons";
import type { MenuProps } from 'antd';
import { Dropdown, Space } from 'antd';
import { ethers, formatEther, parseEther } from 'ethers';
import "../../styles/home.css";

const {Title , Text}  = Typography;

export default function Interact() {
  const counter = useAppSelector((state) => state.counter.value);
  const dispatch = useAppDispatch();

  const ethPublicKey = useAppSelector(state => state.key.ethPublicKey);
  const ethPrivateKey = useAppSelector(state => state.key.ethPrivateKey);
  const solPublicKey = useAppSelector(state => state.key.solPublicKey);
  const solPrivateKey = useAppSelector(state => state.key.solPrivateKey);

  const [solState , setSolState] = useState<boolean>(false);
  const [ethState , setEthState] = useState<boolean>(true);
  
  const [ethBalance , setEthBalance] = useState<string>("2");

  const mainnet = process.env.NEXT_PUBLIC_INFURA_URL

  function handleClick(){
    dispatch(setkeys({
      solPrivateKey: "hi how are yu",
      solPublicKey: "asd",
      ethPrivateKey: "sadasd",
      ethPublicKey: "asdasds",
    }));
  }

  useEffect(() => {
    fetchEthBalance(ethPublicKey);
  }
  , [ethPublicKey]);

  const fetchEthBalance = async (address: string) => {
    try{
      const provider = new ethers.JsonRpcProvider(mainnet);
      const balance = await provider.getBalance(address);
      const ethValue = formatEther(balance);
      setEthBalance(ethValue);
    }catch(err){
      console.log(err);
      message.error("Error fetching balance");
    }
  };

  // const sendTransaction = async () => {
  //   try {
  //     const provider = new ethers.JsonRpcProvider(mainnet);
  //     const signer = provider.getSigner();
  //     const tx = await signer.sendTransaction({
  //       to: '0x1234567890123456789012345678901234567890',
  //       value: ethers.utils.parseEther('1.0')
  //     });
  //     await tx.wait();
  //     message.success("Transaction sent");
  //   } catch (err) {
  //     console.log(err);
  //     message.error("Error sending transaction");
  //   }
  // }

  const sendTransaction = async (toAddress : string , amount : string) => {
    
    try{
      const provider = new ethers.JsonRpcProvider(mainnet);
      const wallet = new ethers.Wallet(ethPrivateKey , provider);
  
      const transaction = {
        to : toAddress,
        value : parseEther(amount),
        gasPrice : (await provider.getFeeData()).gasPrice,
        gasLimit: 21000,
      }
  
      const txnRespone = await wallet.sendTransaction(transaction);
  
      const reciept = await txnRespone.wait();
      message.success(`Transaction hash: ${reciept}`);
    }catch(err){
      console.log(err);
      message.error("Error sending transaction");
    }
  }


  const truncatePublicKey = (key: string): string => {
    return `${key.slice(0, 6)}....${key.slice(-6)}`;
  };

  const items: MenuProps['items'] = [
  {
    label: <Flex align="center" justify='start'>
                    <Avatar src={sol.src} size={20} style={{ marginRight : "4px"}}/>
                    <Title level={3} style={{ color: "black", margin: 0 , fontSize : "15px" }}>Solana</Title>
                    <Text onClick={() => { navigator.clipboard.writeText(ethPublicKey).then(() => { message.success("Seed Phrase Copied") })}}  style={{ marginLeft : "30px" , fontSize : "10px" }}>{truncatePublicKey(ethPublicKey)} <CopyOutlined/></Text>
                  </Flex>,
    key: '0',
  },
  {
    label: <Flex align="center" justify='start'>
                    <Avatar src={eth.src} size={20} style={{ marginRight : "4px"}}/>
                    <Title level={3} style={{ color: "black", margin: 0 , fontSize : "15px" }}>Ethereum</Title>
                    <Text onClick={() => { navigator.clipboard.writeText(solPublicKey).then(() => { message.success("Seed Phrase Copied") })}} style={{ marginLeft : "12px" , fontSize : "10px" }}>{truncatePublicKey(solPublicKey)} <CopyOutlined/></Text>
                  </Flex>,
    key: '1',
  },
];

 const items2: MenuProps['items'] = [
  {
    label: <Flex align="center" justify='start'>
                    <Avatar src={sol.src} size={20} style={{ marginRight : "4px"}}/>
                    <Title level={3} style={{ color: "black", margin: 0 , fontSize : "15px" }}>Solana</Title>
                    <Text onClick={() => { navigator.clipboard.writeText(ethPublicKey).then(() => { message.success("Seed Phrase Copied") })}}  style={{ marginLeft : "30px" , fontSize : "10px" }}>{truncatePublicKey(ethPublicKey)} <CopyOutlined/></Text>
                  </Flex>,
    key: '0',
  },
  {
    label: <Flex align="center" justify='start'>
                    <Avatar src={eth.src} size={20} style={{ marginRight : "4px"}}/>
                    <Title level={3} style={{ color: "black", margin: 0 , fontSize : "15px" }}>Ethereum</Title>
                    <Text onClick={() => { navigator.clipboard.writeText(solPublicKey).then(() => { message.success("Seed Phrase Copied") })}} style={{ marginLeft : "12px" , fontSize : "10px" }}>{truncatePublicKey(solPublicKey)} <CopyOutlined/></Text>
                  </Flex>,
    key: '1',
  },
];

  return (
    <div>
      <Navbar />
      <div style={{ position: "relative", zIndex: 1 }}>
          <Card style={{ border : "2px solid red"  , width: 1300, margin: 'auto', padding: '20px', borderRadius: '10px', background: '#121322', borderColor: "black" }}>
              <Flex align='center' justify='space-between'>
                <Dropdown menu={{ items }} trigger={['click']} overlayClassName="custom-dropdown">
                  <a onClick={(e) => e.preventDefault()}>
                    <Space>
                      <h3 
                      // onClick={() => { navigator.clipboard.writeText(mnemonic).then(() => { message.success("Seed Phrase Copied") })}} 
                        style={{ margin: "0px", marginLeft: "10px", marginTop: "20px", color: "white" }}>
                        Account <CopyOutlined/>
                      </h3>
                    </Space>
                  </a>
                </Dropdown>
                <Dropdown menu={{ items : items2 }} trigger={['click']} overlayClassName="custom-dropdown">
                  <a onClick={(e) => e.preventDefault()}>
                    <Space>
                      <h3 
                      // onClick={() => { navigator.clipboard.writeText(mnemonic).then(() => { message.success("Seed Phrase Copied") })}} 
                        style={{ margin: "0px", marginLeft: "10px", marginTop: "20px", color: "white" }}>
                        Mainnet
                      </h3>
                    </Space>
                  </a>
                </Dropdown>
              </Flex>
              <Title style={{ textAlign: 'center', marginBottom: '20px', fontSize: "50px", color: "white" }}>Transact</Title>
              <Divider />
              {/* <div style={{ marginTop: "20px" }}>
                <h2 style={{ color: "white" }}>Ethereum Wallet</h2>
                <p style={{ fontSize: "20px", color: "white" }}>Address: {ethPublicKey || 'Not set'}</p>
                <p style={{ fontSize: "16px", color: "white" }}>Private Key: {ethPrivateKey || 'Not set'}</p>
              </div>
              <div style={{ marginTop: "20px" }}>
                <h2 style={{ color: "white" }}>Solana Wallet</h2>
                <p style={{ fontSize: "20px", color: "white" }}>Public Key: {solPublicKey || 'Not set'}</p>
                <p style={{ fontSize: "16px", color: "white" }}>Private Key: {solPrivateKey || 'Not set'}</p>
                <button onClick={handleClick}>Click here</button>
              </div> */}
              <Flex align='center'justify='center'>
                <Flex style={{ width : "80%"}} align='center' justify='space-between'>
                  <Flex onClick={() => { setEthState(false) , setSolState(true)}} align="center" justify='center' style={{ backgroundColor : solState ? "purple" : "transparent" , width : "50%" , height : "50px" , borderRadius : "30px" }}>
                    <Avatar src={sol.src} size={40} style={{ marginRight: "10px" }} />
                    <Title level={3} style={{ color: "white", margin: 0 }}>Solana Wallet</Title>
                  </Flex>
                  <Flex onClick={() => { setEthState(true) , setSolState(false)}} align="center" justify='center' style={{ backgroundColor : ethState ? "purple" : "transparent" , width : "50%" , height : "50px" , borderRadius : "30px" }}>
                    <Avatar src={eth.src} size={40} style={{ marginRight: "10px" }} />
                    <Title level={3} style={{ color: "white", margin: 0 }}>Ethereum Wallet</Title>
                  </Flex>
                </Flex>
                </Flex>
                {ethState ?
                  <Flex justify='center'  align='center'style={{ marginTop :"60px"}}>
                    <Text style={{ fontSize: "50px", color: "white" }}>{ethBalance} ETH</Text>
                  </Flex> :
                  <>

                    <Flex justify='center'  align='center'style={{ marginTop :"60px"}}>
                      <Text style={{ fontSize: "50px", color: "white" }}>2 SOL</Text>
                    </Flex>  
                  </>
                }  
                <Flex justify='center' align='center' gap={60} style={{ marginTop: "20px"}}>
                  <Button style={{ backgroundColor : "#151f38" , color : "white" , borderRadius : "20px" , width : "100px" , height : "80px" , marginTop : "20px" , border :  "gray"}}>Send</Button>
                  <Button style={{ backgroundColor : "#151f38" , color : "white" , borderRadius : "20px" , width : "100px" , height : "80px" , marginTop : "20px" , marginLeft : "20px" , border : "gray"}}>Receive</Button>
                  <Button style={{ backgroundColor : "#151f38" , color : "white" , borderRadius : "20px" , width : "100px" , height : "80px" , marginTop : "20px" , marginLeft : "20px" , border : "gray"}}>Swap</Button>
                </Flex>
            </Card>
      </div>
    </div>
  );
}