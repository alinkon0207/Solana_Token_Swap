use anchor_lang::prelude::*;

#[event]
pub struct TokenAllowed {
    pub token_id: Pubkey,
}

#[event]
pub struct TokenDisAllowed {
    pub token_id: Pubkey,
}

#[event]
pub struct OfferCreated {
    pub offer_id: Pubkey,
    pub offeror: Pubkey,
    pub offered_token: Pubkey,
    pub requested_token: Pubkey,
    pub offered_amount: u64,
    pub requested_amount: u64,
    pub min_offered_amount: u64,
    // pub ratio: f64,
}

#[event]
pub struct OfferAccepted {
    pub offer_id: Pubkey,
    pub amount: u64,
}

#[event]
pub struct OfferUpdated {
    pub offer_id: Pubkey,
    pub inc_requested_amount: Option<u64>,
    pub dec_requested_amount: Option<u64>,
    // pub ratio: f64,
}

#[event]
pub struct OfferRevoked {
    pub offer_id: Pubkey,
}

#[event]
pub struct OfferCompleted {
    pub offer_id: Pubkey,
}
