use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};
use mpl_token_metadata::types::AuthorizationData;

use crate::*;

#[derive(Accounts)]
pub struct List<'info> {
    #[account(
        seeds = [], bump = tswap.bump[0],
    )]
    pub tswap: Box<Account<'info, TSwap>>,

    #[account(mut, token::mint = nft_mint, token::authority = owner)]
    pub nft_source: Box<Account<'info, TokenAccount>>,

    /// CHECK: seed in nft_escrow & nft_receipt
    pub nft_mint: Box<Account<'info, Mint>>,

    /// Implicitly checked via transfer. Will fail if wrong account
    #[account(
        init, //<-- this HAS to be init, not init_if_needed for safety (else single listings and pool listings can get mixed)
        payer = payer,
        seeds=[
            b"nft_escrow".as_ref(),
            nft_mint.key().as_ref(),
        ],
        bump,
        token::mint = nft_mint, token::authority = tswap,
    )]
    pub nft_escrow: Box<Account<'info, TokenAccount>>,

    #[account(
        init, //<-- this HAS to be init, not init_if_needed for safety (else single listings and pool listings can get mixed)
        payer = payer,
        seeds=[
            b"single_listing".as_ref(),
            nft_mint.key().as_ref(),
        ],
        bump,
        space = SINGLE_LISTING_SIZE,
    )]
    pub single_listing: Box<Account<'info, SingleListing>>,

    /// CHECK: the token transfer will fail if owner is wrong (signature error)
    #[account(mut)]
    pub owner: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,

    // --------------------------------------- pNft

    //can't deserialize directly coz Anchor traits not implemented
    /// CHECK: assert_decode_metadata + seeds below
    #[account(
        mut,
        seeds=[
            mpl_token_metadata::accounts::Metadata::PREFIX,
            mpl_token_metadata::ID.as_ref(),
            nft_mint.key().as_ref(),
        ],
        seeds::program = mpl_token_metadata::ID,
        bump
    )]
    pub nft_metadata: UncheckedAccount<'info>,

    //note that MASTER EDITION and EDITION share the same seeds, and so it's valid to check them here
    /// CHECK: seeds below
    #[account(
        seeds=[
            mpl_token_metadata::accounts::MasterEdition::PREFIX.0,
            mpl_token_metadata::ID.as_ref(),
            nft_mint.key().as_ref(),
            mpl_token_metadata::accounts::MasterEdition::PREFIX.1,
        ],
        seeds::program = mpl_token_metadata::ID,
        bump
    )]
    pub nft_edition: UncheckedAccount<'info>,

    /// CHECK: seeds below
    #[account(mut,
        seeds=[
            mpl_token_metadata::accounts::TokenRecord::PREFIX.0,
            mpl_token_metadata::ID.as_ref(),
            nft_mint.key().as_ref(),
            mpl_token_metadata::accounts::TokenRecord::PREFIX.1,
            nft_source.key().as_ref()
        ],
        seeds::program = mpl_token_metadata::ID,
        bump
    )]
    pub owner_token_record: UncheckedAccount<'info>,

    /// CHECK: seeds below
    #[account(mut,
        seeds=[
            mpl_token_metadata::accounts::TokenRecord::PREFIX.0,
            mpl_token_metadata::ID.as_ref(),
            nft_mint.key().as_ref(),
            mpl_token_metadata::accounts::TokenRecord::PREFIX.1,
            nft_escrow.key().as_ref()
        ],
        seeds::program = mpl_token_metadata::ID,
        bump
    )]
    pub dest_token_record: UncheckedAccount<'info>,

    pub associated_token_program: Program<'info, AssociatedToken>,

    pub pnft_shared: ProgNftShared<'info>,

    /// CHECK: validated by mplex's pnft code
    pub auth_rules: UncheckedAccount<'info>,

    //separate payer so that a program can list with owner being a PDA
    #[account(mut)]
    pub payer: Signer<'info>,
}

pub fn handler<'info>(
    ctx: Context<'_, '_, '_, 'info, List<'info>>,
    price: u64,
    authorization_data: Option<AuthorizationDataLocal>,
    rules_acc_present: bool,
) -> Result<()> {
    let auth_rules_acc_info = &ctx.accounts.auth_rules.to_account_info();
    let auth_rules = if rules_acc_present {
        Some(auth_rules_acc_info)
    } else {
        None
    };

    send_pnft(
        None,
        PnftTransferArgs {
            authority_and_owner: &ctx.accounts.owner.to_account_info(),
            payer: &ctx.accounts.payer.to_account_info(),
            source_ata: &ctx.accounts.nft_source,
            dest_ata: &ctx.accounts.nft_escrow,
            dest_owner: &ctx.accounts.tswap.to_account_info(),
            nft_mint: &ctx.accounts.nft_mint,
            nft_metadata: &ctx.accounts.nft_metadata,
            nft_edition: &ctx.accounts.nft_edition,
            system_program: &ctx.accounts.system_program,
            token_program: &ctx.accounts.token_program,
            ata_program: &ctx.accounts.associated_token_program,
            instructions: &ctx.accounts.pnft_shared.instructions,
            owner_token_record: &ctx.accounts.owner_token_record,
            dest_token_record: &ctx.accounts.dest_token_record,
            authorization_rules_program: &ctx.accounts.pnft_shared.authorization_rules_program,
            rules_acc: auth_rules,
            authorization_data: authorization_data
                .map(|authorization_data| AuthorizationData::try_from(authorization_data).unwrap()),
            delegate: None,
        },
    )?;

    //record listing state
    let listing = &mut ctx.accounts.single_listing;
    listing.owner = ctx.accounts.owner.key();
    listing.nft_mint = ctx.accounts.nft_mint.key();
    listing.price = price;
    listing.bump = [ctx.bumps.single_listing];

    Ok(())
}
