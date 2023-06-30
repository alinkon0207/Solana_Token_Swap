use anchor_lang::prelude::*;
use anchor_spl::token::Mint;

use crate::{
    _main::main_state::MainState,
    allow_token::allowd_token_state::AllowedTokenState,
    constants::{SEED_ALLOWED_TOKEN, SEED_MAIN_STATE},
    error::MyError, events,
};

pub fn allow_token(ctx: Context<AAllowToken>) -> Result<()> {
    let state = &mut ctx.accounts.allow_token_state_account;
    state.is_allowed = true;
    state.mint = ctx.accounts.token.key();

    emit!(events::TokenAllowed {
        token_id: ctx.accounts.token.key()
    });
    Ok(())
}

#[derive(Accounts)]
pub struct AAllowToken<'info> {
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
        init,
        payer = owner,
        seeds = [SEED_ALLOWED_TOKEN, token.key().as_ref()],
        bump,
        space = 8 + AllowedTokenState::MAX_SIZE,
    )]
    pub allow_token_state_account: Account<'info, AllowedTokenState>,

    pub system_program: Program<'info, System>,
}
