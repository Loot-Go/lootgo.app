/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/random_no_generator.json`.
 */
export type RandomNoGenerator = {
  address: "CXGh7AwHyRn6Y2iZBAd9yf8LHtigPgrtcu2661311MQC";
  metadata: {
    name: "randomNoGenerator";
    version: "0.1.0";
    spec: "0.1.0";
    description: "Created with Anchor";
  };
  instructions: [
    {
      name: "callbackGetNumber";
      discriminator: [10, 222, 166, 137, 151, 176, 85, 159];
      accounts: [
        {
          name: "vrfProgramIdentity";
          docs: [
            "This check ensure that the vrf_program_identity (which is a PDA) is a singer",
            "enforcing the callback is executed by the VRF program trough CPI"
          ];
          signer: true;
          address: "9irBy75QS2BN81FUgXuHcjqceJJRuc9oDkAe8TKVvvAw";
        },
        {
          name: "user";
          writable: true;
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
      name: "getNumber";
      discriminator: [124, 80, 118, 168, 236, 13, 221, 220];
      accounts: [
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "user";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [117, 115, 101, 114, 100];
              },
              {
                kind: "account";
                path: "payer";
              }
            ];
          };
        },
        {
          name: "oracleQueue";
          writable: true;
          address: "Cuj97ggrhhidhbu39TijNVqE74xvKJ69gDervRUXAxGh";
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
    },
    {
      name: "initialize";
      discriminator: [175, 175, 109, 31, 13, 152, 155, 237];
      accounts: [
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "user";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [117, 115, 101, 114, 100];
              },
              {
                kind: "account";
                path: "payer";
              }
            ];
          };
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        }
      ];
      args: [];
    }
  ];
  accounts: [
    {
      name: "user";
      discriminator: [159, 117, 95, 227, 239, 151, 58, 236];
    }
  ];
  types: [
    {
      name: "user";
      type: {
        kind: "struct";
        fields: [
          {
            name: "lastResult";
            type: "u8";
          }
        ];
      };
    }
  ];
};
