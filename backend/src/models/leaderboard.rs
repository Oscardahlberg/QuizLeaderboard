use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Leaderboard {
    pub rank: i32,
    pub team_id: Uuid,
    pub name: String,
    pub points: i32,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct YearLeaderboard {
    pub rank: i32,
    pub team_id: Uuid,
    pub name: String,
    pub year_points: i32,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct LatestWeeklyLeaderboard {
    pub rank: i32,
    pub team_id: Uuid,
    pub name: String,
    pub points: i32,
    pub year_points: i32,
    pub year: i32,
    pub week: i32,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct LatestYearlyLeaderboard {
    pub rank: i32,
    pub team_id: Uuid,
    pub name: String,
    pub year_points: i32,
    pub year: i32,
}
