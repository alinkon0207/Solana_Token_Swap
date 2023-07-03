use anchor_lang::prelude::*;
use anchor_spl::token::{self,Token,TokenAccount, Transfer};

use crate::{_main::main_state::MainState, constants::{SEED_MAIN_STATE, SEED_OFFER}, offer::offer_state::OfferState, utils::transfer_token_from_offeror_state, error::MyError, events};

pub fn close_offer(ctx: Context<ACloseOffer>)-> Result<()>{
    let offeror = ctx.accounts.offeror.to_account_info();
    let offeror_ata = ctx.accounts.offeror_ata.to_account_info();
    let offer_state = &mut ctx.accounts.offer_state_account;
    let offer_state_account_ata = ctx.accounts.offer_state_account_ata.to_account_info();
    let token_program = ctx.accounts.token_program.to_account_info();
    let main_state = &ctx.accounts.main_state_account;

    if(!offer_state.is_active) {
        return anchor_lang::err!(MyError::OfferNotActive);
    }

    //NOTE: Let token amount transfer back to the offeror
    if offer_state.offered_amount > 0 {
        transfer_token_from_offeror_state(
            offeror.to_account_info(), 
            offeror_ata, 
            offer_state, 
            offer_state_account_ata, 
            token_program, 
            offer_state.offered_amount
        )?;

        offer_state.re_init();
    }

    emit!(events::OfferRevoked{
        offer_id: offer_state.key(),
    });
    Ok(())
}

#[derive(Accounts)]
pub struct ACloseOffer<'info> {
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
        // close = offeror, //BUG: create and errors
        seeds = [
            SEED_OFFER, 
            offer_state_account.offeror.as_ref(),
            offered_token.key().as_ref(),
            requested_token.key().as_ref(),
        ],
        bump,
    )]
    pub offer_state_account: Account<'info, OfferState>,

    ///CHECK:
    #[account(
        mut,
        token::mint = offered_token,
        token::authority = offeror,
    )]
    pub offeror_ata: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        token::mint = offered_token,
        token::authority = offer_state_account,
    )]
    pub offer_state_account_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}
