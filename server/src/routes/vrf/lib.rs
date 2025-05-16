use anchor_lang::prelude::*;
use ephemeral_vrf_sdk::anchor::vrf;
use ephemeral_vrf_sdk::instructions::{create_request_randomness_ix, RequestRandomnessParams};
use ephemeral_vrf_sdk::types::SerializableAccountMeta;

declare_id!("CXGh7AwHyRn6Y2iZBAd9yf8LHtigPgrtcu2661311MQC");

pub const USER: &[u8] = b"userd";

#[program]
pub mod random_no_generator {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!(
            "Initializing user account: {:?}",
            ctx.accounts.user.key()
        );
        Ok(())
    }

    pub fn get_number(ctx: Context<RandNoGeneratorCtx>, client_seed: u8) -> Result<()> {
        msg!("Requesting randomness...");
        let ix = create_request_randomness_ix(RequestRandomnessParams {
            payer: ctx.accounts.payer.key(),
            oracle_queue: ctx.accounts.oracle_queue.key(),
            callback_program_id: ID,
            callback_discriminator: instruction::CallbackGetNumber::DISCRIMINATOR.to_vec(),
            caller_seed: [client_seed; 32],
            // Specify any account that is required by the callback
            accounts_metas: Some(vec![SerializableAccountMeta {
                pubkey: ctx.accounts.user.key(),
                is_signer: false,
                is_writable: true,
            }]),
            ..Default::default()
        });
        ctx.accounts
            .invoke_signed_vrf(&ctx.accounts.payer.to_account_info(), &ix)?;
        Ok(())
    }

    pub fn callback_get_number(
        ctx: Context<CallbackRandNoGeneratorCtx>,
        randomness: [u8; 32],
    ) -> Result<()> {
        let rnd_u8 = ephemeral_vrf_sdk::rnd::random_u8_with_range(&randomness, 1, 100);
        msg!("Consuming random number: {:?}", rnd_u8);
        let user = &mut ctx.accounts.user;
        user.last_result = rnd_u8;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(init_if_needed, payer = payer, space = 8 + 1, seeds = [USER, payer.key().to_bytes().as_slice()], bump)]
    pub user: Account<'info, User>,
    pub system_program: Program<'info, System>,
}

#[vrf]
#[derive(Accounts)]
pub struct RandNoGeneratorCtx<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(seeds = [USER, payer.key().to_bytes().as_slice()], bump)]
    pub user: Account<'info, User>,
    /// CHECK: The oracle queue
    #[account(mut, address = ephemeral_vrf_sdk::consts::DEFAULT_QUEUE)]
    pub oracle_queue: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct CallbackRandNoGeneratorCtx<'info> {
    /// This check ensure that the vrf_program_identity (which is a PDA) is a singer
    /// enforcing the callback is executed by the VRF program trough CPI
    #[account(address = ephemeral_vrf_sdk::consts::VRF_PROGRAM_IDENTITY)]
    pub vrf_program_identity: Signer<'info>,
    #[account(mut)]
    pub user: Account<'info, User>,
}

#[account]
pub struct User {
    pub last_result: u8,
}