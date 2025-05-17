export interface ConfirmedTransaction {
  transaction?: {
    message?: {
      accountKeys: Uint8Array[];
      header: {
        numRequiredSignatures: number;
        numReadonlySignedAccounts: number;
      };
    };
    signatures: Uint8Array[];
  };
  meta?: {
    logMessages: string[];
    blockTime: number;
  };
}

export interface MyData {
  transactions: ConfirmedTransaction[];
} 