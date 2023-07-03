use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint,Token, TokenAccount, Transfer};

use crate::{
    _main::main_state::MainState, 
    constants::{
        SEED_MAIN_STATE, 
        SEED_OFFER
    }, 
    offer::offer_state::OfferState, 
    utils::{transfer_token_from_offeror_state, transfer_token}, error::MyError, events
};

#[derive(AnchorSerialize, AnchorDeserialize,  Default,Clone, Copy, Debug)]
pub struct EditOfferInput{
    inc_received_token_amount: Option<u64>, 
    dec_received_token_amount: Option<u64>
}

pub fn edit_offer(ctx:Context<AEditOffer>, input: EditOfferInput) ->Result<()>{
    let offeror = ctx.accounts.offeror.to_account_info();
    let offer_state = &mut ctx.accounts.offer_state_account;
    let token_program = ctx.accounts.token_program.to_account_info();
    let main_state = &ctx.accounts.main_state_account;

    if !offer_state.is_active {
        return anchor_lang::err!(MyError::OfferNotActive);
    }

    if let Some(amount) = input.inc_received_token_amount.clone() {
        offer_state.requested_amount += amount;
    }

    if let Some(amount) = input.dec_received_token_amount.clone() {
        offer_state.requested_amount -= amount;
        if offer_state.requested_amount == 0{
            return anchor_lang::err!(MyError::ZeroRequestedAmount);
        }
    }

    emit!(events::OfferUpdated{
        offer_id: ctx.accounts.offer_state_account.key(),
        inc_requested_amount: input.inc_received_token_amount,
        dec_requested_amount: input.dec_received_token_amount,
    });
    Ok(())
}


#[derive(Accounts)]
pub struct AEditOffer<'info>{
    pub offeror:Signer<'info>,

    ///CHECK:
    pub offered_token: AccountInfo<'info>,
    ///CHECK:
    pub requested_token: AccountInfo<'info>,

    #[account(
        seeds = [SEED_MAIN_STATE],
        bump,
    )]
    pub main_state_account: Account<'info, MainState>,

    #[account(
        mut,
        seeds = [
            SEED_OFFER, 
            offer_state_account.offeror.as_ref(),
            offered_token.key().as_ref(),
            requested_token.key().as_ref(),
        ],
        bump,
    )]
    pub offer_state_account: Account<'info, OfferState>,

    pub token_program: Program<'info, Token>,
}
