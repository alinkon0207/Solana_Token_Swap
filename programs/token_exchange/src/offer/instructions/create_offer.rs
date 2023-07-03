use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

use crate::{
    _main::main_state::MainState,
    constants::{SEED_MAIN_STATE, SEED_OFFER, SEED_ALLOWED_TOKEN},
    offer::offer_state::OfferState,
    utils::transfer_token, error::MyError, events,
};

pub fn create_offer(
    ctx: Context<ACreateOffer>,
    offered_amount: u64,
    requested_amount: u64,
    min_requested_amount: u64,
) -> Result<()> {
    let offeror = ctx.accounts.offeror.to_account_info();
    let offeror_ata = ctx.accounts.offeror_ata.to_account_info();
    let fee_receiver_ata = ctx.accounts.fee_receiver_ata.to_account_info();
    let main_state = &ctx.accounts.main_state_account;
    let offer_state = &mut ctx.accounts.offer_state_account;
    let offer_state_ata = ctx.accounts.offer_state_account_ata.to_account_info();
    let token_program = ctx.accounts.token_program.to_account_info();
    let offered_token_allowed_checker = ctx.accounts.offered_token_allowed_checker.to_account_info();
    let requested_token_allowed_checker = ctx.accounts.requested_token_allowed_checker.to_account_info();


    if offered_token_allowed_checker.owner != ctx.program_id || requested_token_allowed_checker.owner != ctx.program_id{
        return anchor_lang::err!(MyError::TokenNotAllowed);
    }

    if offer_state.is_active {
        return anchor_lang::err!(MyError::OfferAlreadyCreated);
    }

    if min_requested_amount > requested_amount {
        return anchor_lang::err!(MyError::TooHighAmount);
    }
    
    //NOTE: seting state
    offer_state.offered_amount = offered_amount;
    offer_state.requested_amount = requested_amount;
    offer_state.min_requested_amount = min_requested_amount;
    offer_state.is_active = true;

    //NOTE: Transfering the fees
    let fees = (main_state.fee_rate * offered_amount as f64) as u64;
    transfer_token(
        offeror_ata.to_account_info(),
        fee_receiver_ata,
        offeror.to_account_info(),
        token_program.to_account_info(),
        fees,
    )?;

    //NOTE: Transfering the token to program account
    transfer_token(
        offeror_ata.to_account_info(),
        offer_state_ata,
        offeror.to_account_info(),
        token_program.to_account_info(),
        offered_amount,
    )?;

    emit!(events::OfferCreated{
        offer_id: ctx.accounts.offer_state_account.key(),
        offeror: ctx.accounts.offeror.key(), 
        offered_token: ctx.accounts.offered_token.key(),
        requested_token: ctx.accounts.requested_token.key(),
        offered_amount,
        requested_amount,
        min_requested_amount,
    });
    Ok(())
}

#[derive(Accounts)]
pub struct ACreateOffer<'info> {
    pub offeror: Signer<'info>,

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
        token::mint = offered_token,
        token::authority = offeror
    )]
    pub offeror_ata: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [
            SEED_OFFER, 
            offeror.key().as_ref(), 
            offered_token.key().as_ref(),
            requested_token.key().as_ref(),
        ],
        bump,
    )]
    pub offer_state_account: Account<'info, OfferState>,

    #[account(
        mut,
        token::mint = offered_token,
        token::authority = offer_state_account,
    )]
    pub offer_state_account_ata: Account<'info, TokenAccount>,

    ///CHECK:
    #[account(
        mut,
        seeds = [SEED_ALLOWED_TOKEN, offered_token.key().as_ref()],
        bump,
    )]
    pub offered_token_allowed_checker: AccountInfo<'info>,

    ///CHECK:
    #[account(
        mut,
        seeds = [SEED_ALLOWED_TOKEN, requested_token.key().as_ref()],
        bump,
    )]
    pub requested_token_allowed_checker: AccountInfo<'info>,

    #[account(
        mut,
        token::mint = offered_token,
        token::authority = main_state_account.fee_receiver,
    )]
    pub fee_receiver_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}
