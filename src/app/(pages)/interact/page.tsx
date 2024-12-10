"use client";

import { useEffect, useState } from 'react';
import Navbar from "@/app/Component/Navbar";
import { Card, Flex, Typography, Button, Divider, Avatar, message, Modal, Input , QRCode , Select } from "antd";
import { useAppSelector , useAppDispatch} from '@/lib/hooks';
import eth from "../../assets/ethereum-6903901_1280.png";
import sol from "../../assets/solana-sol-icon.png"
import logo from "../../assets/profile-removebg-preview.png"
import { CopyOutlined, RedoOutlined, SendOutlined , SwapOutlined } from "@ant-design/icons";
import type { MenuProps } from 'antd';
import { Dropdown, Space } from 'antd';
import { ethers, formatEther, parseEther } from 'ethers';
import * as solanaWeb3 from '@solana/web3.js';
import "../../styles/home.css";

const {Title , Text}  = Typography;
const { Option } = Select;
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
  const [isRecieveModalVisible, setRecieveModalVisible] = useState(false);
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
  const testEthPublicKey = process.env.TEST_ETH_PUBLIC_KEY;
  const testEthPrivateKey = process.env.TEST_ETH_PRIVATE_KEY;

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
    console.log(sepolia);
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

  const handleSendTransaction = async () => {
    // Validate inputs
    if (!toAddress || !amount) {
      message.error("Please enter recipient address and amount");
      return;
    }

    try {
      if (ethState) {
        // Ethereum Transaction
        if (ethNetwork === 'mainnet') {
          await sendEthMainnetTransaction();
        } else {
          await sendEthSepoliaTransaction();
        }
      } else {
        // Solana Transaction
        if (solNetwork === 'mainnet') {
          await sendSolMainnetTransaction();
        } else {
          await sendSolDevnetTransaction();
        }
      }
    } catch (error) {
      message.error(`Transaction failed: ${error}`);
    }
  };

const sendEthMainnetTransaction = async () => {
  try {
    console.log("Ethereum Mainnet Transaction");
    const provider = new ethers.JsonRpcProvider(mainnet);
    const wallet = new ethers.Wallet("65d4db9669b2d2c425e86a22967fcc38f030ef4b128c4ee180d0ec4c9e41a53b", provider);    

    const transaction = {
      to: toAddress,
      value: parseEther(amount),
      gasPrice: (await provider.getFeeData()).gasPrice,
      gasLimit: 21000,
    }

    const txnResponse = await wallet.sendTransaction(transaction);
    const receipt = await txnResponse.wait();
    
    message.success(`Ethereum Mainnet Transaction Sent: ${txnResponse.hash}`);
    setTransactionModalVisible(false);
    fetchEthBalance(ethPublicKey);
  } catch (err) {
    console.error(err);
    message.error(`Error sending Ethereum Mainnet transaction: ${err}`);
  }
};

const sendEthSepoliaTransaction = async () => {
  try {
    console.log("Sepolia Transaction");
    const provider = new ethers.JsonRpcProvider(sepolia);
    const wallet = new ethers.Wallet("65d4db9669b2d2c425e86a22967fcc38f030ef4b128c4ee180d0ec4c9e41a53b", provider);    

    const transaction = {
      to: toAddress,
      value: parseEther(amount),
      gasPrice: (await provider.getFeeData()).gasPrice,
      gasLimit: 21000,
    }

    const txnResponse = await wallet.sendTransaction(transaction);
    const receipt = await txnResponse.wait();
    
    message.success(`Ethereum Sepolia Transaction Sent: ${txnResponse.hash}`);
    setTransactionModalVisible(false);
    fetchSepoliaEthBalance(ethPublicKey);
  } catch (err) {
    console.error(err);
    message.error(`Error sending Ethereum Sepolia transaction: ${err}`);
  }
};

