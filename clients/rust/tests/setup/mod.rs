use solana_program_test::{BanksClientError, ProgramTestContext};
use solana_sdk::{pubkey::Pubkey, signer::Signer, system_instruction, transaction::Transaction};

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
