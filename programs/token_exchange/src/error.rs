use anchor_lang::prelude::error_code;

#[error_code]
pub enum MyError {
    #[msg("Only Owner can call")]
    OnlyOwnerCanCall,

    #[msg("Token not Allowed")]
    TokenNotAllowed,

    #[msg("You Do Not Have Enough Token to make Transaction")]
    NotEnoughToken,

    #[msg("Offered Token amount should not be Zero")]
    ZeroOfferedAmount,

    #[msg("Requested Token amount should not be Zero")]
    ZeroRequestedAmount,

    #[msg("Too low amount than min amount")]
    TooLowAmount,

    #[msg("Too high amount than available amount")]
    TooHighAmount,

    #[msg("Offer already created")]
    OfferAlreadyCreated,

    #[msg("Offer is not Active now")]
    OfferNotActive,

    #[msg("Self Offer accept not allowed")]
    SelfOfferAccept,
}
