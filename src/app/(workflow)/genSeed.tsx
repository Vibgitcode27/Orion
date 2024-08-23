import { useEffect, useState } from "react";
import { generateMnemonic, mnemonicToSeedSync } from "bip39";
import { Row, Col, Button, Flex , Card , Typography , Divider} from "antd";
import { CopyOutlined } from "@ant-design/icons";
import { Keypair } from "@solana/web3.js";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setSeed } from "@/lib/features/seed/seedSlice";
import { BIP32Factory } from "bip32";
import ecc from '@bitcoinerlab/secp256k1';
import { ethers } from 'ethers';
import { derivePath } from "ed25519-hd-key";
import "../styles/home.css"

const { Text, Title } = Typography;

export default function GenSeed() {
  const dispatch = useAppDispatch();
  
  const [mnemonic, setMnemonic] = useState<string>("");
  const [wallets, setWallets] = useState<{ solanaPublicKey: string; solanaSecretKey: string; ethereumAddress: string; ethereumPrivateKey: string }[]>([]);
  let seedWords = mnemonic.split(" ");
  const bip32 = BIP32Factory(ecc);

  const reduxSeed = useAppSelector(state => state.seed.value);

  const genMnemonic = () => {
    const newMnemonic = generateMnemonic();
    setMnemonic(newMnemonic);
    generateWallets(newMnemonic);
  };

  const generateWallets = (mnemonic: string) => {
    const seed = mnemonicToSeedSync(mnemonic);
    dispatch(setSeed(seed));  // Store the seed in Redux store
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

  useEffect(() => {
    genMnemonic();
  }, []);

  return (
    <div style={{marginTop : "-900px"}}>
      <Flex vertical align="center" justify="content">
        <h1 style={{ color : "white" , marginTop : "50px" , fontSize : "80px"}}>Generate Seed and Wallets</h1>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card style={{ width: 1300, margin: 'auto', padding: '20px', borderRadius: '10px', background: '#f5f5f5' }}>
              <Title style={{ textAlign: 'center', marginBottom: '20px' , fontSize : "50px"}}>Your Seed Phrase</Title>
              <Divider />
              <Row gutter={[16, 16]} justify="center" align="middle">
                {seedWords.map((word, index) => (
                  <Col span={6} key={index}>
                      <Card>
                        <Text strong>{index + 1}. </Text>
                        <Text>{word}</Text>
                      </Card>
                    </Col>
                ))}
              </Row>
              <h3 style={{ margin : "0px" ,  marginLeft : "10px" , marginTop : "20px"}}>Click here to to copy <CopyOutlined/></h3>
            </Card>
          </Col>
          <Col span={24}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '1300px', margin: '10px auto' , boxSizing : "border-box" }}>
              <Button style={{ width : "600px" , padding : "30px 0px"}} onClick={genMnemonic}>
                Generate New Seed
              </Button>
              <Button style={{ width : "600px" , padding : "30px 0px"}} onClick={genMnemonic}>
                New Wallets
              </Button>
            </div>
          </Col>
        </Row>
          {wallets.length > 0 && (
            <Row>
              <Flex vertical align="center" justify="center">
              {wallets.map((wallet, index) => (
                <Col key={index}>
                  <Card style={{ width : "1300px" , }}>
                    <h2>Wallet {index + 1}</h2>
                    <p><strong>Solana Public Key:</strong> {wallet.solanaPublicKey}</p>
                    <p><strong>Solana Secret Key (Hex):</strong> {wallet.solanaSecretKey}</p>
                    <p><strong>Ethereum Address:</strong> {wallet.ethereumAddress}</p>
                    <p><strong>Ethereum Private Key:</strong> {wallet.ethereumPrivateKey}</p>
                  </Card>
                </Col>
              ))}
              </Flex>
            </Row>
          )}
        <p style={{color : "white"}}><strong>Redux Seed (Hex):</strong> {reduxSeed?.toString("hex")}</p>
      </Flex>
    </div>
  );
}