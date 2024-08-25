// import { useState } from "react";
// import { mnemonicToSeedSync } from "bip39";
// import { Keypair } from "@solana/web3.js";
// import { Row, Col, Input, Button } from "antd";
// import { BIP32Factory } from "bip32";
// import ecc from '@bitcoinerlab/secp256k1';
// import { ethers } from 'ethers';
// import { derivePath } from "ed25519-hd-key";

// export default function RecoverWallets() {
//   const [mnemonic, setMnemonic] = useState("");
//   const [wallets, setWallets] = useState<{ solanaPublicKey: string; solanaSecretKey: string; ethereumAddress: string; ethereumPrivateKey: string }[]>([]);

//   const bip32 = BIP32Factory(ecc);

//   const recoverWallets = () => {
//     if (!mnemonic) return;

//     const seed = mnemonicToSeedSync(mnemonic);
//     const root = bip32.fromSeed(seed);
//     const recoveredWallets = [];

//     // Derive multiple wallets (let's say we recover the first 5)
//     for (let i = 0; i < 5; i++) {
//       // Solana wallet derivation
//       const solanaPath = `m/44'/501'/${i}'/0'`;
//       const { key: solanaPrivateKey } = derivePath(solanaPath, seed.toString('hex'));
//       const solanaKeypair = Keypair.fromSeed(Uint8Array.from(solanaPrivateKey));

//       // Ethereum wallet derivation
//       const ethPath = `m/44'/60'/0'/0/${i}`;
//       const ethChild = root.derivePath(ethPath);
//       const ethPrivateKey = ethers.hexlify(ethChild.privateKey);
//       const ethWallet = new ethers.Wallet(ethPrivateKey);

//       recoveredWallets.push({
//         solanaPublicKey: solanaKeypair.publicKey.toBase58(),
//         solanaSecretKey: Buffer.from(solanaKeypair.secretKey).toString("hex"),
//         ethereumAddress: ethWallet.address,
//         ethereumPrivateKey: ethPrivateKey,
//       });
//     }

//     setWallets(recoveredWallets);
//   };

//   return (
//     <>
//       <h1>Recover Wallets</h1>
//       <Row gutter={[16, 16]}>
//         <Col span={24}>
//           <Input
//           style={{ color : "white"}}
//             placeholder="Enter your mnemonic phrase"
//             onChange={(e) => setMnemonic(e.target.value)}
//           />
//         </Col>
//         <Col span={24}>
//           <Button onClick={recoverWallets}>
//             Recover Wallets
//           </Button>
//         </Col>
//       </Row>
//       {wallets.length > 0 && (
//         <Row gutter={[16, 16]}>
//           {wallets.map((wallet, index) => (
//             <Col span={24} key={index}>
//               <h2>Wallet {index + 1}</h2>
//               <p style={{ color : "white"}}><strong>Solana Public Key:</strong> {wallet.solanaPublicKey}</p>
//               <p style={{ color : "white"}}><strong>Solana Secret Key (Hex):</strong> {wallet.solanaSecretKey}</p>
//               <p style={{ color : "white"}}><strong>Ethereum Address:</strong> {wallet.ethereumAddress}</p>
//               <p style={{ color : "white"}}><strong>Ethereum Private Key:</strong> {wallet.ethereumPrivateKey}</p>
//             </Col>
//           ))}
//         </Row>
//       )}
//     </>
//   );
// }

