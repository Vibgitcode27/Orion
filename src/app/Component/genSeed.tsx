import { useEffect, useState } from "react";
import { generateMnemonic, mnemonicToSeedSync } from "bip39";
import { Row, Col, Button, Flex, Card, Typography, Divider, Modal, message, Avatar } from "antd";
import { CopyOutlined, PlusOutlined } from "@ant-design/icons";
import { Keypair } from "@solana/web3.js";
import { BIP32Factory } from "bip32";
import ecc from '@bitcoinerlab/secp256k1';
import { ethers } from 'ethers';
import { derivePath } from "ed25519-hd-key";
import eth from "../assets/etherium.png";
import sol from "../assets/solana-sol-icon.png";
// import { useRouter } from "next/router";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/hooks";
import { setkeys } from "@/lib/features/keys/keySlice";
// import { useAppDispatch , useAppSelector } from "@/lib/hooks";
// import { setSolPrivateKey , setEthPrivateKey ,  setEthPublicKey ,  setSolPublicKey } from "@/lib/features/interact/keys";

const { Text, Title } = Typography;
const bip32 = BIP32Factory(ecc);

interface Wallet {
  solanaPublicKey: string;
  solanaSecretKey: string;
  ethereumAddress: string;
  ethereumPrivateKey: string;
}

interface Account {
  id: number;
  name: string;
  ethereumWallet: Omit<Wallet, 'solanaPublicKey' | 'solanaSecretKey'>;
  solanaWallet: Omit<Wallet, 'ethereumAddress' | 'ethereumPrivateKey'>;
}

