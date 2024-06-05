use borsh::BorshDeserialize;
use mpl_token_metadata::{
    accounts::{MasterEdition, Metadata},
    instructions::{CreateV1Builder, MintV1Builder},
    types::{PrintSupply, TokenStandard},
};
use solana_program::pubkey;
use solana_program_test::{BanksClientError, ProgramTest, ProgramTestContext};
use solana_sdk::{
    pubkey::Pubkey,
    signature::{Keypair, Signer},
    system_instruction, system_program,
    transaction::Transaction,
};
use tensor_whitelist::{
    accounts::WhitelistV2,
    instructions::{CreateWhitelistV2, CreateWhitelistV2InstructionArgs},
    types::Condition,
};

pub const COSIGNER: [u8; 64] = [
    139, 185, 120, 181, 235, 102, 176, 141, 98, 254, 81, 113, 52, 206, 57, 93, 238, 178, 82, 146,
    67, 49, 113, 72, 30, 14, 36, 185, 191, 184, 158, 163, 254, 93, 20, 56, 163, 101, 56, 248, 211,
    197, 95, 142, 65, 33, 2, 86, 19, 166, 253, 71, 55, 184, 198, 152, 79, 84, 213, 84, 86, 30, 52,
    89,
];

pub const OWNER: [u8; 64] = [
    130, 107, 254, 149, 27, 133, 51, 79, 52, 57, 108, 247, 146, 80, 231, 133, 207, 79, 204, 188,
    43, 208, 32, 6, 120, 122, 220, 160, 124, 150, 9, 169, 16, 177, 105, 4, 193, 81, 250, 68, 85,
    237, 201, 51, 83, 132, 239, 144, 199, 246, 3, 244, 247, 186, 156, 108, 203, 60, 119, 143, 8,
    131, 121, 22,
];

pub const ONE_SOL_LAMPORTS: u64 = 1_000_000_000;

pub const ATA_PROGRAM_ID: Pubkey = pubkey!("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
pub const TOKEN_PROGRAM_ID: Pubkey = pubkey!("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

pub async fn program_context() -> ProgramTestContext {
    let mut program_test = ProgramTest::new("whitelist_program", tensor_whitelist::ID, None);
    program_test.add_program(
        &mpl_token_metadata::ID.to_string(),
        mpl_token_metadata::ID,
        None,
    );
    program_test.start_with_context().await
}

pub async fn airdrop(
    context: &mut ProgramTestContext,
    receiver: &Pubkey,
    amount: u64,
) -> Result<(), BanksClientError> {
    let tx = Transaction::new_signed_with_payer(
        &[system_instruction::transfer(
            &context.payer.pubkey(),
            receiver,
            amount,
        )],
        Some(&context.payer.pubkey()),
        &[&context.payer],
        context.last_blockhash,
    );

    context.banks_client.process_transaction(tx).await.unwrap();
    Ok(())
}

pub struct TestWhitelistV2 {
    pub namespace: Pubkey,
    pub whitelist: Pubkey,
    pub uuid: [u8; 32],
}

pub async fn fetch<T: BorshDeserialize>(
    address: &Pubkey,
    context: &mut ProgramTestContext,
) -> Result<T, BanksClientError> {
    let account = context.banks_client.get_account(*address).await?;

    if let Some(account) = account {
        Ok(T::try_from_slice(&account.data).unwrap())
    } else {
        Err(BanksClientError::ClientError("Account not found"))
    }
}

pub struct TestWhitelistV2Inputs<'a> {
    pub payer: Option<&'a Keypair>,
    pub namespace: Option<Keypair>,
    pub update_authority: Keypair,
    pub freeze_authority: Option<Pubkey>,
    pub uuid: Option<[u8; 32]>,
    pub conditions: Option<Vec<Condition>>,
}

impl Default for TestWhitelistV2Inputs<'_> {
    fn default() -> Self {
        Self {
            payer: None,
            namespace: None,
            update_authority: Keypair::new(),
            freeze_authority: None,
            uuid: None,
            conditions: None,
        }
    }
}

