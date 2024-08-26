import { useEffect, useState } from "react";
import { mnemonicToSeedSync } from "bip39";
import { Row, Col, Button, Flex, Card, Typography, Divider, Modal, message, Avatar, Input } from "antd";
import { CaretRightFilled } from "@ant-design/icons";
import { Keypair } from "@solana/web3.js";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setSeed } from "@/lib/features/seed/seedSlice";
import { BIP32Factory } from "bip32";
import ecc from '@bitcoinerlab/secp256k1';
import { ethers } from 'ethers';
import { derivePath } from "ed25519-hd-key";
import "../styles/home.css"
import eth from "../assets/etherium.png"
import sol from "../assets/solana-sol-icon.png"

const { Text, Title } = Typography;

export default function RecoverWallets() {
  const dispatch = useAppDispatch();
  
  const [mnemonic, setMnemonic] = useState<string>("");
  const [wallets, setWallets] = useState<{ solanaPublicKey: string; solanaSecretKey: string; ethereumAddress: string; ethereumPrivateKey: string }[]>([]);
  const [seedPhrase, setSeedPhrase] = useState<string>("");
  const bip32 = BIP32Factory(ecc);

  const reduxSeed = useAppSelector(state => state.seed.value);

  useEffect(() => {
    const storedMnemonic = localStorage.getItem('importMnemonic');
    const storedSolanaPathKey = localStorage.getItem('importSolanaPathKey');
    const storedEthPathKey = localStorage.getItem('importEthPathKey');

    if (storedMnemonic) {
      setMnemonic(storedMnemonic);
      setSeedPhrase(storedMnemonic);
      recoverWallets(storedMnemonic, parseInt(storedEthPathKey || '0'), parseInt(storedSolanaPathKey || '0'));
    }
  }, []);

  const recoverWallets = (mnemonic: string, ethCount: number, solanaCount: number) => {
    const seed = mnemonicToSeedSync(mnemonic);
    dispatch(setSeed(seed));
    const root = bip32.fromSeed(seed);
    
    const recoveredWallets = [];

    // Recover Ethereum wallets
    for (let i = 0; i < ethCount; i++) {
      const ethWallet = generateEthereumWallet(root, i);
      recoveredWallets.push({
        solanaPublicKey: '',
        solanaSecretKey: '',
        ethereumAddress: ethWallet.ethereumAddress,
        ethereumPrivateKey: ethWallet.ethereumPrivateKey
      });
    }

    // Recover Solana wallets
    for (let i = 0; i < solanaCount; i++) {
      const solanaWallet = generateSolanaWallet(seed, i);
      recoveredWallets.push({
        solanaPublicKey: solanaWallet.solanaPublicKey,
        solanaSecretKey: solanaWallet.solanaSecretKey,
        ethereumAddress: '',
        ethereumPrivateKey: ''
      });
    }

    setWallets(recoveredWallets);
  };

  const generateSolanaWallet = (seed: Buffer, index: number) => {
    const solanaPath = `m/44'/501'/${index}'/0'`;
    const { key: solanaPrivateKey } = derivePath(solanaPath, seed.toString('hex'));
    const solanaKeypair = Keypair.fromSeed(Uint8Array.from(solanaPrivateKey));
    return {
      solanaPublicKey: solanaKeypair.publicKey.toBase58(),
      solanaSecretKey: Buffer.from(solanaKeypair.secretKey).toString("hex"),
    };
  };

  const generateEthereumWallet = (root: any, index: number) => {
    const ethPath = `m/44'/60'/0'/0/${index}`;
    const ethChild = root.derivePath(ethPath);
    const ethPrivateKey = ethChild.privateKey ? ethers.hexlify(ethChild.privateKey) : "";
    const ethWallet = new ethers.Wallet(ethPrivateKey);
    return {
      ethereumAddress: ethWallet.address,
      ethereumPrivateKey: ethPrivateKey,
    };
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const createEthereumWallet = () => {
    const seed = mnemonicToSeedSync(mnemonic);
    const root = bip32.fromSeed(seed);
    const ethCount = parseInt(localStorage.getItem('importEthPathKey') || '0');
    const ethWallet = generateEthereumWallet(root, ethCount);

    setWallets(prevWallets => [...prevWallets, {
      solanaPublicKey: '',
      solanaSecretKey: '',
      ethereumAddress: ethWallet.ethereumAddress,
      ethereumPrivateKey: ethWallet.ethereumPrivateKey
    }]);

    localStorage.setItem('importEthPathKey', (ethCount + 1).toString());
    message.success(`Ethereum Wallet Recovered!\nAddress: ${ethWallet.ethereumAddress}\nPrivate Key: ${ethWallet.ethereumPrivateKey}`);
    handleCancel();
  };

  const createSolanaWallet = () => {
    const seed = mnemonicToSeedSync(mnemonic);
    const solanaCount = parseInt(localStorage.getItem('importSolanaPathKey') || '0');
    const solanaWallet = generateSolanaWallet(seed, solanaCount);

    setWallets(prevWallets => [...prevWallets, {
      solanaPublicKey: solanaWallet.solanaPublicKey,
      solanaSecretKey: solanaWallet.solanaSecretKey,
      ethereumAddress: '',
      ethereumPrivateKey: ''
    }]);

    localStorage.setItem('importSolanaPathKey', (solanaCount + 1).toString());
    message.success(`Solana Wallet Recovered!\nPublic Key: ${solanaWallet.solanaPublicKey}\nSecret Key (Hex): ${solanaWallet.solanaSecretKey}`);
    handleCancel();
  };

  const handleImportSeed = () => {
    if (seedPhrase) {
      localStorage.setItem('importMnemonic', seedPhrase);
      localStorage.setItem('importEthPathKey', '0');
      localStorage.setItem('importSolanaPathKey', '0');
      setMnemonic(seedPhrase);
      recoverWallets(seedPhrase, 0, 0);
      message.success("Seed phrase imported successfully!");
    } else {
      message.error("Please enter a valid seed phrase");
    }
  };

  return (
    <div style={{marginTop : "-900px"}}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 style={{ color : "white" , marginTop : "50px" , fontSize : "80px"}}>Import Seed and Recover Wallets</h1>
        <Row gutter={[16, 16]} style={{ marginBottom : "60px"}}>
          <Col span={24}>
            <Card style={{ width: 1300, margin: 'auto', padding: '20px', borderRadius: '10px', background: '#121322' , borderColor : "black" }}>
              <Title style={{ textAlign: 'center', marginBottom: '20px' , fontSize : "50px" , color : "white"}}>Your Seed Phrase</Title>
              <Divider />
              <Row gutter={[16, 16]} justify="center" align="middle">
                {mnemonic === "" &&
                  <Flex style={{ width : "100%"}}>
                    <Input onChange={(event) => {setSeedPhrase(event.target.value)}} placeholder="Enter your seed phrase" />
                    <Button style={{ backgroundColor : 'red' , border : "none" , marginLeft : "10px" , width : "60px" , fontSize : "23px"}} onClick={handleImportSeed}><CaretRightFilled/></Button>
                  </Flex>
                }
                {mnemonic !== "" && mnemonic.split(" ").map((word, index) => (
                  <Col span={6} key={index}>
                    <Card style={{ backgroundColor : "#000324" , border : "none"}}>
                      <Text style={{ fontSize : "20px" , color : "white"}} strong>{index + 1}. </Text>
                      <Text style={{ fontSize : "20px" , color : "white"}}>{word}</Text>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
          <Col span={24}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '1300px', margin: '10px auto' , boxSizing : "border-box" }}>
              <Button style={{ width : "600px" , padding : "30px 0px" , fontSize : "20px" , backgroundColor : "black" , color : "white" , borderRadius : "30px" }} onClick={() => {
                localStorage.removeItem('importMnemonic');
                localStorage.removeItem('importEthPathKey');
                localStorage.removeItem('importSolanaPathKey');
                setMnemonic("");
                setSeedPhrase("");
                setWallets([]);
              }}>
                Clear Imported Account
              </Button>
              <Button style={{ width : "600px" , padding : "30px 0px" , fontSize : "20px" ,  backgroundColor : "black" , color : "white" , borderRadius : "30px"}} onClick={showModal}>
                Recover Wallets
              </Button>
            </div>
          </Col>
        </Row>
          {wallets.length > 0 && (
            <Row>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {wallets.map((wallet, index) => (
                  <Col key={index}>
                    <Card bodyStyle={{ padding : "0px"}} style={{ width : "1300px" , marginBottom : "20px" , backgroundColor : "#121322" , border : "2px solid black"}}>
                      <Title style={{ fontSize : "40px" , color : "white" , marginLeft : "30px" }}>Wallet {index + 1}</Title>
                      { wallet.solanaPublicKey !== "" && (
                        <Card style={{ backgroundColor : "#9300b0" , marginBottom : "0px 0px" , padding : "0px 0px" , width : "100%" , border : "none" ,  borderTopLeftRadius : "60px" , borderTopRightRadius : "60px"  }}>
                          <p style={{ fontSize : "40px" , color : "white"}}>Solana Public Key:</p>
                          <p style={{ color : "white" , fontSize : "20px"}}> {wallet.solanaPublicKey}</p>
                          <p style={{ fontSize : "40px" , color : "white"}}>Solana Secret Key (Hex):</p>
                          <p style={{ color : "white" , fontSize : "18px"}}> {wallet.solanaSecretKey}</p>
                        </Card>
                      )}
                      {wallet.ethereumAddress !== "" && (
                        <Card style={{ backgroundColor : "#c70300" , marginBottom : "0px 0px" , padding : "0px 0px" , width : "100%" , border : "none" , borderTopLeftRadius : "60px" , borderTopRightRadius : "60px" }}>
                          <p style={{ fontSize : "40px" , color : "white" , padding : "0px 0px"}}>Ethereum Public Key:</p>
                          <p style={{ color : "white" , fontSize : "20px" , marginTop : "-30px" , textAlign : "inherit"}}> {wallet.ethereumAddress}</p>
                          <p style={{ fontSize : "40px" , color : "white" , padding : "0px 0px"}}>Ethereum Private Key:</p>
                          <p style={{ color : "white" , fontSize : "20px" , marginTop : "-30px" , textAlign : "inherit"}}> {wallet.ethereumPrivateKey}</p>
                        </Card>
                      )}
                    </Card>
                  </Col>
                ))}
              </div>
            </Row>
          )}
          {/* <p style={{color : "white"}}><strong>Redux Seed (Hex):</strong> {ethPathKey} <strong>{solanaPathKey}</strong></p> */}
        </div>

        <Modal 
          title={<Title style={{ backgroundColor: "#121322", color: "white", padding: "20px"  }} level={1}>Create Wallet</Title>}
          open={isModalOpen}
          onCancel={handleCancel}
          footer={null}
          bodyStyle={{ padding: 0, margin: 0, backgroundColor: 'transparent' }}
          style={{ padding: 0, margin: 0 , borderRadius : "40px" }}
          centered
          className="modal"
          closeIcon={null}
          maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
        >
          <Flex 
            vertical 
            justify="center" 
            align="center" 
            gap={12} 
            style={{ 
              backgroundColor: '#121322', 
              color: 'white', 
              border: 'none',
              padding: '30px',
              borderRadius : "40px"
            }}
          >
            <Button type="primary" className="modal-button" onClick={createEthereumWallet}>
              <Avatar className="modal-avatar" style={{marginLeft : "20px"}} src={eth.src}/>Ethereum Wallet
            </Button>
            <Button type="primary" className="modal-button" onClick={createSolanaWallet}>
              <Avatar className="modal-avatar" src={sol.src}/>Solana Wallet
            </Button>
          </Flex>
        </Modal>
    </div>
  );
}