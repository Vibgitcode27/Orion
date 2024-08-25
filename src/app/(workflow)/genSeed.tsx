import { useEffect, useState } from "react";
import { generateMnemonic, mnemonicToSeedSync } from "bip39";
import { Row, Col, Button, Flex , Card , Typography , Divider , Modal , message, Avatar} from "antd";
import { incrementEthPathKey , incrementSolanaPathKey } from "@/lib/features/derivationPath/derivationPathSlice";
import { CopyOutlined } from "@ant-design/icons";
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

export default function GenSeed() {
  const dispatch = useAppDispatch();
  
  const [mnemonic, setMnemonic] = useState<string>("");
  const [wallets, setWallets] = useState<{ solanaPublicKey: string; solanaSecretKey: string; ethereumAddress: string; ethereumPrivateKey: string }[]>([]);
  let seedWords = mnemonic.split(" ");
  const bip32 = BIP32Factory(ecc);

  let solanaPathKey = useAppSelector(state => state.path.solanaPathKey);
  let ethPathKey = useAppSelector(state => state.path.ethPathKey);
  const reduxSeed = useAppSelector(state => state.seed.value);

  const genMnemonic = () => {
    const newMnemonic = generateMnemonic();
    setMnemonic(newMnemonic);
    const seed = mnemonicToSeedSync(mnemonic);
    dispatch(setSeed(seed));
    setWallets([]);
    // generateWallets(newMnemonic);
  };

  const generateWallets = (mnemonic: string) => {
    const seed = mnemonicToSeedSync(mnemonic);
    dispatch(setSeed(seed));
    const root = bip32.fromSeed(seed);
    const generatedWallets = [];

    // Generate multiple wallets (let's say 5)
    for (let i = 0; i < 5; i++) {
      // Solana wallet derivation using ed25519-hd-key
      const solanaPath = `m/44'/501'/${i}'/0'`;
      const { key: solanaPrivateKey } = derivePath(solanaPath, seed.toString('hex'));
      const solanaKeypair = Keypair.fromSeed(Uint8Array.from(solanaPrivateKey));

      // Ethereum wallet derivation
      const ethPath = `m/44'/60'/0'/0/${i}`;
      const ethChild = root.derivePath(ethPath);
      const ethPrivateKey = ethChild.privateKey ? ethers.hexlify(ethChild.privateKey) : "";
      const ethWallet = new ethers.Wallet(ethPrivateKey);

      generatedWallets.push({
        solanaPublicKey: solanaKeypair.publicKey.toBase58(),
        solanaSecretKey: Buffer.from(solanaKeypair.secretKey).toString("hex"),
        ethereumAddress: ethWallet.address,
        ethereumPrivateKey: ethPrivateKey,
      });
    }

    setWallets(generatedWallets);
  };

  const generateSolanaWallet = (seed: Buffer, index: number) => {
    const solanaPath = `m/44'/501'/${index}'/0'`;
    dispatch(incrementSolanaPathKey());
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
    dispatch(incrementEthPathKey());
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
    const seed = mnemonicToSeedSync(mnemonic);
    const root = bip32.fromSeed(seed);
    const ethWallet = generateEthereumWallet(root, ethPathKey);

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
    const seed = mnemonicToSeedSync(mnemonic);
    const solanaWallet = generateSolanaWallet(seed, solanaPathKey);

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
                {mnemonic.split(" ").map((word, index) => (
                  <Col span={6} key={index}>
                      <Card style={{ backgroundColor : "#000324" , border : "none"}}>
                        <Text style={{ fontSize : "20px" , color : "white"}} strong>{index + 1}. </Text>
                        <Text style={{ fontSize : "20px" , color : "white"}}>{word}</Text>
                      </Card>
                    </Col>
                ))}
              </Row>
              <h3 style={{ margin : "0px" ,  marginLeft : "10px" , marginTop : "20px" , color : "white"}}>Click here to copy <CopyOutlined/></h3>
            </Card>
          </Col>
          <Col span={24}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '1300px', margin: '10px auto' , boxSizing : "border-box" }}>
              <Button style={{ width : "600px" , padding : "30px 0px" , fontSize : "23px" , backgroundColor : "red" , color : "white" , borderRadius : "30px" , border : "black" }} onClick={genMnemonic}>
                Generate New Seed
              </Button>
              <Button style={{ width : "600px" , padding : "30px 0px" , fontSize : "23px" ,  backgroundColor : "white" , color : "black" , borderRadius : "30px"}} onClick={showModal}>
                New Wallets
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
        <p style={{color : "white"}}><strong>Redux Seed (Hex):</strong> {reduxSeed?.toString("hex")}</p>
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