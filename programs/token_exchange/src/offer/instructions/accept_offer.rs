use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

use crate::{offer::offer_state::OfferState, constants::{SEED_OFFER, SEED_MAIN_STATE}, _main::main_state::MainState, utils::{transfer_token, , transfer_token_from_offeror_state}, error::MyError, events};

pub fn accept_offer(ctx: Context<AAcceptOffer>, amount: u64) -> Result<()> {
    let acceptor = ctx.accounts.acceptor.to_account_info();
    let acceptor_offered_token_ata = ctx.accounts.acceptor_offered_token_ata.to_account_info();
    let acceptor_requested_token_ata = ctx.accounts.acceptor_requested_token_ata.to_account_info();
    let offeror_requested_token_ata = ctx.accounts.offeror_requested_token_ata.to_account_info();
    let fee_receiver_ata = ctx.accounts.fee_receiver_ata.to_account_info();
    let main_state = & ctx.accounts.main_state_account;
    let offer_state = &mut ctx.accounts.offer_state_account;
    let offer_state_ata = ctx.accounts.offer_state_account_ata.to_account_info();
    let token_program = ctx.accounts.token_program.to_account_info();

    if acceptor.key() == offer_state.offeror {
        return anchor_lang::err!(MyError::SelfOfferAccept);
    }

    if !offer_state.is_active {
        return anchor_lang::err!(MyError::OfferNotActive);
    }

    // check if too high
    if amount > offer_state.requested_amount {
        return anchor_lang::err!(MyError::TooHighAmount);
    }
    // check if too low
    if amount < offer_state.min_requested_amount {
        return anchor_lang::err!(MyError::TooLowAmount);
    }

    let partial_offered_amount = (offer_state.offered_amount as u128 * amount as u128) as u64 / offer_state.requested_amount;  // ilesovoy - potential bug (multiplied value can exceed u64)

    //NOTE: Transfering the fees
    let fees = (main_state.fee_rate * amount as f64) as u64;

    // ilesoviy - check remaining balance
    if amount + fees > ctx.accounts.acceptor_requested_token_ata.amount {
        return anchor_lang::err!(MyError::NotEnoughToken);
    }

    transfer_token(
        acceptor_requested_token_ata.to_account_info(), 
        fee_receiver_ata, 
        acceptor.to_account_info(), 
        token_program.to_account_info(), 
        fees
    ).map_err(|_|MyError::NotEnoughToken)?;

    //NOTE: Transfering the requested token to offeror ata
    transfer_token(
        acceptor_requested_token_ata.to_account_info(), 
        offeror_requested_token_ata, 
        acceptor.to_account_info(), 
        token_program.to_account_info(), 
        amount, 
    ).map_err(|_|MyError::NotEnoughToken)?;

    //NOTE: Transfer token from program account to acceptor
    transfer_token_from_offeror_state(
        offer_state, 
        offer_state_ata, 
        acceptor_offered_token_ata, 
        token_program, 
        deducted_offered_amount
    )?;

    //NOTE: set the state
    offer_state.offered_amount -= partial_offered_amount;
    offer_state.requested_amount -= amount;

    emit!(events::OfferAccepted{
        offer_id: offer_state.key(),
        amount: amount,
    });

    if offer_state.min_requested_amount > offer_state.requested_amount {
		if offer_state.requested_amount == 0 {
			emit!(events::OfferCompleted{
                offer_id: offer_state.key(),
            });
			offer_state.re_init();
		}
		else
        	offer_state.min_requested_amount = offer_state.requested_amount;
    }

    Ok(())
}

#[derive(Accounts)]
pub struct AAcceptOffer<'info> {
    pub acceptor: Signer<'info>,

    #[account(
        seeds = [SEED_MAIN_STATE],
        bump,
    )]
    pub main_state_account: Account<'info, MainState>,

    ///CHECK:
    #[account(mut)]
    pub acceptor_offered_token_ata: AccountInfo<'info>,

    ///CHECK:
    #[account(mut)]
    pub acceptor_requested_token_ata: AccountInfo<'info>,
    
    #[account(
        mut,
        token::mint = offer_state_account.requested_token,
        token::authority =  offer_state_account.offeror,
    )]
    pub offeror_requested_token_ata: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [
            SEED_OFFER, 
            offer_state_account.init_time.to_le_bytes().as_ref(),
            offer_state_account.offeror.as_ref(),
            offer_state_account.offered_token.key().as_ref(),
            offer_state_account.requested_token.key().as_ref(),
        ],
        bump,
    )]
    pub offer_state_account: Account<'info, OfferState>,

    #[account(
        mut,
        token::mint = offer_state_account.offered_token,
        token::authority = offer_state_account,
    )]
    pub offer_state_account_ata: Account<'info, TokenAccount>,

    #[account(
        mut,
        token::mint = offer_state_account.requested_token,
        token::authority = main_state_account.fee_receiver,
    )]
    pub fee_receiver_ata: Account<'info ,TokenAccount>,

    pub token_program: Program<'info, Token>,
}