pub async fn setup_default_whitelist_v2<'a>(
    context: &mut ProgramTestContext,
    inputs: TestWhitelistV2Inputs<'a>,
) -> TestWhitelistV2 {
    let TestWhitelistV2Inputs {
        payer,
        namespace,
        update_authority,
        freeze_authority,
        uuid,
        conditions,
    } = inputs;

    let payer = payer.unwrap_or(&update_authority);
    let uuid = uuid.unwrap_or_else(|| Keypair::new().pubkey().to_bytes());
    let namespace = namespace.unwrap_or(Keypair::new());

    let conditions = conditions.unwrap_or(vec![]);

    // Create basic whitelist for testing.
    let whitelist = WhitelistV2::find_pda(&namespace.pubkey(), uuid).0;

    // Init the singleton.
    let args = CreateWhitelistV2InstructionArgs {
        uuid,
        freeze_authority,
        conditions,
    };

    // Create the whitelist.
    let ix1 = CreateWhitelistV2 {
        payer: payer.pubkey(),
        update_authority: update_authority.pubkey(),
        namespace: namespace.pubkey(),
        whitelist,
        system_program: system_program::ID,
    }
    .instruction(args);

    let tx = Transaction::new_signed_with_payer(
        &[ix1],
        Some(&context.payer.pubkey()),
        &[&context.payer, &update_authority, &namespace],
        context.last_blockhash,
    );
    context.banks_client.process_transaction(tx).await.unwrap();

    TestWhitelistV2 {
        whitelist,
        namespace: namespace.pubkey(),
        uuid,
    }
}

pub trait DirtyClone {
    fn dirty_clone(&self) -> Self;
}

impl DirtyClone for Keypair {
    fn dirty_clone(&self) -> Self {
        let bytes = self.to_bytes();
        Keypair::from_bytes(&bytes).unwrap()
    }
}

pub struct TestMplxNft {
    pub mint: Pubkey,
    pub metadata: Pubkey,
    pub master_edition: Pubkey,
}

pub struct TestMintMetaplexNftInputs {
    pub payer: Option<Keypair>,
    pub update_authority: Keypair,
    pub owner: Option<Pubkey>,
}

pub async fn mint_metaplex_nft(
    context: &mut ProgramTestContext,
    inputs: TestMintMetaplexNftInputs,
) -> TestMplxNft {
    let mint = Keypair::new();
    let metadata = Metadata::find_pda(&mint.pubkey()).0;
    let master_edition = MasterEdition::find_pda(&mint.pubkey()).0;

    let mut signers = vec![&context.payer, &mint, &inputs.update_authority];

    let payer = inputs
        .payer
        .unwrap_or(inputs.update_authority.dirty_clone());

    if payer.pubkey() != inputs.update_authority.pubkey() {
        signers.push(&payer);
    }

    let owner = inputs.owner.unwrap_or(inputs.update_authority.pubkey());
    let token = Pubkey::find_program_address(
        &[
            owner.as_ref(),
            TOKEN_PROGRAM_ID.as_ref(),
            mint.pubkey().as_ref(),
        ],
        &ATA_PROGRAM_ID,
    )
    .0;

    let create_ix = CreateV1Builder::new()
        .metadata(metadata)
        .master_edition(Some(master_edition))
        .mint(mint.pubkey(), true)
        .authority(inputs.update_authority.pubkey())
        .payer(payer.pubkey())
        .update_authority(inputs.update_authority.pubkey(), false)
        .spl_token_program(Some(TOKEN_PROGRAM_ID))
        .name(String::from("My NFT"))
        .uri(String::from("https://example.com"))
        .seller_fee_basis_points(550)
        .token_standard(TokenStandard::NonFungible)
        .print_supply(PrintSupply::Zero)
        .instruction();

    let mint_ix = MintV1Builder::new()
        .token(token)
        .token_owner(Some(owner))
        .metadata(metadata)
        .master_edition(Some(master_edition))
        .mint(mint.pubkey())
        .authority(inputs.update_authority.pubkey())
        .payer(payer.pubkey())
        .spl_token_program(TOKEN_PROGRAM_ID)
        .amount(1)
        .instruction();

    let tx = Transaction::new_signed_with_payer(
        &[create_ix, mint_ix],
        Some(&context.payer.pubkey()),
        &signers,
        context.last_blockhash,
    );
    context.banks_client.process_transaction(tx).await.unwrap();

    TestMplxNft {
        mint: mint.pubkey(),
        metadata,
        master_edition,
    }
}
