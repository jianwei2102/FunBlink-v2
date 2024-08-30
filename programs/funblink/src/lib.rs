use anchor_lang::prelude::*;

declare_id!("5Z4UkWTCAQu2sNRKkq4GcredbKuF9jGdSxG5mH7ypY6B");

#[program]
pub mod funblink {
    use super::*;

    pub fn create_blink(
        ctx: Context<CreateBlink>, 
        id: String, 
        title: String, 
        icon: String, 
        description: String, 
        label: String, 
        to_pubkey: String, 
        link: String
    ) -> Result<()> {
        let blink_list = &mut ctx.accounts.blink_list;
        blink_list.is_initialized = true;

        let new_blink = Blink {
            id,
            title,
            icon,
            description,
            label,
            to_pubkey,
            link,
        };

        blink_list.blinks.push(new_blink);

        Ok(())
    }

    pub fn delete_blink(ctx: Context<DeleteBlink>, id: String) -> Result<()> {
        let blink_list = &mut ctx.accounts.blink_list;

        // Check if the Blink account exists (is initialized)
        if !blink_list.is_initialized {
            return err!(ErrorCode::BlinkNotExist);
        }

        blink_list.blinks.retain(|blink: &Blink| blink.id != id);
        Ok(())
    }

    pub fn close_blink(ctx: Context<CloseBlink>) -> Result<()> {
        let blink_list = &mut ctx.accounts.blink_list;
        blink_list.is_initialized = false;

        // Check if the Blink account exists (is initialized)
        if !blink_list.is_initialized {
            return err!(ErrorCode::BlinkNotExist);
        }

        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateBlink<'info> {
    #[account(init_if_needed, payer = signer, space = 2048, seeds = [b"blink_list", signer.key().as_ref()], bump)]
    pub blink_list: Account<'info, BlinkList>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DeleteBlink<'info> {
    #[account(mut, seeds = [b"blink_list", signer.key().as_ref()], bump)]
    pub blink_list: Account<'info, BlinkList>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CloseBlink<'info> {
    #[account(mut, close = signer, seeds = [b"blink_list", signer.key().as_ref()], bump)]
    pub blink_list: Account<'info, BlinkList>,
    #[account(mut)]
    pub signer: Signer<'info>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct Blink {
    id: String,
    title: String,
    icon: String,
    description: String,
    label: String,
    to_pubkey: String,
    link: String,
}

#[account]
pub struct BlinkList {
    blinks: Vec<Blink>,
    is_initialized: bool,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Blink exists")]
    BlinkExists,
    #[msg("Blink does not exist")]
    BlinkNotExist,
}

