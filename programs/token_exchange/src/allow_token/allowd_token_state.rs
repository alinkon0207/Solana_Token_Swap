use anchor_lang::prelude::*;

#[account]
pub struct AllowedTokenState {
    pub mint: Pubkey,
    pub feature_1: f64,
    pub is_allowed: bool,
}

impl AllowedTokenState {
    pub const MAX_SIZE: usize = std::mem::size_of::<Self>();
}
