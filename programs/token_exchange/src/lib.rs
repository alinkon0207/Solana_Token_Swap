#![allow(unused)]

use anchor_lang::prelude::*;

declare_id!("6seUT1pKL6JkQpgzDp8aAfmkCyQFc7wMS9912PNaKDCw");

mod _main;
mod allow_token;
mod offer;

mod constants;
mod error;
mod events;
mod utils;

use _main::*;
use allow_token::*;
use offer::*;

#[program]
pub mod token_exchange {
    use super::*;

    //NOTE: Adming Calls
    pub fn init_main_state(ctx: Context<AInitMainState>, input: MainStateInput) -> Result<()> {
        _main::init_main_state(ctx, input)?;
        Ok(())
    }

    pub fn update_main_state(ctx: Context<AUpdateMainState>, input: MainStateInput) -> Result<()> {
        _main::update_main_state(ctx, input)?;
        Ok(())
    }

    pub fn update_main_state_owner(
        ctx: Context<AUpdateMainStateOwner>,
        new_owner: Pubkey,
    ) -> Result<()> {
        _main::update_main_state_owner(ctx, new_owner)?;
        Ok(())
    }

    pub fn allow_token(ctx: Context<AAllowToken>) -> Result<()> {
        allow_token::allow_token(ctx)?;
        Ok(())
    }

    pub fn disallow_token(ctx: Context<ADisAllowToken>) -> Result<()> {
        allow_token::disallow_token(ctx)?;
        Ok(())
    }

    //NOTE: User Calls
    pub fn init_offer_state(ctx: Context<AInitOfferState>, init_time: i64) -> Result<()> {
        offer::init_offer_state(ctx, init_time)?;
        Ok(())
    }

    pub fn create_offer(
        ctx: Context<ACreateOffer>,
        offered_amount: u64,
        requested_amount: u64,
        min_requested_amount: u64,
    ) -> Result<()> {
        offer::create_offer(ctx, offered_amount, requested_amount, min_requested_amount)?;
        Ok(())
    }

    pub fn edit_offer(ctx: Context<AEditOffer>, input: EditOfferInput) -> Result<()> {
        offer::edit_offer(ctx, input)?;
        Ok(())
    }

    pub fn accept_offer(ctx: Context<AAcceptOffer>, requested_amount: u64) -> Result<()> {
        offer::accept_offer(ctx, requested_amount)?;
        Ok(())
    }

    pub fn close_offer(ctx: Context<ACloseOffer>) -> Result<()> {
        offer::close_offer(ctx)?;
        Ok(())
    }
}
