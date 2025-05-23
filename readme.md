# LootGO – The Real-World Crypto Treasure Hunt

<img width="1255" alt="Screenshot 2025-05-12 at 11 51 23" src="https://github.com/user-attachments/assets/223f8890-0a73-4f74-b626-c2a82f4a3df4" />

LootGO – The Real-World Crypto Treasure Hunt, aka. PokémonGO with crypto rewards

Turn your daily steps into loot.

Walk around IRL, collect and open lootboxes for memecoins, raffle tickets, whitelist spots, and more — all while becoming healthier and wealthier!

LootGO’s gameplay powers “location-based airdrops” — creating a powerful distribution channel for crypto projects and retail brands through direct, on-the-ground user engagement.

## 1. Repositories & Demo Apps

| Purpose                    | Link                                                                                                            |
| -------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Main hackathon repo**    | https://github.com/loot-Go/lootgo.app (Public)                                                                  |
| **Treasure hunt repo**     | https://github.com/Loot-Go/lootgo-app/tree/feat/solana-wallets (Private, contact yuki@beyondclub.xyz to access) |
| **Treasure hunt api repo** | https://github.com/Loot-Go/lootgo-api/tree/feat/solana-wallets (Private, contact yuki@beyondclub.xyz to access) |
| iOS TestFlight             | [TestFlight](https://testflight.apple.com/join/57xWEm9G)                                                        |
| Android APK                | [Download APK](https://drive.google.com/file/d/1qHxmlSulMRBMjJ8Eh30KRGGJNCJe9q-R/view?usp=sharing)              |
| Invite Code                | `1000x`                                                                                                         |

## 2. Architecture Overview

| Layer              | Tech                                                           | What It Does                                                                                 |
| ------------------ | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **Mobile**         | React Native + Expo                                            | Native performance, fast iteration                                                           |
| **Onboarding**     | Privy                                                          | Email login with embedded wallet. Power users can connect with Solana Mobile Wallet Adapter. |
| **Core Game Loop** | Geo-triggers → Lootbox smart contract                          | Walking spawns / opens lootboxes → on-chain reward events                                    |
| **Randomness**     | MagicBlock Ephemeral VRF                                       | Verifiable randomness for rewards and lootbox spawns                                         |
| **Rewards**        | 1. SPL tokens (ZK Compression) 2. cPOP tokens 3. Metaplex NFTs | Token, proof-of-participation, and collectible rewards                                       |
| **Scaling**        | ZK Compression                                                 | Stores rewards in Merkle trees; no upfront rent needed                                       |
| **Trading**        | Jupiter + Wormhole + The Graph                                 | In-app SOL swaps and cross-chain swap                                                        |

## 3. Track-Specific Submissions

### 3-1. ZK Compression

Scalable token drops & cPOP

- Micro-rewards at scale – Lootbox SPL rewards are logged in a compressed Merkle tree; players claim and decompress on demand, skipping rent-exempt ATA creation.

- cPOP – Any event/brand can issue compressed proof-of-participation tokens directly on our map.

Token Contract Address :

AL5XFoQwkPoRcybziPenQWTYi95hq1KGfiZyBCLtsRgj

72GUif1vsb9L7e5iuxboVxSKsD6UXnnD7kjnYv4bXekU

Token Decompression     : https://github.com/Loot-Go/lootgo.app/blob/main/web/lib/token-decompress.ts 

Compressed Token Airdrop: https://github.com/Loot-Go/lootgo.app/blob/main/web/lib/solana-drop.ts

cPOP Dashboard link ▶ https://lootgo-cpop.vercel.app

Sample Transaction of decompression ▶ https://solscan.io/tx/2pnqG8JCWhZu7veDDgUFf2CWk9CGnnJcPK931y6ySXPDwQ9WDjLrPvgr9DRfP8hk487jsZFCWXCsSSysBqis16sy?cluster=devnet

### 3-2. MagicBlock VRF

Provable randomness everywhere

* Token amount (We integrated VRF to this first)
* Lootbox rarity
* Reward token selection
* Spawn coordinates
* Raffle winner selection

Number Selection:  https://github.com/Loot-Go/lootgo.app/blob/main/web/lib/random-number.ts

VRF ▶ https://solscan.io/account/CXGh7AwHyRn6Y2iZBAd9yf8LHtigPgrtcu2661311MQC?cluster=devnet

### 3-3. Metaplex

Instant NFT airdrops
Milestone badges, cosmetics, limited collectibles.

https://github.com/Loot-Go/lootgo.app/blob/main/web/app/api/mint_nft/route.ts

### 3-4. Jupiter

In-app Solana swaps
Users trade memecoins without leaving LootGO.


### 3-5. Wormhole + The Graph

Cross-chain swaps & surprise bonuses

Walk-to-earn on any chain → swap to SOL via Mayan Swift.
Transaction history is indexed with Substreams; glowing rows signal hidden prizes (extra BONK, NFTs, etc.).


Subgraph: https://github.com/Loot-Go/lootgo.app/blob/main/substreams/lootgo_wormhole_streams/subgraph/subgraph.yaml 

Substreams: https://github.com/Loot-Go/lootgo.app/blob/main/substreams/lootgo_wormhole_streams/substreams.yaml

Sample Transaction ▶ 
https://wormholescan.io/#/tx/4Pnte2ESg436woZmDFsLnrPrVhuNCrEFA1iwnCrwumr1zb4cXDFtWcxmdb7YNipq2joUmh7My3StLvyYihVAjHHA?network=Mainnet

Substreams Package ▶ 
https://earn.superteam.fun/listing/indexing-the-graph-substreams-on-solana/
