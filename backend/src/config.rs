use anyhow::Context;

pub struct Config {
    pub database_url: String,
    pub port: u16,
    pub supabase_jwt_secret: String,
}

impl Config {
    pub fn from_env() -> anyhow::Result<Self> {
        Ok(Self {
            database_url: std::env::var("DATABASE_URL")
                .context("DATABASE_URL must be set")?,
            port: std::env::var("PORT")
                .unwrap_or_else(|_| "3000".to_string())
                .parse()
                .context("PORT must be a valid port number")?,
            supabase_jwt_secret: std::env::var("SUPABASE_JWT_SECRET")
                .context("SUPABASE_JWT_SECRET must be set")?,
        })
    }
}
