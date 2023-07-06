export type TokenExchange = {
  "version": "0.1.0",
  "name": "token_exchange",
  "instructions": [
    {
      "name": "initMainState",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mainStateAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "input",
          "type": {
            "defined": "MainStateInput"
          }
        }
      ]
    },
    {
      "name": "updateMainState",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mainStateAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "input",
          "type": {
            "defined": "MainStateInput"
          }
        }
      ]
    },
    {
      "name": "updateMainStateOwner",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mainStateAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newOwner",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "allowToken",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "token",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mainState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "allowTokenStateAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "disallowToken",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "token",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mainState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "allowTokenStateAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "initOfferState",
      "accounts": [
        {
          "name": "offeror",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "offeredToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "requestedToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "offerStateAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "offerStateAccountAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "offeredTokenAllowedChecker",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "requestedTokenAllowedChecker",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "initTime",
          "type": "i64"
        }
      ]
    },
    {
      "name": "createOffer",
      "accounts": [
        {
          "name": "offeror",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "mainStateAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "offerorAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "offerStateAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "offerStateAccountAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "offeredTokenAllowedChecker",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "requestedTokenAllowedChecker",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "feeReceiverAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "offeredAmount",
          "type": "u64"
        },
        {
          "name": "requestedAmount",
          "type": "u64"
        },
        {
          "name": "minRequestedAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "editOffer",
      "accounts": [
        {
          "name": "offeror",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "mainStateAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "offerStateAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "input",
          "type": {
            "defined": "EditOfferInput"
          }
        }
      ]
    },
    {
      "name": "acceptOffer",
      "accounts": [
        {
          "name": "acceptor",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "mainStateAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "acceptorOfferedTokenAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "acceptorRequestedTokenAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "offerorRequestedTokenAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "offerStateAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "offerStateAccountAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "feeReceiverAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "requestedAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "closeOffer",
      "accounts": [
        {
          "name": "offeror",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "mainStateAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "offerStateAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "offerorAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "offerStateAccountAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "mainState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "feeReceiver",
            "type": "publicKey"
          },
          {
            "name": "feeRate",
            "type": "f64"
          }
        ]
      }
    },
    {
      "name": "allowedTokenState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "feature1",
            "type": "f64"
          },
          {
            "name": "isAllowed",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "offerState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "offeror",
            "type": "publicKey"
          },
          {
            "name": "offeredToken",
            "type": "publicKey"
          },
          {
            "name": "requestedToken",
            "type": "publicKey"
          },
          {
            "name": "offeredAmount",
            "type": "u64"
          },
          {
            "name": "requestedAmount",
            "type": "u64"
          },
          {
            "name": "minRequestedAmount",
            "type": "u64"
          },
          {
            "name": "initTime",
            "type": "i64"
          },
          {
            "name": "isActive",
            "type": "bool"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "MainStateInput",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "feeReceiver",
            "type": "publicKey"
          },
          {
            "name": "feeRate",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "EditOfferInput",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "newRequestedTokenAmount",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "newMinRequestedTokenAmount",
            "type": {
              "option": "u64"
            }
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "TokenAllowed",
      "fields": [
        {
          "name": "tokenId",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "TokenDisAllowed",
      "fields": [
        {
          "name": "tokenId",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "OfferCreated",
      "fields": [
        {
          "name": "offerId",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "offeror",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "offeredToken",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "requestedToken",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "offeredAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "requestedAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "minRequestedAmount",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "OfferAccepted",
      "fields": [
        {
          "name": "offerId",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "OfferUpdated",
      "fields": [
        {
          "name": "offerId",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "newRequestedTokenAmount",
          "type": {
            "option": "u64"
          },
          "index": false
        },
        {
          "name": "newMinRequestedTokenAmount",
          "type": {
            "option": "u64"
          },
          "index": false
        }
      ]
    },
    {
      "name": "OfferRevoked",
      "fields": [
        {
          "name": "offerId",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "OfferCompleted",
      "fields": [
        {
          "name": "offerId",
          "type": "publicKey",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "OnlyOwnerCanCall",
      "msg": "Only Owner can call"
    },
    {
      "code": 6001,
      "name": "TokenNotAllowed",
      "msg": "Token not Allowed"
    },
    {
      "code": 6002,
      "name": "NotEnoughToken",
      "msg": "You Do Not Have Enough Token to make Transaction"
    },
    {
      "code": 6003,
      "name": "ZeroOfferedAmount",
      "msg": "Offered Token amount should not be Zero"
    },
    {
      "code": 6004,
      "name": "ZeroRequestedAmount",
      "msg": "Requested Token amount should not be Zero"
    },
    {
      "code": 6005,
      "name": "TooLowAmount",
      "msg": "Too low amount than min amount"
    },
    {
      "code": 6006,
      "name": "TooHighAmount",
      "msg": "Too high amount than available amount"
    },
    {
      "code": 6007,
      "name": "OfferAlreadyCreated",
      "msg": "Offer already created"
    },
    {
      "code": 6008,
      "name": "OfferNotActive",
      "msg": "Offer is not Active now"
    },
    {
      "code": 6009,
      "name": "SelfOfferAccept",
      "msg": "Self Offer accept not allowed"
    }
  ]
};

export const IDL: TokenExchange = {
  "version": "0.1.0",
  "name": "token_exchange",
  "instructions": [
    {
      "name": "initMainState",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mainStateAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "input",
          "type": {
            "defined": "MainStateInput"
          }
        }
      ]
    },
    {
      "name": "updateMainState",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mainStateAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "input",
          "type": {
            "defined": "MainStateInput"
          }
        }
      ]
    },
    {
      "name": "updateMainStateOwner",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mainStateAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newOwner",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "allowToken",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "token",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mainState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "allowTokenStateAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "disallowToken",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "token",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mainState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "allowTokenStateAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "initOfferState",
      "accounts": [
        {
          "name": "offeror",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "offeredToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "requestedToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "offerStateAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "offerStateAccountAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "offeredTokenAllowedChecker",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "requestedTokenAllowedChecker",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "initTime",
          "type": "i64"
        }
      ]
    },
    {
      "name": "createOffer",
      "accounts": [
        {
          "name": "offeror",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "mainStateAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "offerorAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "offerStateAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "offerStateAccountAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "offeredTokenAllowedChecker",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "requestedTokenAllowedChecker",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "feeReceiverAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "offeredAmount",
          "type": "u64"
        },
        {
          "name": "requestedAmount",
          "type": "u64"
        },
        {
          "name": "minRequestedAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "editOffer",
      "accounts": [
        {
          "name": "offeror",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "mainStateAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "offerStateAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "input",
          "type": {
            "defined": "EditOfferInput"
          }
        }
      ]
    },
    {
      "name": "acceptOffer",
      "accounts": [
        {
          "name": "acceptor",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "mainStateAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "acceptorOfferedTokenAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "acceptorRequestedTokenAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "offerorRequestedTokenAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "offerStateAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "offerStateAccountAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "feeReceiverAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "requestedAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "closeOffer",
      "accounts": [
        {
          "name": "offeror",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "mainStateAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "offerStateAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "offerorAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "offerStateAccountAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "mainState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "feeReceiver",
            "type": "publicKey"
          },
          {
            "name": "feeRate",
            "type": "f64"
          }
        ]
      }
    },
    {
      "name": "allowedTokenState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "feature1",
            "type": "f64"
          },
          {
            "name": "isAllowed",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "offerState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "offeror",
            "type": "publicKey"
          },
          {
            "name": "offeredToken",
            "type": "publicKey"
          },
          {
            "name": "requestedToken",
            "type": "publicKey"
          },
          {
            "name": "offeredAmount",
            "type": "u64"
          },
          {
            "name": "requestedAmount",
            "type": "u64"
          },
          {
            "name": "minRequestedAmount",
            "type": "u64"
          },
          {
            "name": "initTime",
            "type": "i64"
          },
          {
            "name": "isActive",
            "type": "bool"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "MainStateInput",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "feeReceiver",
            "type": "publicKey"
          },
          {
            "name": "feeRate",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "EditOfferInput",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "newRequestedTokenAmount",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "newMinRequestedTokenAmount",
            "type": {
              "option": "u64"
            }
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "TokenAllowed",
      "fields": [
        {
          "name": "tokenId",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "TokenDisAllowed",
      "fields": [
        {
          "name": "tokenId",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "OfferCreated",
      "fields": [
        {
          "name": "offerId",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "offeror",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "offeredToken",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "requestedToken",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "offeredAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "requestedAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "minRequestedAmount",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "OfferAccepted",
      "fields": [
        {
          "name": "offerId",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "OfferUpdated",
      "fields": [
        {
          "name": "offerId",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "newRequestedTokenAmount",
          "type": {
            "option": "u64"
          },
          "index": false
        },
        {
          "name": "newMinRequestedTokenAmount",
          "type": {
            "option": "u64"
          },
          "index": false
        }
      ]
    },
    {
      "name": "OfferRevoked",
      "fields": [
        {
          "name": "offerId",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "OfferCompleted",
      "fields": [
        {
          "name": "offerId",
          "type": "publicKey",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "OnlyOwnerCanCall",
      "msg": "Only Owner can call"
    },
    {
      "code": 6001,
      "name": "TokenNotAllowed",
      "msg": "Token not Allowed"
    },
    {
      "code": 6002,
      "name": "NotEnoughToken",
      "msg": "You Do Not Have Enough Token to make Transaction"
    },
    {
      "code": 6003,
      "name": "ZeroOfferedAmount",
      "msg": "Offered Token amount should not be Zero"
    },
    {
      "code": 6004,
      "name": "ZeroRequestedAmount",
      "msg": "Requested Token amount should not be Zero"
    },
    {
      "code": 6005,
      "name": "TooLowAmount",
      "msg": "Too low amount than min amount"
    },
    {
      "code": 6006,
      "name": "TooHighAmount",
      "msg": "Too high amount than available amount"
    },
    {
      "code": 6007,
      "name": "OfferAlreadyCreated",
      "msg": "Offer already created"
    },
    {
      "code": 6008,
      "name": "OfferNotActive",
      "msg": "Offer is not Active now"
    },
    {
      "code": 6009,
      "name": "SelfOfferAccept",
      "msg": "Self Offer accept not allowed"
    }
  ]
};
