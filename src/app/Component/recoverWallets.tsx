import { useEffect, useState } from "react";
import { mnemonicToSeedSync } from "bip39";
import { Row, Col, Button, Flex, Card, Typography, Divider, Modal, message, Avatar, Input } from "antd";
import { CaretRightFilled } from "@ant-design/icons";
import { Keypair } from "@solana/web3.js"
import { useAppDispatch } from "@/lib/hooks";
import { BIP32Factory } from "bip32";
import ecc from '@bitcoinerlab/secp256k1';
import { ethers } from 'ethers';
import { derivePath } from "ed25519-hd-key";
import "../styles/home.css"
import eth from "../assets/etherium.png"
import sol from "../assets/solana-sol-icon.png"

const { Text, Title } = Typography;
const bip32 = BIP32Factory(ecc);

interface Account {
  id: number;
  name: string;
  ethereumWallet: {
    address: string;
    privateKey: string;
  };
  solanaWallet: {
    publicKey: string;
    secretKey: string;
  };
}

export default function RecoverAccounts() {
  const dispatch = useAppDispatch();
  const [mnemonic, setMnemonic] = useState<string>("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [seedPhrase, setSeedPhrase] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const storedMnemonic = localStorage.getItem('importMnemonic');
    const storedAccounts = localStorage.getItem('importAccounts');

    if (storedMnemonic) {
      setMnemonic(storedMnemonic);
      setSeedPhrase(storedMnemonic);
      if (storedAccounts) {
        setAccounts(JSON.parse(storedAccounts));
      }
    }
  }, []);

  const generateAccount = (seed: Buffer, accountIndex: number): Account => {
    // Generate Ethereum wallet
    const root = bip32.fromSeed(seed);
    const ethPath = `m/44'/60'/${accountIndex}'/0/0`;
    const ethChild = root.derivePath(ethPath);
    const ethPrivateKey = ethChild.privateKey ? ethers.hexlify(ethChild.privateKey) : "";
    const ethWallet = new ethers.Wallet(ethPrivateKey);

    // Generate Solana wallet
    const solanaPath = `m/44'/501'/${accountIndex}'/0'`;
    const { key: solanaPrivateKey } = derivePath(solanaPath, seed.toString('hex'));
    const solanaKeypair = Keypair.fromSeed(Uint8Array.from(solanaPrivateKey));

    return {
      id: accountIndex,
      name: `Account ${accountIndex + 1}`,
      ethereumWallet: {
        address: ethWallet.address,
        privateKey: ethPrivateKey,
      },
      solanaWallet: {
        publicKey: solanaKeypair.publicKey.toBase58(),
        secretKey: Buffer.from(solanaKeypair.secretKey).toString("hex"),
      },
    };
  };

  const handleImportSeed = () => {
    if (seedPhrase) {
      try {
        const seed = mnemonicToSeedSync(seedPhrase);
        // dispatch(setSeed(seed));
        
        // Generate first account automatically
        const firstAccount = generateAccount(seed, 0);
        setAccounts([firstAccount]);
        
        localStorage.setItem('importMnemonic', seedPhrase);
        localStorage.setItem('importAccounts', JSON.stringify([firstAccount]));
        setMnemonic(seedPhrase);
        
        message.success("Seed phrase imported successfully!");
      } catch (error) {
        message.error("Invalid seed phrase. Please check and try again.");
      }
    } else {
      message.error("Please enter a seed phrase");
    }
  };

  const recoverNextAccount = () => {
    if (!mnemonic) {
      message.error("Please import a seed phrase first");
      return;
    }

    const seed = mnemonicToSeedSync(mnemonic);
    const nextAccountIndex = accounts.length;
    const newAccount = generateAccount(seed, nextAccountIndex);
    
    const updatedAccounts = [...accounts, newAccount];
    setAccounts(updatedAccounts);
    localStorage.setItem('importAccounts', JSON.stringify(updatedAccounts));
    
    message.success(`Account ${nextAccountIndex + 1} recovered successfully!`);
    setIsModalOpen(false);
  };

  const clearImportedAccounts = () => {
    localStorage.removeItem('importMnemonic');
    localStorage.removeItem('importAccounts');
    setMnemonic("");
    setSeedPhrase("");
    setAccounts([]);
    message.success("Imported accounts cleared");
  };

  return (
    <div style={{marginTop: "-900px"}}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 style={{ color: "white", marginTop: "50px", fontSize: "80px" }}>Import Seed and Recover Accounts</h1>
        
        {/* Seed Phrase Card */}
        <Row gutter={[16, 16]} style={{ marginBottom: "60px" }}>
          <Col span={24}>
            <Card style={{ width: 1300, margin: 'auto', padding: '20px', borderRadius: '10px', background: '#121322', borderColor: "black" }}>
              <Title style={{ textAlign: 'center', marginBottom: '20px', fontSize: "50px", color: "white" }}>Your Seed Phrase</Title>
              <Divider />
              <Row gutter={[16, 16]} justify="center" align="middle">
                {mnemonic === "" ? (
                  <Flex style={{ width: "100%" }}>
                    <Input 
                      onChange={(event) => setSeedPhrase(event.target.value)}
                      placeholder="Enter your seed phrase"
                    />
                    <Button 
                      style={{ backgroundColor: 'red', border: "none", marginLeft: "10px", width: "60px", fontSize: "23px" }}
                      onClick={handleImportSeed}
                    >
                      <CaretRightFilled/>
                    </Button>
                  </Flex>
                ) : (
                  mnemonic.split(" ").map((word, index) => (
                    <Col span={6} key={index}>
                      <Card style={{ backgroundColor: "#000324", border: "none" }}>
                        <Text style={{ fontSize: "20px", color: "white" }} strong>{index + 1}. </Text>
                        <Text style={{ fontSize: "20px", color: "white" }}>{word}</Text>
                      </Card>
                    </Col>
                  ))
                )}
              </Row>
            </Card>
          </Col>
          
          {/* Action Buttons */}
          <Col span={24}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '1300px', margin: '10px auto', boxSizing: "border-box" }}>
              <Button 
                style={{ width: "600px", padding: "30px 0px", fontSize: "20px", backgroundColor: "black", color: "white", borderRadius: "30px" }}
                onClick={clearImportedAccounts}
              >
                Clear Imported Accounts
              </Button>
              <Button 
                style={{ width: "600px", padding: "30px 0px", fontSize: "20px", backgroundColor: "black", color: "white", borderRadius: "30px" }}
                onClick={() => setIsModalOpen(true)}
              >
                Recover Next Account
              </Button>
            </div>
          </Col>
        </Row>

        {/* Display Accounts */}
        {accounts.map((account) => (
          <Card 
            key={account.id}
            style={{ width: 1300, marginBottom: "20px", backgroundColor: "#121322", border: "2px solid black" }}
          >
            <Title style={{ fontSize: "40px", color: "white", marginLeft: "30px" }}>{account.name}</Title>
            
            {/* Ethereum Wallet */}
            <Card style={{ backgroundColor: "#c70300", marginBottom: "20px", padding: "20px", border: "none", borderRadius: "20px" }}>
              <Flex align="center">
                <Avatar src={eth.src} size={40} style={{ marginRight: "10px" }} />
                <Title level={3} style={{ color: "white", margin: 0 }}>Ethereum Wallet</Title>
              </Flex>
              <p style={{ fontSize: "20px", color: "white" }}>Address: {account.ethereumWallet.address}</p>
              <p style={{ fontSize: "16px", color: "white" }}>Private Key: {account.ethereumWallet.privateKey}</p>
            </Card>
            
            {/* Solana Wallet */}
            <Card style={{ backgroundColor: "#9300b0", padding: "20px", border: "none", borderRadius: "20px" }}>
              <Flex align="center">
                <Avatar src={sol.src} size={40} style={{ marginRight: "10px" }} />
                <Title level={3} style={{ color: "white", margin: 0 }}>Solana Wallet</Title>
              </Flex>
              <p style={{ fontSize: "20px", color: "white" }}>Public Key: {account.solanaWallet.publicKey}</p>
              <p style={{ fontSize: "16px", color: "white" }}>Secret Key: {account.solanaWallet.secretKey}</p>
            </Card>
          </Card>
        ))}
      </div>

      {/* Confirmation Modal */}
      <Modal 
        title={<Title style={{ backgroundColor: "#121322", color: "white", padding: "20px" }} level={1}>Recover Next Account</Title>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        bodyStyle={{ padding: 0, margin: 0, backgroundColor: 'transparent' }}
        style={{ padding: 0, margin: 0, borderRadius: "40px" }}
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
            borderRadius: "40px"
          }}
        >
          <p>This will recover Account {accounts.length + 1} with both Ethereum and Solana wallets.</p>
          <Button type="primary" className="modal-button" onClick={recoverNextAccount}>
            Recover Next Account
          </Button>
        </Flex>
      </Modal>
    </div>
  );
}