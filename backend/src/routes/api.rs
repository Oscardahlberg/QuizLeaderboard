use axum::{
    routing::{delete, get, post},
    middleware,
    Router,
};
use sqlx::PgPool;

use crate::handlers::{teams, leaderboards};
use crate::middleware::auth_middleware;

pub fn router(pool: PgPool) -> Router {
    let protected_routes = Router::new()
        // Protected write routes
        .route("/teams", post(teams::update_team).get(teams::get_team).delete(teams::delete_team))
        .route("/teams/entry/:week/:year", delete(teams::delete_team_entry))
        .layer(middleware::from_fn(auth_middleware));

    let public_routes = Router::new()
        // Public read routes
        .route("/teams/:week/:year", get(teams::list_teams))
        .route("/year/:year", get(leaderboards::yearly_leaderboard))
        .route("/latest/year", get(leaderboards::latest_yearly_leaderboard))
        .route("/all/years", get(leaderboards::all_yearly_leaderboard))
        .route("/week/:week/:year", get(leaderboards::weekly_leaderboard))
        .route("/latest/week", get(leaderboards::latest_weekly_leaderboard))
        .route("/all/weeks", get(leaderboards::all_weekly_leaderboard));

    Router::new()
        .merge(public_routes)
        .merge(protected_routes)
        .with_state(pool)
}
