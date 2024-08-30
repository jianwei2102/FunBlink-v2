use anchor_lang::prelude::*;

declare_id!("5Z4UkWTCAQu2sNRKkq4GcredbKuF9jGdSxG5mH7ypY6B");

#[program]
pub mod funblink {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
