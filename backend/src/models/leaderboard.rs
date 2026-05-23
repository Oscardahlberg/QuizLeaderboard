use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct WeekLeaderboard {
    pub rank: i32,
    pub team_id: Uuid,
    pub name: String,
    pub points: i32,
    pub year_points: i32,
    pub week: i32,
    pub year: i32,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct YearLeaderboard {
    pub rank: i32,
    pub team_id: Uuid,
    pub name: String,
    pub year_points: i32,
    pub year: i32,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct AllYearLeaderboard {
    pub year: i32,
}
