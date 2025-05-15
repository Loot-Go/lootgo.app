import { Request, Response } from "express";
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { UseRandomness } from "./use_randomness";
import { clusterApiUrl, Connection, Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import idl from "./idl.json";

const getKeypairFromString = (secretKeyString: string) => {
  let decodedSecretKey: Uint8Array;
  try {
    decodedSecretKey = bs58.decode(secretKeyString);
  } catch (throwObject) {
    throw new Error("Invalid secret key! See README.md");
  }
  return Keypair.fromSecretKey(decodedSecretKey);
};

export async function Vrf(_req: Request, res: Response) {
  try {
    // Setup connection
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // Setup wallet using private key from environment variable
    const privateKey = process.env.SOLANA_WALLET_PRIVATE_KEY;
    if (!privateKey)
      throw new Error("WALLET_PRIVATE_KEY environment variable is required");
    const wallet = new anchor.Wallet(getKeypairFromString(privateKey));

    // Create provider
    const provider = new anchor.AnchorProvider(connection, wallet, {});
    anchor.setProvider(provider);

    const program = new anchor.Program(idl, provider) as Program<UseRandomness>;

    const randomSeed = Math.floor(Math.random() * 256);
    const tx = await program.methods.requestRandomness(randomSeed).rpc();

    return res.status(200).json({
      tx: tx,
      publicKey: provider.wallet.publicKey.toString(),
    });
  } catch (e: any) {
    console.error("Error:", e);
    return res.status(500).json({
      message: e.message || "Internal server error",
    });
  }
}
