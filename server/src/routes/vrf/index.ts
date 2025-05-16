import { Request, Response } from "express";
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { RandomNoGenerator } from "./random_no_generator";
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
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
    const connection = new Connection(
      "https://rpc.magicblock.app/devnet",
      "confirmed"
    );

    const privateKey = process.env.SOLANA_WALLET_PRIVATE_KEY;
    if (!privateKey)
      throw new Error("WALLET_PRIVATE_KEY environment variable is required");
    const keypair = getKeypairFromString(privateKey);
    const wallet = new anchor.Wallet(keypair);

    const provider = new anchor.AnchorProvider(
      connection,
      {
        publicKey: wallet.publicKey,
        signTransaction: async <T extends Transaction | VersionedTransaction>(
          transaction: T
        ): Promise<T> => {
          // @ts-ignore
          transaction.sign(keypair);
          return transaction;
        },
        signAllTransactions: async <
          T extends Transaction | VersionedTransaction
        >(
          transactions: T[]
        ): Promise<T[]> => {
          for (const tx of transactions) {
            // @ts-ignore
            tx.sign(keypair);
          }
          return transactions;
        },
      },
      anchor.AnchorProvider.defaultOptions()
    );

    const program = new anchor.Program(
      idl,
      provider
    ) as Program<RandomNoGenerator>;

    const userPk = PublicKey.findProgramAddressSync(
      [Buffer.from("userd"), provider.publicKey.toBytes()],
      program.programId
    )[0];
    let account = await connection.getAccountInfo(userPk);

    if (!account || !account.data || account.data.length === 0) {
      console.log("user account not found, creating new one...");
      const tx = await program.methods.initialize().rpc();
      console.log("User initialized with tx:", tx);
    }

    const randomSeed = Math.floor(Math.random() * 256);
    const tx = await program.methods.getNumber(randomSeed).rpc();

    let randomNo = undefined;

    account = await connection.getAccountInfo(userPk);
    if (account) {
      const user = program.coder.accounts.decode("user", account.data);
      randomNo = user.lastResult;
    }

    return res.status(200).json({
      randomNo: randomNo,
      tx: tx,
    });
  } catch (e: any) {
    console.error("Error:", e);
    return res.status(500).json({
      message: e.message || "Internal server error",
    });
  }
}
