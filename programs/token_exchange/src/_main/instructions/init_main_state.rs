use crate::{
    _main::main_state::{MainState, MainStateInput},
    constants::SEED_MAIN_STATE,
};
use anchor_lang::prelude::*;

pub fn init_main_state(ctx: Context<AInitMainState>, input: MainStateInput) -> Result<()> {
    let state = &mut ctx.accounts.main_state_account;
    state.owner = ctx.accounts.owner.key();
    input.set_value(state);

    Ok(())
}

#[derive(Accounts)]
pub struct AInitMainState<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        init,
        payer= owner,
        seeds=[SEED_MAIN_STATE],
        bump,
        space = 8 + MainState::MAX_SIZE,

    )]
    pub main_state_account: Account<'info, MainState>,

    pub system_program: Program<'info, System>,
}
