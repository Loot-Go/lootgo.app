import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import bs58 from "bs58";
import idl from "./idl.json";
import { RandomNoGenerator } from "./random_no_generator";

const getKeypairFromString = (secretKeyString: string) => {
  let decodedSecretKey: Uint8Array;
  try {
    decodedSecretKey = bs58.decode(secretKeyString);
  } catch {
    throw new Error("Invalid secret key! See README.md");
  }
  return Keypair.fromSecretKey(decodedSecretKey);
};

interface GenerateRandomNumberResult {
  randomNo: number | undefined;
  tx: string | undefined;
}

export async function generateRandomNumber(): Promise<GenerateRandomNumberResult> {
  try {
    const connection = new Connection(
      "https://rpc.magicblock.app/devnet",
      "confirmed"
    );

    const privateKey = process.env.SOLANA_WALLET_PRIVATE_KEY;
    if (!privateKey)
      throw new Error(
        "SOLANA_WALLET_PRIVATE_KEY environment variable is required"
      );
    const keypair = getKeypairFromString(privateKey);

    const provider = new anchor.AnchorProvider(
      connection,
      {
        publicKey: keypair.publicKey,
        signTransaction: async <T extends Transaction | VersionedTransaction>(
          transaction: T
        ): Promise<T> => {
          // @ts-expect-error - Known type mismatch with Solana web3.js
          transaction.sign(keypair);
          return transaction;
        },
        signAllTransactions: async <
          T extends Transaction | VersionedTransaction
        >(
          transactions: T[]
        ): Promise<T[]> => {
          for (const tx of transactions) {
            // @ts-expect-error - Known type mismatch with Solana web3.js
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

    account = await connection.getAccountInfo(userPk);
    let randomNo = undefined;

    if (account) {
      const user = program.coder.accounts.decode("user", account.data);
      randomNo = user.lastResult;
    }

    console.log("randomNo", randomNo);
    console.log("tx", tx);

    return {
      randomNo,
      tx,
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      randomNo: undefined,
      tx: undefined,
    };
  }
}
