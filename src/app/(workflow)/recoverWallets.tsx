import { useState } from "react";
import { mnemonicToSeedSync } from "bip39";
import { Keypair } from "@solana/web3.js";
import { Row, Col, Input, Button } from "antd";
import { BIP32Factory } from "bip32";
import ecc from '@bitcoinerlab/secp256k1';
import { ethers } from 'ethers';

export default function RecoverWallets() {
  const [mnemonic, setMnemonic] = useState<string>("");
  const [wallets, setWallets] = useState<{ solanaPublicKey: string; solanaSecretKey: string; ethereumPublicKey: string; ethereumSecretKey: string }[]>([]);

  const bip32 = BIP32Factory(ecc);
  const recoverWallets = () => {
    if (!mnemonic) return;

    const seed = mnemonicToSeedSync(mnemonic);
    const root = bip32.fromSeed(seed);
    const recoveredWallets = [];

    // Derive multiple wallets (let's say we recover the first 5)
    for (let i = 0; i < 5; i++) {
      // BIP-44 path for Solana: m/44'/501'/{account}'/0'
      const solanaPath = `m/44'/501'/0'`;
      const solanaChild = root.derivePath(solanaPath);
      const solanaKeypair = Keypair.fromSeed(solanaChild.privateKey.slice(0, 32));

      // BIP-44 path for Ethereum: m/44'/60'/0'/0/{index}
      const ethPath = `m/44'/60'/1'/0/0`;
      const ethChild = root.derivePath(ethPath);
      const ethPublicKey = ethers.hexlify(ethChild.publicKey).slice(2);
      const ethSecretKey = ethers.hexlify(ethChild.privateKey);

      recoveredWallets.push({
        solanaPublicKey: solanaKeypair.publicKey.toBase58(),
        solanaSecretKey: Buffer.from(solanaKeypair.secretKey).toString("hex"),
        ethereumPublicKey: ethPublicKey,
        ethereumSecretKey: ethSecretKey,
      });
    }

    setWallets(recoveredWallets);
  };

  return (
    <>
      <h2>Recover Wallets</h2>
      <Input
        placeholder="Enter your seed phrase (mnemonic)"
        value={mnemonic}
        onChange={(e) => setMnemonic(e.target.value)}
      />
      <Button onClick={recoverWallets} type="primary">
        Recover Wallets
      </Button>

      {wallets.length > 0 && (
        <Row gutter={[16, 16]}>
          {wallets.map((wallet, index) => (
            <Col key={index} span={24}>
              <h3>Wallet {index + 1}</h3>
              <p><strong>Solana Public Key:</strong> {wallet.solanaPublicKey}</p>
              <p><strong>Solana Secret Key (Hex):</strong> {wallet.solanaSecretKey}</p>
              <p><strong>Ethereum Public Key:</strong> {wallet.ethereumPublicKey}</p>
              <p><strong>Ethereum Secret Key (Hex):</strong> {wallet.ethereumSecretKey}</p>
            </Col>
          ))}
        </Row>
      )}
    </>
  );
}