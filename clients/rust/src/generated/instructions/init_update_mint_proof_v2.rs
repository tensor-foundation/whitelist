//! This code was AUTOGENERATED using the codama library.
//! Please DO NOT EDIT THIS FILE, instead use visitors
//! to add features, then rerun codama to update it.
//!
//! <https://github.com/codama-idl/codama>
//!

use borsh::BorshDeserialize;
use borsh::BorshSerialize;

/// Accounts.
pub struct InitUpdateMintProofV2 {
    /// Rent payer for the mint proof account if it is initialized.
    pub payer: solana_program::pubkey::Pubkey,
    /// The mint or asset account for which the proof is being created.
    pub mint: solana_program::pubkey::Pubkey,
    /// The whitelist account that the mint proof must validate against.
    pub whitelist: solana_program::pubkey::Pubkey,
    /// The mint proof account to initialize or update.
    pub mint_proof: solana_program::pubkey::Pubkey,
    /// The Solana system program account.
    pub system_program: solana_program::pubkey::Pubkey,
}

impl InitUpdateMintProofV2 {
    pub fn instruction(
        &self,
        args: InitUpdateMintProofV2InstructionArgs,
    ) -> solana_program::instruction::Instruction {
        self.instruction_with_remaining_accounts(args, &[])
    }
    #[allow(clippy::vec_init_then_push)]
    pub fn instruction_with_remaining_accounts(
        &self,
        args: InitUpdateMintProofV2InstructionArgs,
        remaining_accounts: &[solana_program::instruction::AccountMeta],
    ) -> solana_program::instruction::Instruction {
        let mut accounts = Vec::with_capacity(5 + remaining_accounts.len());
        accounts.push(solana_program::instruction::AccountMeta::new(
            self.payer, true,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.mint, false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.whitelist,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            self.mint_proof,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.system_program,
            false,
        ));
        accounts.extend_from_slice(remaining_accounts);
        let mut data = InitUpdateMintProofV2InstructionData::new()
            .try_to_vec()
            .unwrap();
        let mut args = args.try_to_vec().unwrap();
        data.append(&mut args);

        solana_program::instruction::Instruction {
            program_id: crate::TENSOR_WHITELIST_ID,
            accounts,
            data,
        }
    }
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct InitUpdateMintProofV2InstructionData {
    discriminator: [u8; 8],
}

impl InitUpdateMintProofV2InstructionData {
    pub fn new() -> Self {
        Self {
            discriminator: [35, 185, 181, 108, 143, 139, 228, 45],
        }
    }
}

impl Default for InitUpdateMintProofV2InstructionData {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(BorshSerialize, BorshDeserialize, Clone, Debug, Eq, PartialEq)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub struct InitUpdateMintProofV2InstructionArgs {
    pub proof: Vec<[u8; 32]>,
}

/// Instruction builder for `InitUpdateMintProofV2`.
///
/// ### Accounts:
///
///   0. `[writable, signer]` payer
///   1. `[]` mint
///   2. `[]` whitelist
///   3. `[writable]` mint_proof
///   4. `[optional]` system_program (default to `11111111111111111111111111111111`)
#[derive(Clone, Debug, Default)]
pub struct InitUpdateMintProofV2Builder {
    payer: Option<solana_program::pubkey::Pubkey>,
    mint: Option<solana_program::pubkey::Pubkey>,
    whitelist: Option<solana_program::pubkey::Pubkey>,
    mint_proof: Option<solana_program::pubkey::Pubkey>,
    system_program: Option<solana_program::pubkey::Pubkey>,
    proof: Option<Vec<[u8; 32]>>,
    __remaining_accounts: Vec<solana_program::instruction::AccountMeta>,
}

impl InitUpdateMintProofV2Builder {
    pub fn new() -> Self {
        Self::default()
    }
    /// Rent payer for the mint proof account if it is initialized.
    #[inline(always)]
    pub fn payer(&mut self, payer: solana_program::pubkey::Pubkey) -> &mut Self {
        self.payer = Some(payer);
        self
    }
    /// The mint or asset account for which the proof is being created.
    #[inline(always)]
    pub fn mint(&mut self, mint: solana_program::pubkey::Pubkey) -> &mut Self {
        self.mint = Some(mint);
        self
    }
    /// The whitelist account that the mint proof must validate against.
    #[inline(always)]
    pub fn whitelist(&mut self, whitelist: solana_program::pubkey::Pubkey) -> &mut Self {
        self.whitelist = Some(whitelist);
        self
    }
    /// The mint proof account to initialize or update.
    #[inline(always)]
    pub fn mint_proof(&mut self, mint_proof: solana_program::pubkey::Pubkey) -> &mut Self {
        self.mint_proof = Some(mint_proof);
        self
    }
    /// `[optional account, default to '11111111111111111111111111111111']`
    /// The Solana system program account.
    #[inline(always)]
    pub fn system_program(&mut self, system_program: solana_program::pubkey::Pubkey) -> &mut Self {
        self.system_program = Some(system_program);
        self
    }
    #[inline(always)]
    pub fn proof(&mut self, proof: Vec<[u8; 32]>) -> &mut Self {
        self.proof = Some(proof);
        self
    }
    /// Add an additional account to the instruction.
    #[inline(always)]
    pub fn add_remaining_account(
        &mut self,
        account: solana_program::instruction::AccountMeta,
    ) -> &mut Self {
        self.__remaining_accounts.push(account);
        self
    }
    /// Add additional accounts to the instruction.
    #[inline(always)]
    pub fn add_remaining_accounts(
        &mut self,
        accounts: &[solana_program::instruction::AccountMeta],
    ) -> &mut Self {
        self.__remaining_accounts.extend_from_slice(accounts);
        self
    }
    #[allow(clippy::clone_on_copy)]
    pub fn instruction(&self) -> solana_program::instruction::Instruction {
        let accounts = InitUpdateMintProofV2 {
            payer: self.payer.expect("payer is not set"),
            mint: self.mint.expect("mint is not set"),
            whitelist: self.whitelist.expect("whitelist is not set"),
            mint_proof: self.mint_proof.expect("mint_proof is not set"),
            system_program: self
                .system_program
                .unwrap_or(solana_program::pubkey!("11111111111111111111111111111111")),
        };
        let args = InitUpdateMintProofV2InstructionArgs {
            proof: self.proof.clone().expect("proof is not set"),
        };

        accounts.instruction_with_remaining_accounts(args, &self.__remaining_accounts)
    }
}

/// `init_update_mint_proof_v2` CPI accounts.
pub struct InitUpdateMintProofV2CpiAccounts<'a, 'b> {
    /// Rent payer for the mint proof account if it is initialized.
    pub payer: &'b solana_program::account_info::AccountInfo<'a>,
    /// The mint or asset account for which the proof is being created.
    pub mint: &'b solana_program::account_info::AccountInfo<'a>,
    /// The whitelist account that the mint proof must validate against.
    pub whitelist: &'b solana_program::account_info::AccountInfo<'a>,
    /// The mint proof account to initialize or update.
    pub mint_proof: &'b solana_program::account_info::AccountInfo<'a>,
    /// The Solana system program account.
    pub system_program: &'b solana_program::account_info::AccountInfo<'a>,
}

/// `init_update_mint_proof_v2` CPI instruction.
pub struct InitUpdateMintProofV2Cpi<'a, 'b> {
    /// The program to invoke.
    pub __program: &'b solana_program::account_info::AccountInfo<'a>,
    /// Rent payer for the mint proof account if it is initialized.
    pub payer: &'b solana_program::account_info::AccountInfo<'a>,
    /// The mint or asset account for which the proof is being created.
    pub mint: &'b solana_program::account_info::AccountInfo<'a>,
    /// The whitelist account that the mint proof must validate against.
    pub whitelist: &'b solana_program::account_info::AccountInfo<'a>,
    /// The mint proof account to initialize or update.
    pub mint_proof: &'b solana_program::account_info::AccountInfo<'a>,
    /// The Solana system program account.
    pub system_program: &'b solana_program::account_info::AccountInfo<'a>,
    /// The arguments for the instruction.
    pub __args: InitUpdateMintProofV2InstructionArgs,
}

impl<'a, 'b> InitUpdateMintProofV2Cpi<'a, 'b> {
    pub fn new(
        program: &'b solana_program::account_info::AccountInfo<'a>,
        accounts: InitUpdateMintProofV2CpiAccounts<'a, 'b>,
        args: InitUpdateMintProofV2InstructionArgs,
    ) -> Self {
        Self {
            __program: program,
            payer: accounts.payer,
            mint: accounts.mint,
            whitelist: accounts.whitelist,
            mint_proof: accounts.mint_proof,
            system_program: accounts.system_program,
            __args: args,
        }
    }
    #[inline(always)]
    pub fn invoke(&self) -> solana_program::entrypoint::ProgramResult {
        self.invoke_signed_with_remaining_accounts(&[], &[])
    }
    #[inline(always)]
    pub fn invoke_with_remaining_accounts(
        &self,
        remaining_accounts: &[(
            &'b solana_program::account_info::AccountInfo<'a>,
            bool,
            bool,
        )],
    ) -> solana_program::entrypoint::ProgramResult {
        self.invoke_signed_with_remaining_accounts(&[], remaining_accounts)
    }
    #[inline(always)]
    pub fn invoke_signed(
        &self,
        signers_seeds: &[&[&[u8]]],
    ) -> solana_program::entrypoint::ProgramResult {
        self.invoke_signed_with_remaining_accounts(signers_seeds, &[])
    }
    #[allow(clippy::clone_on_copy)]
    #[allow(clippy::vec_init_then_push)]
    pub fn invoke_signed_with_remaining_accounts(
        &self,
        signers_seeds: &[&[&[u8]]],
        remaining_accounts: &[(
            &'b solana_program::account_info::AccountInfo<'a>,
            bool,
            bool,
        )],
    ) -> solana_program::entrypoint::ProgramResult {
        let mut accounts = Vec::with_capacity(5 + remaining_accounts.len());
        accounts.push(solana_program::instruction::AccountMeta::new(
            *self.payer.key,
            true,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.mint.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.whitelist.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            *self.mint_proof.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.system_program.key,
            false,
        ));
        remaining_accounts.iter().for_each(|remaining_account| {
            accounts.push(solana_program::instruction::AccountMeta {
                pubkey: *remaining_account.0.key,
                is_signer: remaining_account.1,
                is_writable: remaining_account.2,
            })
        });
        let mut data = InitUpdateMintProofV2InstructionData::new()
            .try_to_vec()
            .unwrap();
        let mut args = self.__args.try_to_vec().unwrap();
        data.append(&mut args);

        let instruction = solana_program::instruction::Instruction {
            program_id: crate::TENSOR_WHITELIST_ID,
            accounts,
            data,
        };
        let mut account_infos = Vec::with_capacity(5 + 1 + remaining_accounts.len());
        account_infos.push(self.__program.clone());
        account_infos.push(self.payer.clone());
        account_infos.push(self.mint.clone());
        account_infos.push(self.whitelist.clone());
        account_infos.push(self.mint_proof.clone());
        account_infos.push(self.system_program.clone());
        remaining_accounts
            .iter()
            .for_each(|remaining_account| account_infos.push(remaining_account.0.clone()));

        if signers_seeds.is_empty() {
            solana_program::program::invoke(&instruction, &account_infos)
        } else {
            solana_program::program::invoke_signed(&instruction, &account_infos, signers_seeds)
        }
    }
}

/// Instruction builder for `InitUpdateMintProofV2` via CPI.
///
/// ### Accounts:
///
///   0. `[writable, signer]` payer
///   1. `[]` mint
///   2. `[]` whitelist
///   3. `[writable]` mint_proof
///   4. `[]` system_program
#[derive(Clone, Debug)]
pub struct InitUpdateMintProofV2CpiBuilder<'a, 'b> {
    instruction: Box<InitUpdateMintProofV2CpiBuilderInstruction<'a, 'b>>,
}

impl<'a, 'b> InitUpdateMintProofV2CpiBuilder<'a, 'b> {
    pub fn new(program: &'b solana_program::account_info::AccountInfo<'a>) -> Self {
        let instruction = Box::new(InitUpdateMintProofV2CpiBuilderInstruction {
            __program: program,
            payer: None,
            mint: None,
            whitelist: None,
            mint_proof: None,
            system_program: None,
            proof: None,
            __remaining_accounts: Vec::new(),
        });
        Self { instruction }
    }
    /// Rent payer for the mint proof account if it is initialized.
    #[inline(always)]
    pub fn payer(&mut self, payer: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
        self.instruction.payer = Some(payer);
        self
    }
    /// The mint or asset account for which the proof is being created.
    #[inline(always)]
    pub fn mint(&mut self, mint: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
        self.instruction.mint = Some(mint);
        self
    }
    /// The whitelist account that the mint proof must validate against.
    #[inline(always)]
    pub fn whitelist(
        &mut self,
        whitelist: &'b solana_program::account_info::AccountInfo<'a>,
    ) -> &mut Self {
        self.instruction.whitelist = Some(whitelist);
        self
    }
    /// The mint proof account to initialize or update.
    #[inline(always)]
    pub fn mint_proof(
        &mut self,
        mint_proof: &'b solana_program::account_info::AccountInfo<'a>,
    ) -> &mut Self {
        self.instruction.mint_proof = Some(mint_proof);
        self
    }
    /// The Solana system program account.
    #[inline(always)]
    pub fn system_program(
        &mut self,
        system_program: &'b solana_program::account_info::AccountInfo<'a>,
    ) -> &mut Self {
        self.instruction.system_program = Some(system_program);
        self
    }
    #[inline(always)]
    pub fn proof(&mut self, proof: Vec<[u8; 32]>) -> &mut Self {
        self.instruction.proof = Some(proof);
        self
    }
    /// Add an additional account to the instruction.
    #[inline(always)]
    pub fn add_remaining_account(
        &mut self,
        account: &'b solana_program::account_info::AccountInfo<'a>,
        is_writable: bool,
        is_signer: bool,
    ) -> &mut Self {
        self.instruction
            .__remaining_accounts
            .push((account, is_writable, is_signer));
        self
    }
    /// Add additional accounts to the instruction.
    ///
    /// Each account is represented by a tuple of the `AccountInfo`, a `bool` indicating whether the account is writable or not,
    /// and a `bool` indicating whether the account is a signer or not.
    #[inline(always)]
    pub fn add_remaining_accounts(
        &mut self,
        accounts: &[(
            &'b solana_program::account_info::AccountInfo<'a>,
            bool,
            bool,
        )],
    ) -> &mut Self {
        self.instruction
            .__remaining_accounts
            .extend_from_slice(accounts);
        self
    }
    #[inline(always)]
    pub fn invoke(&self) -> solana_program::entrypoint::ProgramResult {
        self.invoke_signed(&[])
    }
    #[allow(clippy::clone_on_copy)]
    #[allow(clippy::vec_init_then_push)]
    pub fn invoke_signed(
        &self,
        signers_seeds: &[&[&[u8]]],
    ) -> solana_program::entrypoint::ProgramResult {
        let args = InitUpdateMintProofV2InstructionArgs {
            proof: self.instruction.proof.clone().expect("proof is not set"),
        };
        let instruction = InitUpdateMintProofV2Cpi {
            __program: self.instruction.__program,

            payer: self.instruction.payer.expect("payer is not set"),

            mint: self.instruction.mint.expect("mint is not set"),

            whitelist: self.instruction.whitelist.expect("whitelist is not set"),

            mint_proof: self.instruction.mint_proof.expect("mint_proof is not set"),

            system_program: self
                .instruction
                .system_program
                .expect("system_program is not set"),
            __args: args,
        };
        instruction.invoke_signed_with_remaining_accounts(
            signers_seeds,
            &self.instruction.__remaining_accounts,
        )
    }
}

#[derive(Clone, Debug)]
struct InitUpdateMintProofV2CpiBuilderInstruction<'a, 'b> {
    __program: &'b solana_program::account_info::AccountInfo<'a>,
    payer: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    mint: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    whitelist: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    mint_proof: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    system_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    proof: Option<Vec<[u8; 32]>>,
    /// Additional instruction accounts `(AccountInfo, is_writable, is_signer)`.
    __remaining_accounts: Vec<(
        &'b solana_program::account_info::AccountInfo<'a>,
        bool,
        bool,
    )>,
}
