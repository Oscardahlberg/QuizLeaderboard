use axum::{
    routing::{delete, get, post, put},
    Router,
};
use sqlx::PgPool;

use crate::handlers::{teams, leaderboards};

pub fn router(pool: PgPool) -> Router {
    Router::new()
        // Team routes
        .route("/teams", post(teams::update_team).get(teams::get_team).delete(teams::delete_team))
        .route("/teams/:week/:year", get(teams::list_teams))
        // Leaderboard routes
        .route("/year/:year", get(leaderboards::yearly_leaderboard))
        .route("/latest/year", get(leaderboards::latest_yearly_leaderboard))
        .route("/week/:week/:year", get(leaderboards::weekly_leaderboard))
        .route("/latest/week", get(leaderboards::latest_weekly_leaderboard))
        .with_state(pool)
}
