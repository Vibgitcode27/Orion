import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";

export const generateSolanaKeypairAndSignMessage = (message: string) => {
  // Generate a new keypair
  const keypair = Keypair.generate();

  // Extract the public and private keys
  const publicKey = keypair.publicKey.toString();
  const secretKey = keypair.secretKey;

  // Convert the message to a Uint8Array
  const encodedMessage = new TextEncoder().encode(message);

  // Sign the message
  const signature = nacl.sign.detached(encodedMessage, secretKey);
  const isValid = nacl.sign.detached.verify(
    encodedMessage,
    signature,
    keypair.publicKey.toBytes()
  );

  return {
    publicKey,
    secretKey: secretKey.toString(),
    isValid,
  };
};