import { useEffect, useState } from "react";
import { generateMnemonic, mnemonicToSeedSync } from "bip39";
import { Row, Col, Button, Flex , Card , Typography , Divider , Modal , message, Avatar, Input} from "antd";
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
  const [seedPhrase , setSeedPhrase] = useState<string>("");
  const bip32 = BIP32Factory(ecc);

  const reduxSeed = useAppSelector(state => state.seed.value);

  const genMnemonic = () => {
    const newMnemonic = generateMnemonic();
    setMnemonic(newMnemonic);
    const seed = mnemonicToSeedSync(mnemonic);
    dispatch(setSeed(seed));
    setWallets([]);
    // generateWallets(newMnemonic);
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

  // Function to generate Ethereum wallet
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

  useEffect(() => {
    genMnemonic();
  }, []);


  // MODAL 

  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const createEthereumWallet = () => {
    const newMnemonic = generateMnemonic();
    const seed = mnemonicToSeedSync(newMnemonic);
    const root = bip32.fromSeed(seed);
    const ethWallet = generateEthereumWallet(root, 0); // Generate a single wallet

    setWallets(prevWallets => [...prevWallets, {
    solanaPublicKey: '',
    solanaSecretKey: '',
    ethereumAddress: ethWallet.ethereumAddress,
    ethereumPrivateKey: ethWallet.ethereumPrivateKey
  }]);

    message.success(`Ethereum Wallet Created!\nAddress: ${ethWallet.ethereumAddress}\nPrivate Key: ${ethWallet.ethereumPrivateKey}`);
    handleCancel();
  };

  const createSolanaWallet = () => {
    const newMnemonic = generateMnemonic();
    const seed = mnemonicToSeedSync(newMnemonic);
    const solanaWallet = generateSolanaWallet(seed, 0); // Generate a single wallet

    setWallets(prevWallets => [...prevWallets, {
      solanaPublicKey: solanaWallet.solanaPublicKey,
      solanaSecretKey: solanaWallet.solanaSecretKey,
      ethereumAddress: '',
      ethereumPrivateKey: ''
    }]);

    message.success(`Solana Wallet Created!\nPublic Key: ${solanaWallet.solanaPublicKey}\nSecret Key (Hex): ${solanaWallet.solanaSecretKey}`);
    handleCancel();
  };

  return (
    <div style={{marginTop : "-900px"}}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 style={{ color : "white" , marginTop : "50px" , fontSize : "80px"}}>Generate Seed and Wallets</h1>
        <Row gutter={[16, 16]} style={{ marginBottom : "60px"}}>
          <Col span={24}>
            <Card style={{ width: 1300, margin: 'auto', padding: '20px', borderRadius: '10px', background: '#121322' , borderColor : "black" }}>
              <Title style={{ textAlign: 'center', marginBottom: '20px' , fontSize : "50px" , color : "white"}}>Your Seed Phrase</Title>
              <Divider />
              <Row gutter={[16, 16]} justify="center" align="middle">
                {seedPhrase!= "" && seedPhrase.split(" ").map((word, index) => (
                  <Col span={6} key={index}>
                      <Card style={{ backgroundColor : "#000324" , border : "none"}}>
                        <Text style={{ fontSize : "20px" , color : "white"}} strong>{index + 1}. </Text>
                        <Text style={{ fontSize : "20px" , color : "white"}}>{word}</Text>
                      </Card>
                    </Col>
                ))}
                {seedPhrase === "" &&
                  <Flex style={{ width : "100%"}}>
                    <Input onChange={(event) => {setSeedPhrase(event.target.value)}}/>
                    <Button style={{ backgroundColor : 'red' , border : "none" , marginLeft : "10px" , width : "60px" , fontSize : "23px"}}><CaretRightFilled/></Button>
                  </Flex>
                }
              </Row>
            </Card>
          </Col>
          <Col span={24}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '1300px', margin: '10px auto' , boxSizing : "border-box" }}>
              <Button style={{ width : "600px" , padding : "30px 0px" , fontSize : "20px" , backgroundColor : "black" , color : "white" , borderRadius : "30px" }} onClick={genMnemonic}>
                Import New Account
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
                    <Title style={{ fontSize : "40px" , color : "white" }}>Wallet {index + 1}</Title>
                    { wallet.solanaPublicKey !== "" && (
                      <Card style={{ backgroundColor : "#9300b0" , marginBottom : "0px 0px" , padding : "0px 0px" , width : "100%" , border : "none" ,  borderTopLeftRadius : "60px" , borderTopRightRadius : "60px"  }}>
                        <p style={{ fontSize : "40px" , color : "white"}}>Solana Public Key:</p>
                        <p style={{ color : "white" , fontSize : "20px"}}> {wallet.solanaPublicKey}</p>
                        <p style={{ fontSize : "40px" , color : "white"}}>Solana Secret Key (Hex):</p>
                        <p style={{ color : "white" , fontSize : "18px"}}> {wallet.solanaSecretKey}</p>
                      </Card>

                    )}
                    {wallet.ethereumAddress !== "" && (
                      <Card style={{ backgroundColor : "#000324" , marginBottom : "0px 0px" , padding : "0px 0px" , width : "100%" , border : "none" , borderTopLeftRadius : "60px" , borderTopRightRadius : "60px" }}>
                        <p style={{ fontSize : "40px" , color : "white" , padding : "0px 0px"}}>Ethereum Address:</p>
                        <p style={{ color : "white" , fontSize : "20px" , marginTop : "-30px" , textAlign : "inherit"}}> {wallet.ethereumAddress}</p>
                        <p style={{ fontSize : "40px" , color : "white" , padding : "0px 0px"}}>Ethereum Private Key:</p>
                        <p style={{ color : "white" , fontSize : "20px" , marginTop : "-30px" , textAlign : "inherit"}}> {wallet.ethereumPrivateKey}</p>
                        
                        
                        {/* <p style={{ color : "white" , fontSize : "20px"}}><strong style={{ fontSize : "40px"}}>Ethereum Address:</strong> {wallet.ethereumAddress}</p>
                        <p style={{ color : "white" , fontSize : "20px"}}><strong style={{ fontSize : "40px"}}>Ethereum Private Key:</strong> {wallet.ethereumPrivateKey}</p> */}
                      </Card>
                    )}
                  </Card>
                </Col>
              ))}
              </div>
            </Row>
          )}
        <p style={{color : "white"}}><strong>Redux Seed (Hex):</strong> {reduxSeed?.toString("hex")}</p>
      </div>

      {/* <Modal
        // title={<Title level={4}>Create Wallet</Title>}
        visible={isVisible}
        onCancel={handleCancel}
        footer={null}
        centered
        bodyStyle={{ padding: 0 }}
        style={{ backgroundColor: 'black', padding: 0, margin: 0,  alignItems: 'center' , border : "2px solid red" }}
        width="auto"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#121322', color: 'white' }}>
          <Button type="primary" onClick={createEthereumWallet}>
            <Avatar src={eth.src}/>Create New Ethereum Wallet
          </Button>
          <Button type="primary" onClick={createSolanaWallet}>
            <Avatar src={sol.src}/>Create New Solana Wallet
          </Button>
        </div>
      </Modal> */}

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