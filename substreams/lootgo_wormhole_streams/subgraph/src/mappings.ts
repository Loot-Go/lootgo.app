import { BigInt, Bytes, crypto, log } from "@graphprotocol/graph-ts";
import { Protobuf } from "as-proto/assembly";
import { MyEntity } from "../generated/schema";
import { MyData as protoMyData } from "./pb/mydata/v1/MyData";

const TARGET_PROGRAM = "BLZRi6frs4X4DNLw56V4EXai1b6QVESN1BhHBTYM9VcY";
const TARGET_LOG = "Settle";
const TARGET_SIGNER = "JByXXfWNAUikabAW49n2TpnDWFouCUS7h6bzPjxRNY3j";

export function handleTriggers(bytes: Uint8Array): void {
  try {
    const input = Protobuf.decode<protoMyData>(bytes, protoMyData.decode);
    
    // Process each transaction in the input
    for (let i = 0; i < input.transactions.length; i++) {
      const tx = input.transactions[i];
      
      // Generate a unique ID using the transaction signature
      const txSignature = tx.transaction?.signatures[0];
      if (!txSignature) continue;
      
      const inputHash = crypto.keccak256(Bytes.fromUint8Array(txSignature)).toHexString();
      
      // Create or load the entity
      let entity = MyEntity.load(inputHash);
      if (!entity) {
        entity = new MyEntity(inputHash);
      }

      // Map transaction data
      if (tx.transaction?.message) {
        const message = tx.transaction.message;
        
        // Set sender (first account)
        if (message.accountKeys.length > 0) {
          entity.sender = message.accountKeys[0].toBase58();
        }

        // Set transaction signature
        if (txSignature) {
          entity.transactionHash = txSignature.toBase58();
        }

        // Set block information
        if (tx.meta?.blockTime) {
          entity.blockTimestamp = BigInt.fromString(tx.meta.blockTime.toString());
        }

        // Set program ID
        entity.programId = TARGET_PROGRAM;

        // Set target signer
        entity.targetSigner = TARGET_SIGNER;

        // Set log messages
        if (tx.meta?.logMessages) {
          entity.logMessages = tx.meta.logMessages;
        }
      }

      // Save the entity
      entity.save();

      // Log successful processing
      log.info("Successfully processed Settle transaction: {}", [inputHash]);
    }
  } catch (error) {
    // Log any errors that occur during processing
    log.error("Error processing trigger: {}", [error.toString()]);
  }
}
