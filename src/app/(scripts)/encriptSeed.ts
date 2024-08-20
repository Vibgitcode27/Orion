import crypto from "crypto";
import fs from "fs";

const algorithm = "aes-256-cbc";
const key = crypto.randomBytes(32); // Replace with your secure key

const encryptedSeed = fs.readFileSync("encrypted_seed.txt", "utf8");
const [ivHex, encryptedHex] = encryptedSeed.split(":");

const iv = Buffer.from(ivHex, "hex");
const encryptedText = Buffer.from(encryptedHex, "hex");

const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
let decrypted = decipher.update(encryptedText);
decrypted = Buffer.concat([decrypted, decipher.final()]);

const seed = decrypted.toString();
console.log("Decrypted Seed:", seed);
