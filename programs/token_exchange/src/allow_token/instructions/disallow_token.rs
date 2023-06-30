use anchor_lang::prelude::*;
use anchor_spl::token::Mint;

use crate::{
    _main::main_state::MainState,
    allow_token::allowd_token_state::AllowedTokenState,
    constants::{SEED_ALLOWED_TOKEN, SEED_MAIN_STATE},
    error::MyError,
    events,
};

pub fn disallow_token(ctx: Context<ADisAllowToken>) -> Result<()> {
    let state = &mut ctx.accounts.allow_token_state_account;
    state.is_allowed = false;

    emit!(events::TokenDisAllowed {
        token_id: ctx.accounts.token.key()
    });
    Ok(())
}

#[derive(Accounts)]
pub struct ADisAllowToken<'info> {
    #[account(
        mut,
        address = main_state.owner @ MyError::OnlyOwnerCanCall
    )]
    pub owner: Signer<'info>,

    pub token: Account<'info, Mint>,

    #[account(
        seeds = [SEED_MAIN_STATE],
        bump,
    )]
    pub main_state: Account<'info, MainState>,

    #[account(
        mut,
        close = owner,
        seeds = [SEED_ALLOWED_TOKEN, token.key().as_ref()],
        bump,
    )]
    pub allow_token_state_account: Account<'info, AllowedTokenState>,

    pub system_program: Program<'info, System>,
}
