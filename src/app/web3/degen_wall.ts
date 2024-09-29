/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/degen_wall.json`.
 */
export type DegenWall = {
  "address": "DEGenPMwjmLCw9LmdvfCUK5M4XKrbep2rts4DDqG3J5x",
  "metadata": {
    "name": "degenWall",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "createMetadataAccount",
      "discriminator": [
        75,
        73,
        45,
        178,
        212,
        194,
        127,
        113
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "metadataAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  103,
                  101,
                  110,
                  95,
                  119,
                  97,
                  108,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "arg",
                "path": "params.id"
              }
            ]
          }
        },
        {
          "name": "token"
        },
        {
          "name": "solTreasuryAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  103,
                  101,
                  110,
                  95,
                  119,
                  97,
                  108,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "treasury",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "createMetadataAccountParams"
            }
          }
        }
      ]
    },
    {
      "name": "createMetadataAccountMint",
      "discriminator": [
        242,
        9,
        22,
        107,
        12,
        75,
        131,
        56
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "metadataAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  103,
                  101,
                  110,
                  95,
                  119,
                  97,
                  108,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "arg",
                "path": "params.id"
              }
            ]
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "token"
        },
        {
          "name": "poolAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  103,
                  101,
                  110,
                  95,
                  119,
                  97,
                  108,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "treasuryMint",
          "writable": true
        },
        {
          "name": "payerTokenAccount",
          "writable": true
        },
        {
          "name": "vaultWsol"
        },
        {
          "name": "vaultMint"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "createMetadataAccountParams"
            }
          }
        }
      ]
    },
    {
      "name": "createPoolAccount",
      "discriminator": [
        141,
        39,
        149,
        90,
        253,
        66,
        124,
        136
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "mint"
        },
        {
          "name": "vaultWsol"
        },
        {
          "name": "vaultMint"
        },
        {
          "name": "treasury"
        },
        {
          "name": "poolAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  103,
                  101,
                  110,
                  95,
                  119,
                  97,
                  108,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "discount",
          "type": "u8"
        },
        {
          "name": "burn",
          "type": "bool"
        }
      ]
    },
    {
      "name": "createSolTreasuryAccount",
      "discriminator": [
        6,
        215,
        142,
        145,
        33,
        201,
        93,
        76
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "solTreasuryAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  103,
                  101,
                  110,
                  95,
                  119,
                  97,
                  108,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "discount",
          "type": "u8"
        }
      ]
    },
    {
      "name": "deleteMetadataAccount",
      "discriminator": [
        141,
        9,
        58,
        11,
        141,
        23,
        1,
        63
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "payer"
        },
        {
          "name": "metadataAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  103,
                  101,
                  110,
                  95,
                  119,
                  97,
                  108,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "payer"
              },
              {
                "kind": "arg",
                "path": "id"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "id",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "deletePoolAccount",
      "discriminator": [
        53,
        98,
        26,
        225,
        77,
        47,
        77,
        136
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "mint"
        },
        {
          "name": "poolAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  103,
                  101,
                  110,
                  95,
                  119,
                  97,
                  108,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "deleteSolTreasuryAccount",
      "discriminator": [
        115,
        82,
        28,
        202,
        124,
        51,
        56,
        237
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "solTreasuryAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  103,
                  101,
                  110,
                  95,
                  119,
                  97,
                  108,
                  108
                ]
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "updatePoolAccount",
      "discriminator": [
        117,
        97,
        171,
        180,
        210,
        68,
        106,
        142
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "mint"
        },
        {
          "name": "poolAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  103,
                  101,
                  110,
                  95,
                  119,
                  97,
                  108,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "discount",
          "type": "u8"
        },
        {
          "name": "burn",
          "type": "bool"
        }
      ]
    },
    {
      "name": "updateSolTreasuryAccount",
      "discriminator": [
        24,
        29,
        185,
        233,
        96,
        169,
        97,
        79
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "solTreasuryAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  103,
                  101,
                  110,
                  95,
                  119,
                  97,
                  108,
                  108
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "discount",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "metadataAccount",
      "discriminator": [
        32,
        224,
        226,
        224,
        77,
        64,
        109,
        234
      ]
    },
    {
      "name": "poolAccount",
      "discriminator": [
        116,
        210,
        187,
        119,
        196,
        196,
        52,
        137
      ]
    },
    {
      "name": "solTreasuryAccount",
      "discriminator": [
        172,
        119,
        222,
        247,
        211,
        84,
        123,
        69
      ]
    }
  ],
  "events": [
    {
      "name": "metadataAccountCreated",
      "discriminator": [
        169,
        211,
        83,
        26,
        243,
        161,
        192,
        64
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "stopBeingPoor",
      "msg": "Stop being poor!"
    },
    {
      "code": 6001,
      "name": "whyAreYouDoingThisToMeBruv",
      "msg": "Why are you doing this to me bruv?"
    },
    {
      "code": 6002,
      "name": "youAreNotMyBoss",
      "msg": "You are not my boss!"
    },
    {
      "code": 6003,
      "name": "notEnoughMoneyForGas",
      "msg": "Not enough money for gas!"
    },
    {
      "code": 6004,
      "name": "invalidWsolAccount",
      "msg": "Invalid WSOL Account"
    },
    {
      "code": 6005,
      "name": "invalidMintAccount",
      "msg": "Invalid Mint account!"
    },
    {
      "code": 6006,
      "name": "invalidTreasuryAccount",
      "msg": "Invalid Treasury Account!"
    },
    {
      "code": 6007,
      "name": "invalidTreasuryOwner",
      "msg": "Invalid Treasury Owner!"
    },
    {
      "code": 6008,
      "name": "invalidPayerTokenAccount",
      "msg": "Invalid Payer Token Account!"
    },
    {
      "code": 6009,
      "name": "invalidDiscountValue",
      "msg": "Invalid Discount Value!"
    },
    {
      "code": 6010,
      "name": "thisIsPointlessDude",
      "msg": "This is pointless dude!"
    },
    {
      "code": 6011,
      "name": "emptyData",
      "msg": "Empty data!"
    },
    {
      "code": 6012,
      "name": "dataTooBig",
      "msg": "Data too big!"
    },
    {
      "code": 6013,
      "name": "invalidData",
      "msg": "Invalid data!"
    },
    {
      "code": 6014,
      "name": "urlTooBig",
      "msg": "URL too big!"
    },
    {
      "code": 6015,
      "name": "twitterStringTooBig",
      "msg": "Twitter string too big!"
    },
    {
      "code": 6016,
      "name": "invalidTwitter",
      "msg": "Invalid Twitter!"
    },
    {
      "code": 6017,
      "name": "nameStringTooBig",
      "msg": "Name string too big!"
    },
    {
      "code": 6018,
      "name": "tickerStringTooBig",
      "msg": "Ticker string too big!"
    },
    {
      "code": 6019,
      "name": "noHttpPrefix",
      "msg": "No Http Prefix!"
    },
    {
      "code": 6020,
      "name": "overallStringTooBig",
      "msg": "Overall string too big!"
    }
  ],
  "types": [
    {
      "name": "createMetadataAccountParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "data",
            "type": {
              "array": [
                "u8",
                500
              ]
            }
          },
          {
            "name": "website",
            "type": "string"
          },
          {
            "name": "twitter",
            "type": "string"
          },
          {
            "name": "community",
            "type": "string"
          },
          {
            "name": "image",
            "type": "string"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "ticker",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "metadataAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "id",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "epoch",
            "type": "u64"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "payer",
            "type": "pubkey"
          },
          {
            "name": "token",
            "type": "pubkey"
          },
          {
            "name": "data",
            "type": {
              "array": [
                "u8",
                500
              ]
            }
          },
          {
            "name": "socials",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "metadataAccountCreated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "payer",
            "type": "pubkey"
          },
          {
            "name": "token",
            "type": "pubkey"
          },
          {
            "name": "data",
            "type": {
              "array": [
                "u8",
                500
              ]
            }
          },
          {
            "name": "website",
            "type": "string"
          },
          {
            "name": "twitter",
            "type": "string"
          },
          {
            "name": "community",
            "type": "string"
          },
          {
            "name": "image",
            "type": "string"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "ticker",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "poolAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "vaultWsol",
            "type": "pubkey"
          },
          {
            "name": "vaultMint",
            "type": "pubkey"
          },
          {
            "name": "treasury",
            "type": "pubkey"
          },
          {
            "name": "discount",
            "type": "u8"
          },
          {
            "name": "burn",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "solTreasuryAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "treasury",
            "type": "pubkey"
          },
          {
            "name": "discount",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "constants": [
    {
      "name": "authorityPubkey",
      "type": "pubkey",
      "value": "H3v4uZwVuoCHDyTFezH196wUHxmm7NfBH2yxzUB6MpDZ"
    },
    {
      "name": "dataDelimiter",
      "type": "u8",
      "value": "255"
    },
    {
      "name": "lamportsPerPixel",
      "type": "u64",
      "value": "1000000"
    },
    {
      "name": "maxDataSize",
      "type": "u16",
      "value": "500"
    },
    {
      "name": "maxPxNr",
      "type": "u8",
      "value": "100"
    },
    {
      "name": "maxSocialsSize",
      "type": "u8",
      "value": "195"
    },
    {
      "name": "nameLength",
      "type": "u8",
      "value": "30"
    },
    {
      "name": "pxHeight",
      "type": "u8",
      "value": "50"
    },
    {
      "name": "pxSize",
      "type": "u8",
      "value": "5"
    },
    {
      "name": "pxWidth",
      "type": "u8",
      "value": "100"
    },
    {
      "name": "seedPrefix",
      "type": "bytes",
      "value": "[100, 101, 103, 101, 110, 95, 119, 97, 108, 108]"
    },
    {
      "name": "stringDelimiter",
      "type": "string",
      "value": "\"|\""
    },
    {
      "name": "tickerLength",
      "type": "u8",
      "value": "10"
    },
    {
      "name": "treasuryPubkey",
      "type": "pubkey",
      "value": "AWJQAWxPE3hJz2XVrJDmBDdQk4pC2SjeKpLFhjUncCKM"
    },
    {
      "name": "twitterLength",
      "type": "u8",
      "value": "15"
    },
    {
      "name": "version",
      "type": "u8",
      "value": "2"
    },
    {
      "name": "wsolPubkey",
      "type": "pubkey",
      "value": "So11111111111111111111111111111111111111112"
    }
  ]
};
