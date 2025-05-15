/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/use_randomness.json`.
 */
export type UseRandomness = {
  address: "CDiutifqugEkabdqwc5TK3FmSAgFpkP3RPE1642BCEhi";
  metadata: {
    name: "useRandomness";
    version: "0.1.0";
    spec: "0.1.0";
    description: "Created with Anchor";
  };
  instructions: [
    {
      name: "consumeRandomness";
      discriminator: [190, 217, 49, 162, 99, 26, 73, 234];
      accounts: [
        {
          name: "vrfProgramIdentity";
          docs: ["Signer PDA of the VRF program"];
          signer: true;
          address: "9irBy75QS2BN81FUgXuHcjqceJJRuc9oDkAe8TKVvvAw";
        }
      ];
      args: [
        {
          name: "randomness";
          type: {
            array: ["u8", 32];
          };
        }
      ];
    },
    {
      name: "requestRandomness";
      discriminator: [213, 5, 173, 166, 37, 236, 31, 18];
      accounts: [
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "programIdentity";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [105, 100, 101, 110, 116, 105, 116, 121];
              }
            ];
          };
        },
        {
          name: "oracleQueue";
          writable: true;
          address: "GKE6d7iv8kCBrsxr78W3xVdjGLLLJnxsGiuzrsZCGEvb";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
        {
          name: "slotHashes";
          address: "SysvarS1otHashes111111111111111111111111111";
        },
        {
          name: "vrfProgram";
          address: "Vrf1RNUjXmQGjmQrQLvJHs9SNkvDJEsRVFPkfSQUwGz";
        }
      ];
      args: [
        {
          name: "clientSeed";
          type: "u8";
        }
      ];
    },
    {
      name: "simplerRequestRandomness";
      discriminator: [191, 234, 209, 68, 56, 199, 221, 4];
      accounts: [
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "oracleQueue";
          writable: true;
          address: "GKE6d7iv8kCBrsxr78W3xVdjGLLLJnxsGiuzrsZCGEvb";
        },
        {
          name: "programIdentity";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [105, 100, 101, 110, 116, 105, 116, 121];
              }
            ];
          };
        },
        {
          name: "vrfProgram";
          address: "Vrf1RNUjXmQGjmQrQLvJHs9SNkvDJEsRVFPkfSQUwGz";
        },
        {
          name: "slotHashes";
          address: "SysvarS1otHashes111111111111111111111111111";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        }
      ];
      args: [
        {
          name: "clientSeed";
          type: "u8";
        }
      ];
    }
  ];
};