const sendSolMainnetTransaction = async () => {
    try {
      console.log("Solana Mainnet Transaction");
      const connection = new solanaWeb3.Connection(solanaRpcUrl!, 'confirmed');
      const fromWallet = solanaWeb3.Keypair.fromSecretKey(
        Buffer.from(JSON.parse("5p3NeDwqvWRRRqvbLw595rVUzARwQrMAaPKS29VLvroroRFYqeQ9jBkaYAAFiJSzwcdDmTHig8cayDPgraihE45C"))
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

const sendSolDevnetTransaction = async () => {
    try {
      console.log("Solana Mainnet Transaction");
      const connection = new solanaWeb3.Connection(solanaDevRpcUrl!, 'confirmed');
      const fromWallet = solanaWeb3.Keypair.fromSecretKey(
        Buffer.from(JSON.parse("5p3NeDwqvWRRRqvbLw595rVUzARwQrMAaPKS29VLvroroRFYqeQ9jBkaYAAFiJSzwcdDmTHig8cayDPgraihE45C"))
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

  const truncatePublicKey = (key: string): string => {
    return `${key.slice(0, 6)}....${key.slice(-6)}`;
  };

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

  const generatePaymentUri = () => {
    if (ethState) {
      // Ethereum payment URI (ERC-681 standard)
      return `ethereum:${ethPublicKey}`;
    } else {
      // Solana payment URI (uses a similar format)
      return `solana:${solPublicKey}`;
    }
  };

  // Generate QR code value with optional amount
  const generateQrCodeValue = () => {
    if (ethState) {
      // Ethereum payment URI with optional amount
      return `ethereum:${ethPublicKey}?value=${parseEther(amount || '0')}`;
    } else {
      // Solana payment URI with optional amount
      return `solana:${solPublicKey}?amount=${parseFloat(amount || '0') * solanaWeb3.LAMPORTS_PER_SOL}`;
    }
  };


  const [isSwapModalVisible, setSwapModalVisible] = useState(false);
  const [fromToken, setFromToken] = useState<string>('ETH');
  const [toToken, setToToken] = useState<string>('USDC');
  const [swapAmount, setSwapAmount] = useState<string>('');
  const [estimatedReceiveAmount, setEstimatedReceiveAmount] = useState<string>('');

  // Tokens list
  const tokens = [
    { symbol: 'ETH', logo: eth.src, network: 'ethereum' },
    { symbol: 'SOL', logo: sol.src, network: 'solana' },
    { symbol: 'USDC', logo: sol.src, network: 'ethereum' },
    { symbol: 'DAI', logo: sol.src, network: 'ethereum' },
  ];

  // Swap token handler
  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
  };

  // Estimate swap amount (mock implementation)
  const estimateSwapAmount = (amount: string, from: string, to: string) => {
    // This is a mock estimation - in real-world, you'd use a DEX API or oracle
    const rates: {[key: string]: {[key: string]: number}} = {
      'ETH': { 'USDC': 2000, 'DAI': 2050, 'SOL': 100 },
      'SOL': { 'USDC': 100, 'DAI': 105, 'ETH': 0.01 },
      'USDC': { 'ETH': 0.0005, 'SOL': 0.01, 'DAI': 1.01 },
      'DAI': { 'ETH': 0.00048, 'SOL': 0.0095, 'USDC': 0.99 }
    };

    const rate = rates[from][to];
    return (parseFloat(amount) * rate).toFixed(4);
  };

  // Handle swap amount input
  const handleSwapAmountChange = (value: string) => {
    setSwapAmount(value);
    // Estimate received amount
    const estimated = estimateSwapAmount(value, fromToken, toToken);
    setEstimatedReceiveAmount(estimated);
  };

  // Perform swap transaction
  const handleSwapTransaction = async () => {
    // Validate inputs
    if (!swapAmount || parseFloat(swapAmount) <= 0) {
      message.error("Please enter a valid swap amount");
      return;
    }

    try {
      // TODO: Implement actual swap logic using DEX aggregator or swap protocol
      message.success(`Swapped ${swapAmount} ${fromToken} to ${toToken}`);
      setSwapModalVisible(false);
      
      // Reset swap states
      setSwapAmount('');
      setEstimatedReceiveAmount('');
    } catch (error) {
      message.error(`Swap failed: ${error}`);
    }
  };

  // Render token selection option
  const renderTokenOption = (token: { symbol: string, logo: string }) => (
    <Flex align="center">
      <Avatar src={token.logo} size={24} style={{ marginRight: '8px' }} />
      <span>{token.symbol}</span>
    </Flex>
  );

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
                  <Button
                    icon={<RedoOutlined/>}
                    style={{ backgroundColor : "#151f38" , color : "white" , borderRadius : "20px" , width : "170px" , height : "80px" , marginTop : "20px" , marginLeft : "20px" , border : "gray"}}
                    onClick={() => setRecieveModalVisible(true)}>
                      Receive
                  </Button>
                  <Button 
                    style={{ backgroundColor : "#151f38" , color : "white" , borderRadius : "20px" , width : "170px" , height : "80px" , marginTop : "20px" , marginLeft : "20px" , border : "gray"}}
                    onClick={() => setSwapModalVisible(true)}
                    icon={<SwapOutlined />}
                    >
                     Swap
                  </Button>
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

      <Modal
        visible={isRecieveModalVisible}
        onCancel={() => setRecieveModalVisible(false)}
        footer={null}
      >
        <Flex justify='center' vertical align='center'>
          <h1>Receive {ethState ? 'ETH' : 'SOL'}</h1>
          <QRCode 
            value={generateQrCodeValue()} 
            size={250}
            icon={logo.src}
          />
          <Flex vertical align='center' style={{ marginBottom: '20px' }}>
            <Text style={{ marginBottom: '10px' }}>
              {ethState ? 'Ethereum' : 'Solana'} Address:
            </Text>
            <Text copyable>
              {ethState ? ethPublicKey : solPublicKey}
            </Text>
          </Flex>
          
          {/* <Input 
            placeholder="Enter amount (optional)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ width: '200px', marginBottom: '20px' }}
          /> */}
          
        </Flex>
      </Modal>


      <Modal
        title="Swap Tokens"
        visible={isSwapModalVisible}
        onCancel={() => setSwapModalVisible(false)}
        footer={null}
      >
        <Flex vertical>
          {/* From Token Input */}
          <Flex align="center" style={{ marginBottom: '20px' }}>
            <Input 
              placeholder="Enter amount to swap"
              value={swapAmount}
              onChange={(e) => handleSwapAmountChange(e.target.value)}
              style={{ flex: 1, marginRight: '10px' }}
            />
            <Select 
              style={{ width: 120 }}
              value={fromToken}
              onChange={(value) => setFromToken(value)}
            >
              {tokens.map((token) => (
                <Option key={token.symbol} value={token.symbol}>
                  {renderTokenOption(token)}
                </Option>
              ))}
            </Select>
          </Flex>

          {/* Swap Icon */}
          <Flex justify="center" style={{ margin: '10px 0' }}>
            <Button 
              type="text" 
              icon={<SwapOutlined />} 
              onClick={handleSwapTokens}
            >
              Swap Tokens
            </Button>
          </Flex>

          {/* To Token Output */}
          <Flex align="center">
            <Input 
              placeholder="Estimated receive amount"
              value={estimatedReceiveAmount}
              disabled
              style={{ flex: 1, marginRight: '10px' }}
            />
            <Select 
              style={{ width: 120 }}
              value={toToken}
              onChange={(value) => setToToken(value)}
            >
              {tokens.map((token) => (
                <Option key={token.symbol} value={token.symbol}>
                  {renderTokenOption(token)}
                </Option>
              ))}
            </Select>
          </Flex>

          {/* Swap Button */}
          <Button
            type="primary"
            block
            onClick={handleSwapTransaction}
            style={{ 
              marginTop: '20px', 
              backgroundColor: 'purple', 
              color: 'white', 
              borderRadius: '30px' 
            }}
          >
            Swap
          </Button>
        </Flex>
      </Modal>
    </div>
  );
}