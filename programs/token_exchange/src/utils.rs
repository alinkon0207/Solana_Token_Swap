use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, Transfer};

use crate::{constants::SEED_OFFER, offer::offer_state::OfferState};

pub fn transfer_token<'a>(
    from: AccountInfo<'a>,
    to: AccountInfo<'a>,
    authority: AccountInfo<'a>,
    token_program: AccountInfo<'a>,
    amount: u64,
) -> Result<()> {
    let cpi_accounts = Transfer {
        from,
        to,
        authority,
    };

    let cpi_context = CpiContext::new(token_program, cpi_accounts);
    token::transfer(cpi_context, amount)?;

    Ok(())
}

pub fn transfer_token_from_offeror_state<'a>(
    offer_state: &mut Account<'a, OfferState>,
    offer_state_account_ata: AccountInfo<'a>,
    receiver_ata: AccountInfo<'a>,
    token_program: AccountInfo<'a>,
    amount: u64,
) -> Result<()> {
    let (_, bump) = Pubkey::find_program_address(
        &[
            SEED_OFFER,
            offer_state.init_time.to_le_bytes().as_ref(),
            offer_state.offeror.as_ref(),
            offer_state.offered_token.key().as_ref(),
            offer_state.requested_token.key().as_ref(),
        ],
        &crate::ID,
    );

    let cpi_accounts = Transfer {
        from: offer_state_account_ata,
        to: receiver_ata,
        authority: offer_state.to_account_info(),
    };

    token::transfer(
        CpiContext::new_with_signer(
            token_program,
            cpi_accounts,
            &[&[
                SEED_OFFER,
                offer_state.init_time.to_le_bytes().as_ref(),
                offer_state.offeror.as_ref(),
                offer_state.offered_token.key().as_ref(),
                offer_state.requested_token.key().as_ref(),
                &[bump],
            ]],
        ),
        amount,
    )
}
