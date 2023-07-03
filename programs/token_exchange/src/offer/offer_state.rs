use anchor_lang::prelude::*;

#[account]
pub struct OfferState {
    pub offeror: Pubkey,
    pub offered_token: Pubkey,
    pub requested_token: Pubkey,
    pub offered_amount: u64,
    pub requested_amount: u64,
    pub min_requested_amount: u64,
    pub is_active: bool,
}

impl OfferState {
    pub const MAX_SIZE: usize = std::mem::size_of::<Self>();

    pub fn re_init(&mut self) {
        self.offered_amount = 0;
        self.requested_amount = 0;
        self.min_requested_amount = 0;
        self.is_active = false;
    }
}
