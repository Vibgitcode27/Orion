"use client";

import { useEffect, useState } from 'react';
import Navbar from "@/app/Component/Navbar";
import { Card, Flex, Typography, Button, Divider, Avatar, message, Modal, Input } from "antd";
import { useAppSelector , useAppDispatch} from '@/lib/hooks';
import eth from "../../assets/etherium.png"
import sol from "../../assets/solana-sol-icon.png"
import { CopyOutlined, SendOutlined } from "@ant-design/icons";
import type { MenuProps } from 'antd';
import { Dropdown, Space } from 'antd';
import { ethers, formatEther, parseEther } from 'ethers';
import * as solanaWeb3 from '@solana/web3.js';
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
  
  const [ethBalance , setEthBalance] = useState<string>("0");
  const [solBalance, setSolBalance] = useState<string>("0");

  const [isTransactionModalVisible, setTransactionModalVisible] = useState(false);
  const [toAddress, setToAddress] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

    // Ethereum Network State
  const [ethNetwork, setEthNetwork] = useState<'mainnet' | 'sepolia'>('mainnet');
  
  // Solana Network State
  const [solNetwork, setSolNetwork] = useState<'mainnet' | 'devnet'>('mainnet');

  const mainnet = process.env.NEXT_PUBLIC_INFURA_URL;
  const sepolia = process.env.NEXT_PUBLIC_SEPOLIA_INFURA_URL;
  const solanaRpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
  const solanaDevRpcUrl = process.env.NEXT_PUBLIC_SOLANA_DEV_RPC_URL;

  useEffect(() => {
    if (ethPublicKey) {
      if (ethNetwork === 'mainnet') {
        fetchEthBalance(ethPublicKey);
      } else {
        fetchSepoliaEthBalance(ethPublicKey);
      }
    }
    if (solPublicKey) {
      if (solNetwork === 'mainnet') {
        fetchSolBalance(solPublicKey);
      } else {
        fetchSolDevnetBalance(solPublicKey);
      }
    }
  }, [ethPublicKey, solPublicKey, ethNetwork, solNetwork]);

  const fetchEthBalance = async (address: string) => {
    console.log(mainnet);

    try {
      const provider = new ethers.JsonRpcProvider(mainnet)
      const balance = await provider.getBalance(address);
      const ethValue = formatEther(balance);
      setEthBalance(parseFloat(ethValue).toFixed(4));
    } catch (err) {
      console.log(err);
      message.error("Error fetching Ethereum balance");
    }
  };

  const fetchSepoliaEthBalance = async (address: string) => {
    console.log(mainnet);

    try {
      const provider = new ethers.JsonRpcProvider(sepolia)
      const balance = await provider.getBalance(address);
      const ethValue = formatEther(balance);
      setEthBalance(parseFloat(ethValue).toFixed(4));
    } catch (err) {
      console.log(err);
      message.error("Error fetching Ethereum balance");
    }
  };

  const fetchSolBalance = async (address: string) => {
    try {
      const connection = new solanaWeb3.Connection(solanaRpcUrl!, 'confirmed');
      const publicKey = new solanaWeb3.PublicKey(solPublicKey);
      console.log("Connection :- " , connection);
      const balance = await connection.getBalance(publicKey);
      console.log("Balance bruh :- " , balance);
      const solValue = balance / solanaWeb3.LAMPORTS_PER_SOL;
      setSolBalance(solValue.toFixed(4));
    } catch (err) {
      console.log(err);
      message.error("Error fetching Solana balance");
    }
  };

    const fetchSolDevnetBalance = async (address: string) => {
    try {
      const connection = new solanaWeb3.Connection(solanaDevRpcUrl!, 'confirmed');
      const publicKey = new solanaWeb3.PublicKey("eVjfeZXFZfNqMJtH2SusYQFFMEmntUHJvMTTNfELmwL");
      console.log("Connection :- " , connection);
      const balance = await connection.getBalance(publicKey);
      console.log("Balance bruh :- " , balance);
      const solValue = balance / solanaWeb3.LAMPORTS_PER_SOL;
      setSolBalance(solValue.toFixed(4));
    } catch (err) {
      console.log(err);
      message.error("Error fetching Solana balance");
    }
  };

  const sendEthTransaction = async () => {
    try {
      const provider = new ethers.JsonRpcProvider(sepolia);
      // const wallet = new ethers.Wallet("65d4db9669b2d2c425e86a22967fcc38f030ef4b128c4ee180d0ec4c9e41a53b", provider);
      const wallet = new ethers.Wallet(ethPrivateKey , provider);    

      const transaction = {
        to: toAddress,
        value: parseEther(amount),
        gasPrice: (await provider.getFeeData()).gasPrice,
        gasLimit: 21000,
      }
  
      const txnResponse = await wallet.sendTransaction(transaction);
      const receipt = await txnResponse.wait();
      
      message.success(`Ethereum Transaction Sent: ${receipt?.getTransaction}`);
      setTransactionModalVisible(false);
      fetchEthBalance(ethPublicKey);
    } catch (err) {
      console.log(err);
      message.error("Error sending Ethereum transaction");
    }
  };

  const sendSolTransaction = async () => {
    try {
      const connection = new solanaWeb3.Connection(solanaRpcUrl!, 'confirmed');
      const fromWallet = solanaWeb3.Keypair.fromSecretKey(
        Buffer.from(JSON.parse(solPrivateKey))
      );
      const toWalletPublicKey = new solanaWeb3.PublicKey(toAddress);

      const transaction = new solanaWeb3.Transaction().add(
        solanaWeb3.SystemProgram.transfer({
          fromPubkey: fromWallet.publicKey,
          toPubkey: toWalletPublicKey,
          lamports: parseFloat(amount) * solanaWeb3.LAMPORTS_PER_SOL
        })
      );

      const signature = await solanaWeb3.sendAndConfirmTransaction(
        connection,
        transaction,
        [fromWallet]
      );

      message.success(`Solana Transaction Sent: ${signature}`);
      setTransactionModalVisible(false);
      fetchSolBalance(solPublicKey);
    } catch (err) {
      console.log(err);
      message.error("Error sending Solana transaction");
    }
  };

  const handleSendTransaction = () => {
    if (ethState) {
      sendEthTransaction();
    } else {
      sendSolTransaction();
    }
  };

  const truncatePublicKey = (key: string): string => {
    return `${key.slice(0, 6)}....${key.slice(-6)}`;
  };


    // Ethereum Network Dropdown Items
  const ethNetworkItems: MenuProps['items'] = [
    {
      label: <div onClick={() => setEthNetwork('mainnet')}>Mainnet</div>,
      key: 'mainnet',
    },
    {
      label: <div onClick={() => setEthNetwork('sepolia')}>Sepolia</div>,
      key: 'sepolia',
    },
  ];

  // Solana Network Dropdown Items
  const solNetworkItems: MenuProps['items'] = [
    {
      label: <div onClick={() => setSolNetwork('mainnet')}>Mainnet</div>,
      key: 'mainnet',
    },
    {
      label: <div onClick={() => setSolNetwork('devnet')}>Devnet</div>,
      key: 'devnet',
    },
  ];

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
                        style={{ margin: "0px", marginLeft: "10px", marginTop: "20px", color: "white" }}>
                        Account <CopyOutlined/>
                      </h3>
                    </Space>
                  </a>
                </Dropdown>
                {ethState ? (
                    <Dropdown 
                      menu={{ items: ethNetworkItems }} 
                      trigger={['click']} 
                      overlayClassName="custom-dropdown"
                    >
                      <a onClick={(e) => e.preventDefault()}>
                        <Space>
                          <h3 
                            style={{ margin: "0px", marginLeft: "10px", marginTop: "20px", color: "white" }}>
                            {ethNetwork.charAt(0).toUpperCase() + ethNetwork.slice(1)}
                          </h3>
                        </Space>
                      </a>
                    </Dropdown>
                  ) : (
                    <Dropdown 
                      menu={{ items: solNetworkItems }} 
                      trigger={['click']} 
                      overlayClassName="custom-dropdown"
                    >
                      <a onClick={(e) => e.preventDefault()}>
                        <Space>
                          <h3 
                            style={{ margin: "0px", marginLeft: "10px", marginTop: "20px", color: "white" }}>
                            {solNetwork.charAt(0).toUpperCase() + solNetwork.slice(1)}
                          </h3>
                        </Space>
                      </a>
                    </Dropdown>
                  )}
              </Flex>
              <Title style={{ textAlign: 'center', marginBottom: '20px', fontSize: "50px", color: "white" }}>Transact</Title>
              <Divider />
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
                      <Text style={{ fontSize: "50px", color: "white" }}>{solBalance} SOL</Text>
                    </Flex>  
                  </>
                }  
                <Flex justify='center' align='center' gap={60} style={{ marginTop: "20px"}}>
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={() => setTransactionModalVisible(true)}
                    style={{ backgroundColor : "#151f38" , color : "white" , borderRadius : "20px" , width : "auto" , height : "80px" , marginTop : "20px" , marginLeft : "20px" , border : "gray"}}
                  >
                    Send Transaction
                  </Button>
                  <Button style={{ backgroundColor : "#151f38" , color : "white" , borderRadius : "20px" , width : "170px" , height : "80px" , marginTop : "20px" , marginLeft : "20px" , border : "gray"}}>Receive</Button>
                  <Button style={{ backgroundColor : "#151f38" , color : "white" , borderRadius : "20px" , width : "170px" , height : "80px" , marginTop : "20px" , marginLeft : "20px" , border : "gray"}}>Swap</Button>
                </Flex>
            </Card>
      </div>
      <Modal
        title="Send Transaction"
        visible={isTransactionModalVisible}
        onCancel={() => setTransactionModalVisible(false)}
        footer={null}
      >
        <div>
          <Input
            placeholder="To Address"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            style={{ marginBottom: '10px' }}
          />
          <Input
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ marginBottom: '20px' }}
          />
          <Button
            type="primary"
            block
            onClick={handleSendTransaction}
            style={{ backgroundColor: 'purple', color: 'white', borderRadius: '30px' }}
          >
            Send
          </Button>
        </div>
      </Modal>
    </div>
  );
}