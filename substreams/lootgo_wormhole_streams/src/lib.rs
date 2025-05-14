mod pb;
use pb::{mydata::v1 as mydata, sf::substreams::solana::v1::Transactions};
use std::str::FromStr;

const TARGET_PROGRAM: &str = "BLZRi6frs4X4DNLw56V4EXai1b6QVESN1BhHBTYM9VcY";
const TARGET_LOG: &str = "Settle";

#[substreams::handlers::map]
fn map_my_data(transactions: Transactions) -> mydata::MyData {
    let mut my_data = mydata::MyData::default();
    
    println!("Processing block with {} transactions", transactions.transactions.len());
    
    // Filter transactions for our target program and log message
    for tx in &transactions.transactions {
        if let Some(transaction) = &tx.transaction {
            if let Some(message) = &transaction.message {
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

                            // Print all logs
                            println!("\nTransaction logs:");
                            for log in &meta.log_messages {
                                println!("Log: {}", log);
                            }

                            // Print token balances
                            if !meta.pre_token_balances.is_empty() {
                                println!("\nToken balances:");
                                for token_balance in &meta.pre_token_balances {
                                    println!("Token Balance - Mint: {}, Amount: {}", 
                                        token_balance.mint,
                                        token_balance.ui_token_amount.as_ref().map_or("N/A".to_string(), |amount| amount.ui_amount_string.clone())
                                    );
                                }
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
