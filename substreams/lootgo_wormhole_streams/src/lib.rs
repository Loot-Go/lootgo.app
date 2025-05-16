mod pb;
use pb::{mydata::v1 as mydata, sf::substreams::solana::v1::Transactions};
use std::str::FromStr;

const TARGET_PROGRAM: &str = "BLZRi6frs4X4DNLw56V4EXai1b6QVESN1BhHBTYM9VcY";
const TARGET_LOG: &str = "Settle";
const TARGET_SIGNER: &str = "JByXXfWNAUikabAW49n2TpnDWFouCUS7h6bzPjxRNY3j";

#[substreams::handlers::map]
fn map_my_data(transactions: Transactions) -> mydata::MyData {
    let mut my_data = mydata::MyData::default();
    
    // Early optimization: if we have no transactions, return empty data
    if transactions.transactions.is_empty() {
        return my_data;
    }
    
    println!("Processing block with {} transactions", transactions.transactions.len());
    
    // Filter transactions for our target program, log message, and signer
    for tx in &transactions.transactions {
        if let Some(transaction) = &tx.transaction {
            if let Some(message) = &transaction.message {
                // Fast path: Early check if transaction involves our target signer
                let has_target_signer = if !TARGET_SIGNER.is_empty() {
                    message.account_keys.iter().any(|key| {
                        let pubkey = bs58::encode(key).into_string();
                        pubkey == TARGET_SIGNER
                    })
                } else {
                    true // No signer filter applied if TARGET_SIGNER is empty
                };
                
                // Skip if target signer is not involved in this transaction
                if !has_target_signer {
                    continue;
                }

                // Check if this transaction involves our target program
                let involves_target_program = message.instructions.iter().any(|ix| {
                    if let Some(program_id) = message.account_keys.get(ix.program_id_index as usize) {
                        let program_id_str = bs58::encode(program_id).into_string();
                        program_id_str == TARGET_PROGRAM
                    } else {
                        false
                    }
                });

                if involves_target_program {
                    // Check logs for "Settle"
                    if let Some(meta) = &tx.meta {
                        if meta.log_messages.iter().any(|log| log.contains(TARGET_LOG)) {
                            println!("\nFound Settle transaction!");
                            
                            // Print transaction signature
                            if let Some(signature) = transaction.signatures.first() {
                                println!("Transaction signature: {}", bs58::encode(signature).into_string());
                            }
                            
                            // Print signer information
                            if let Some(first_account) = message.account_keys.first() {
                                println!("Transaction sender: {}", bs58::encode(first_account).into_string());
                            }
                            
                            // Print account that matched our TARGET_SIGNER (if different from sender)
                            if !TARGET_SIGNER.is_empty() {
                                for (i, key) in message.account_keys.iter().enumerate() {
                                    let pubkey = bs58::encode(key).into_string();
                                    if pubkey == TARGET_SIGNER {
                                        println!("Found target account at index {}: {}", i, pubkey);
                                        
                                        // Additional context about this account's role in the transaction
                                        if i < message.header.num_required_signatures as usize {
                                            println!("  Role: Signer");
                                        } else if i < (message.header.num_required_signatures as usize + message.header.num_readonly_signed_accounts as usize) {
                                            println!("  Role: Read-only signer");
                                        } else {
                                            println!("  Role: Non-signer account");
                                        }
                                        
                                        break;
                                    }
                                }
                            }

                            // Print logs
                            println!("\nTransaction logs:");
                            for log in &meta.log_messages {
                                println!("Log: {}", log);
                            }

                            // Add the transaction to our output
                            my_data.transactions.push(tx.clone());
                        }
                    }
                }
            }
        }
    }

    my_data
}