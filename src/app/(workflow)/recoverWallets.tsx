import { useState } from "react";
import { mnemonicToSeedSync } from "bip39";
import { Keypair } from "@solana/web3.js";
import { Row, Col, Input, Button } from "antd";
import { BIP32Factory } from "bip32";
import ecc from '@bitcoinerlab/secp256k1';
import { ethers } from 'ethers';
import { derivePath } from "ed25519-hd-key";

export default function RecoverWallets() {
  const [mnemonic, setMnemonic] = useState("");
  const [wallets, setWallets] = useState<{ solanaPublicKey: string; solanaSecretKey: string; ethereumAddress: string; ethereumPrivateKey: string }[]>([]);

  const bip32 = BIP32Factory(ecc);

  const recoverWallets = () => {
    if (!mnemonic) return;

    const seed = mnemonicToSeedSync(mnemonic);
    const root = bip32.fromSeed(seed);
    const recoveredWallets = [];

    // Derive multiple wallets (let's say we recover the first 5)
    for (let i = 0; i < 5; i++) {
      // Solana wallet derivation
      const solanaPath = `m/44'/501'/${i}'/0'`;
      const { key: solanaPrivateKey } = derivePath(solanaPath, seed.toString('hex'));
      const solanaKeypair = Keypair.fromSeed(Uint8Array.from(solanaPrivateKey));

      // Ethereum wallet derivation
      const ethPath = `m/44'/60'/0'/0/${i}`;
      const ethChild = root.derivePath(ethPath);
      const ethPrivateKey = ethers.hexlify(ethChild.privateKey);
      const ethWallet = new ethers.Wallet(ethPrivateKey);

      recoveredWallets.push({
        solanaPublicKey: solanaKeypair.publicKey.toBase58(),
        solanaSecretKey: Buffer.from(solanaKeypair.secretKey).toString("hex"),
        ethereumAddress: ethWallet.address,
        ethereumPrivateKey: ethPrivateKey,
      });
    }

    setWallets(recoveredWallets);
  };

  return (
    <>
      <h1>Recover Wallets</h1>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Input
            placeholder="Enter your mnemonic phrase"
            onChange={(e) => setMnemonic(e.target.value)}
          />
        </Col>
        <Col span={24}>
          <Button onClick={recoverWallets}>
            Recover Wallets
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
    </>
  );
}