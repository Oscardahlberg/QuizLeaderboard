use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use sqlx::PgPool;

use crate::{
    error::{AppError, Result},
    models::teams::{CreateTeamRequest, GetTeamRequest, TeamWithPoints, WeekYear, Year},
    handlers::leaderboards::{update_weekly_leaderboard, update_yearly_leaderboard, get_weekly_leaderboard},
};

pub async fn list_teams(
    State(pool): State<PgPool>,
    Path((week, year)): Path<(i32, i32)>,
) -> Result<Json<Vec<TeamWithPoints>>> {
    let teams = get_teams(&pool, year, week).await?;
    Ok(Json(teams))
}

pub async fn get_teams(
    pool: &PgPool, year: i32, week: i32) -> Result<Vec<TeamWithPoints>> {
    let teams = sqlx::query_as::<_, TeamWithPoints>(
        r#"SELECT team_id, name, points
           FROM team_weekly_points
           WHERE year = $1
           AND week = $2
           ORDER BY points DESC
           "#,
    )
    .bind(year)
    .bind(week)
    .fetch_all(pool)
    .await?;
    Ok(teams)
}

pub async fn update_team(
    State(pool): State<PgPool>,
    Json(req): Json<CreateTeamRequest>,
) -> Result<(StatusCode, Json<serde_json::Value>)> {
    // Check if team already exists
    let existing: Option<(String,)> = sqlx::query_as(
        "SELECT name FROM teams WHERE name = $1",
    )
    .bind(&req.name)
    .fetch_optional(&pool)
    .await?;

    let team_id = if let Some(_) = existing {
        // Team exists, fetch its ID
        let (id,): (uuid::Uuid,) = sqlx::query_as(
            "SELECT id FROM teams WHERE name = $1",
        )
        .bind(&req.name)
        .fetch_one(&pool)
        .await?;
        id
    } else {
        // Create new team
        let (id,): (uuid::Uuid,) = sqlx::query_as(
            "INSERT INTO teams (name) VALUES ($1) RETURNING id",
        )
        .bind(&req.name)
        .fetch_one(&pool)
        .await?;
        id
    };

    // Insert or update team_weekly_points
    sqlx::query(
        "INSERT INTO team_weekly_points (team_id, name, year, week, points) VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (team_id, year, week) DO UPDATE SET points = $4",
    )
    .bind(team_id)
    .bind(req.name)
    .bind(req.year)
    .bind(req.week)
    .bind(req.points)
    .execute(&pool)
    .await?;

    // UPDATES THE WEEKLY LEADERBOARD
    update_weekly_leaderboard(&pool, req.year, req.week).await?;
    // UPDATES THE WHOLE YEARLY LEADERBOARD FOR THAT YEAR
    update_yearly_leaderboard(&pool, req.year).await?;

    let team = get_weekly_leaderboard(&pool, req.year, req.week).await?;

    Ok((StatusCode::CREATED, Json(serde_json::json!({
        "message": "Team created/updated successfully",
        "current": team
    }))))
}

pub async fn get_team(
    State(pool): State<PgPool>,
    Json(req): Json<GetTeamRequest>,
) -> Result<Json<serde_json::Value>> {
    let exists: bool = sqlx::query_scalar(
        "SELECT EXISTS(SELECT 1 FROM teams WHERE name = $1)",
    )
    .bind(&req.name)
    .fetch_one(&pool)
    .await?;

    if exists {
        Ok(Json(serde_json::json!({
            "exists": true,
            "name": req.name
        })))
    } else {
        Err(AppError::NotFound(format!("Team '{}' not found", req.name)))
    }
}

pub async fn delete_team(
    State(pool): State<PgPool>,
    Json(req): Json<GetTeamRequest>,
) -> Result<StatusCode> {
    let mut tx = pool.begin().await?;

    // Get affected weeks/years within the transaction
    let affected_weeks = sqlx::query_as::<_, WeekYear>(
        "SELECT DISTINCT week, year
        FROM team_weekly_points
        WHERE name = $1"        
    )
    .bind(&req.name)
    .fetch_all(&mut *tx)
    .await?;

    let affected_years = sqlx::query_as::<_, Year>(
        "SELECT DISTINCT year
        FROM team_weekly_points
        WHERE name = $1"        
    )
    .bind(&req.name)
    .fetch_all(&mut *tx)
    .await?;

    // Delete the team within the transaction
    let result = sqlx::query(
        "DELETE FROM teams WHERE name = $1",
    )
    .bind(&req.name)
    .execute(&mut *tx)
    .await?;

    if result.rows_affected() == 0 {
        tx.rollback().await?;
        return Err(AppError::NotFound(format!("Team '{}' not found", req.name)));
    }

    // Commit the delete before updating leaderboards
    tx.commit().await?;

    // Now update leaderboards with the original pool
    for row in affected_weeks {
        update_weekly_leaderboard(&pool, row.year, row.week).await?;
    }
    for row in affected_years {
        update_yearly_leaderboard(&pool, row.year).await?;
    }

    Ok(StatusCode::NO_CONTENT)
}
