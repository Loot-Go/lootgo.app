import { Bytes, log } from "@graphprotocol/graph-ts";
import { Protobuf } from "as-proto/assembly";
import { MyEntity } from "../generated/schema";
import { MyData as protoMyData } from "./pb/mydata/v1/MyData";

export function handleTriggers(bytes: Uint8Array): void {
  const input = Protobuf.decode<protoMyData>(bytes, protoMyData.decode);

  // Process each transaction in the input
  for (let i = 0; i < input.transactions.length; i++) {
    const tx = input.transactions[i];

    if (tx.transaction && tx.transaction.signatures.length > 0) {
      // Use the first signature as the unique ID for the entity
      const signature = tx.transaction.signatures[0];
      const signatureHex = Bytes.fromUint8Array(signature).toHexString();

      let entity = new MyEntity(signatureHex);

      // Save the entity
      entity.save();

      log.info("Processed transaction with signature: {}", [signatureHex]);
    }
  }
}
