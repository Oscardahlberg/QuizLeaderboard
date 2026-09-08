use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct TeamWithPoints {
    pub team_id: Uuid,
    pub name: String,
    pub points: f64,
}

#[derive(Debug, Deserialize)]
pub struct CreateTeamRequest {
    pub name: String,
    pub points: f64,
    pub week: i32,
    pub year: i32,
}

#[derive(Debug, Deserialize)]
pub struct GetTeamRequest {
    pub name: String,
}

#[derive(Debug, Deserialize, sqlx::FromRow)]
pub struct WeekYear {
    pub week: i32,
    pub year: i32,
}

#[derive(Debug, Deserialize, sqlx::FromRow)]
pub struct Year {
    pub year: i32,
}
