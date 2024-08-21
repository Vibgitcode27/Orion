import { useEffect, useState } from "react";
import { generateMnemonic, mnemonicToSeedSync } from "bip39";
import { Row, Col, Button } from "antd";
import { Keypair } from "@solana/web3.js";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setSeed } from "@/lib/features/seed/seedSlice";
import { BIP32Factory } from "bip32";
import ecc from '@bitcoinerlab/secp256k1';
import { ethers } from 'ethers';
import { derivePath } from "ed25519-hd-key";

export default function GenSeed() {
  const dispatch = useAppDispatch();
  
  const [mnemonic, setMnemonic] = useState<string>("");
  const [wallets, setWallets] = useState<{ solanaPublicKey: string; solanaSecretKey: string; ethereumAddress: string; ethereumPrivateKey: string }[]>([]);

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
      const ethPrivateKey = ethers.hexlify(ethChild.privateKey);
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
    <>
      <h1>Generate Seed and Wallets</h1>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <p><strong>Mnemonic:</strong> {mnemonic}</p>
        </Col>
        <Col span={24}>
          <Button onClick={genMnemonic}>
            Generate New Mnemonic and Wallets
          </Button>
        </Col>
      </Row>
      {wallets.length > 0 && (
        <Row gutter={[16, 16]}>
          {wallets.map((wallet, index) => (
            <Col span={24} key={index}>
              <h2>Wallet {index + 1}</h2>
              <p><strong>Solana Public Key:</strong> {wallet.solanaPublicKey}</p>
              <p><strong>Solana Secret Key (Hex):</strong> {wallet.solanaSecretKey}</p>
              <p><strong>Ethereum Address:</strong> {wallet.ethereumAddress}</p>
              <p><strong>Ethereum Private Key:</strong> {wallet.ethereumPrivateKey}</p>
            </Col>
          ))}
        </Row>
      )}
      <p><strong>Redux Seed (Hex):</strong> {reduxSeed?.toString("hex")}</p>
    </>
  );
}