export default function HDWalletWithAccounts() {
  const [mnemonic, setMnemonic] = useState<string>("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const generateAccount = (seed: Buffer, accountIndex: number): Account => {
    // Generate Ethereum wallet for this account
    // Standard path for Ethereum (same as MetaMask): m/44'/60'/0'/0/accountIndex
    const root = bip32.fromSeed(seed);
    const ethPath = `m/44'/60'/0'/0/${accountIndex}`;
    const ethChild = root.derivePath(ethPath);
    const ethPrivateKey = ethChild.privateKey ? ethers.hexlify(ethChild.privateKey) : "";
    const ethWallet = new ethers.Wallet(ethPrivateKey);

    // Generate Solana wallet for this account
    // Standard path for Solana (same as Phantom): m/44'/501'/accountIndex'
    const solanaPath = `m/44'/501'/${accountIndex}'`;
    const { key: solanaPrivateKey } = derivePath(solanaPath, seed.toString('hex'));
    const solanaKeypair = Keypair.fromSeed(Uint8Array.from(solanaPrivateKey));

    return {
      id: accountIndex,
      name: `Account ${accountIndex + 1}`,
      ethereumWallet: {
        ethereumAddress: ethWallet.address,
        ethereumPrivateKey: ethPrivateKey,
      },
      solanaWallet: {
        solanaPublicKey: solanaKeypair.publicKey.toBase58(),
        solanaSecretKey: Buffer.from(solanaKeypair.secretKey).toString("hex"),
      },
    };
  };

  const genMnemonic = () => {
    const newMnemonic = generateMnemonic();
    setMnemonic(newMnemonic);
    localStorage.setItem('mnemonic', newMnemonic);
    setAccounts([]);
    
    // Generate the first account automatically
    const seed = mnemonicToSeedSync(newMnemonic);
    const firstAccount = generateAccount(seed, 0);
    setAccounts([firstAccount]);
    localStorage.setItem('accounts', JSON.stringify([firstAccount]));
  };

  const createNewAccount = () => {
    const seed = mnemonicToSeedSync(mnemonic);
    const newAccountIndex = accounts.length;
    const newAccount = generateAccount(seed, newAccountIndex);
    
    const updatedAccounts = [...accounts, newAccount];
    setAccounts(updatedAccounts);
    localStorage.setItem('accounts', JSON.stringify(updatedAccounts));
    message.success(`Account ${newAccountIndex + 1} created successfully!`);
  };

  useEffect(() => {
    const storedMnemonic = localStorage.getItem('mnemonic');
    const storedAccounts = localStorage.getItem('accounts');

    if (storedMnemonic && storedAccounts) {
      setMnemonic(storedMnemonic);
      setAccounts(JSON.parse(storedAccounts));
    } else {
      genMnemonic();
    }
  }, []);

  const handleCardClick = (account: Account) => {
    console.log('Card clicked, dispatching actions with values:', {
      ethPrivateKey: account.ethereumWallet.ethereumPrivateKey,
      ethPublicKey: account.ethereumWallet.ethereumAddress,
      solPrivateKey: account.solanaWallet.solanaSecretKey,
      solPublicKey: account.solanaWallet.solanaPublicKey,
    });

    let epk = account.ethereumWallet.ethereumPrivateKey;
    let esk = account.solanaWallet.solanaSecretKey;
    let ead = account.ethereumWallet.ethereumAddress;
    let spk = account.solanaWallet.solanaPublicKey;

    let keys = {
      ethPrivateKey: epk,
      ethPublicKey: ead,
      solPrivateKey: esk,
      solPublicKey: spk,
    };

    dispatch(setkeys(keys));

    router.push("/interact");
  };

  return (
    <div style={{ marginTop: "-900px" }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 style={{ color: "white", marginTop: "50px", fontSize: "80px" }}>HD Wallet with Accounts</h1>
        
        {/* Seed Phrase Card */}
        <Row gutter={[16, 16]} style={{ marginBottom: "60px" }}>
          <Col span={24}>
            <Card style={{ width: 1300, margin: 'auto', padding: '20px', borderRadius: '10px', background: '#121322', borderColor: "black" }}>
              <Title style={{ textAlign: 'center', marginBottom: '20px', fontSize: "50px", color: "white" }}>Your Seed Phrase</Title>
              <Divider />
              <Row gutter={[16, 16]} justify="center" align="middle">
                {mnemonic.split(" ").map((word, index) => (
                  <Col span={6} key={index}>
                    <Card style={{ backgroundColor: "#000324", border: "none" }}>
                      <Text style={{ fontSize: "20px", color: "white" }} strong>{index + 1}. </Text>
                      <Text style={{ fontSize: "20px", color: "white" }}>{word}</Text>
                    </Card>
                  </Col>
                ))}
              </Row>
              <h3 onClick={() => { navigator.clipboard.writeText(mnemonic).then(() => { message.success("Seed Phrase Copied") })}} 
                  style={{ margin: "0px", marginLeft: "10px", marginTop: "20px", color: "white" }}>
                Click here to copy <CopyOutlined/>
              </h3>
            </Card>
          </Col>
          
          {/* Action Buttons */}
          <Col span={24}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '1300px', margin: '10px auto', boxSizing: "border-box" }}>
              <Button style={{ width: "600px", padding: "30px 0px", fontSize: "23px", backgroundColor: "red", color: "white", borderRadius: "30px", border: "black" }} 
                      onClick={genMnemonic}>
                Generate New Seed
              </Button>
              <Button style={{ width: "600px", padding: "30px 0px", fontSize: "23px", backgroundColor: "white", color: "black", borderRadius: "30px" }}
                      onClick={createNewAccount}>
                Create New Account
              </Button>
            </div>
          </Col>
        </Row>

        {/* Display Accounts */}
        {accounts.map((account) => (
          <Card key={account.id}
                onClick={() => handleCardClick(account)}
                style={{ width: 1300, marginBottom: "20px", backgroundColor: "#121322", border: "2px solid black" }}>
            <Title style={{ fontSize: "40px", color: "white", marginLeft: "30px" }}>{account.name}</Title>
            
            {/* Ethereum Wallet */}
            <Card style={{ backgroundColor: "#c70300", marginBottom: "20px", padding: "20px", border: "none", borderRadius: "20px" }}>
              <Flex align="center">
                <Avatar src={eth.src} size={40} style={{ marginRight: "10px" }} />
                <Title level={3} style={{ color: "white", margin: 0 }}>Ethereum Wallet</Title>
              </Flex>
              <p style={{ fontSize: "20px", color: "white" }}>Address: {account.ethereumWallet.ethereumAddress}</p>
              <p style={{ fontSize: "16px", color: "white" }}>Private Key: {account.ethereumWallet.ethereumPrivateKey}</p>
            </Card>
            
            {/* Solana Wallet */}
            <Card style={{ backgroundColor: "#9300b0", padding: "20px", border: "none", borderRadius: "20px" }}>
              <Flex align="center">
                <Avatar src={sol.src} size={40} style={{ marginRight: "10px" }} />
                <Title level={3} style={{ color: "white", margin: 0 }}>Solana Wallet</Title>
              </Flex>
              <p style={{ fontSize: "20px", color: "white" }}>Public Key: {account.solanaWallet.solanaPublicKey}</p>
              <p style={{ fontSize: "16px", color: "white" }}>Secret Key: {account.solanaWallet.solanaSecretKey}</p>
            </Card>
          </Card>
        ))}
      </div>
    </div>
  );
}