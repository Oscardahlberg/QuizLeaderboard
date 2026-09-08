use axum::{
    extract::{Path, State},
    Json,
};

use sqlx::PgPool;

use crate::{
    error::{Result},
    models::leaderboard::{WeekLeaderboard, YearLeaderboard, AllYearLeaderboard, AllWeekLeaderboard},
    handlers::teams::{get_teams},
};


pub async fn yearly_leaderboard(
    State(pool): State<PgPool>,
    Path(year): Path<i32>,
    ) -> Result<Json<Vec<YearLeaderboard>>> {
    let teams = sqlx::query_as::<_, YearLeaderboard>(
        r#"SELECT rank, name, team_id, year_points, year
        FROM yearly_leaderboard
WHERE year = $1
        ORDER BY rank
        "#,
    )
    .bind(year)
    .fetch_all(&pool)
    .await?;
    Ok(Json(teams))
}

pub async fn latest_yearly_leaderboard(
    State(pool): State<PgPool>,
    ) -> Result<Json<Vec<YearLeaderboard>>> {
    let teams = sqlx::query_as::<_, YearLeaderboard>(
        r#"SELECT rank, name, team_id, year_points, year
        FROM yearly_leaderboard
        WHERE year = (
            SELECT MAX(year)
            FROM yearly_leaderboard
        )
        ORDER BY rank
        "#,
    )
    .fetch_all(&pool)
    .await?;
    Ok(Json(teams))
}

pub async fn weekly_leaderboard(
    State(pool): State<PgPool>,
    Path((week, year)): Path<(i32, i32)>,
    ) -> Result<Json<Vec<WeekLeaderboard>>> {
    let teams = get_weekly_leaderboard(&pool, year, week).await?;
    Ok(Json(teams))
}

pub async fn get_weekly_leaderboard(
    pool: &PgPool, year: i32, week: i32,
    ) -> Result<Vec<WeekLeaderboard>> {
    let teams = sqlx::query_as::<_, WeekLeaderboard>(
        r#"SELECT rank, name, team_id, points, year_points, week, year
        FROM weekly_leaderboard
        WHERE year = $1 AND week = $2
        ORDER BY rank
        "#,
    )
    .bind(year)
    .bind(week)
    .fetch_all(pool)
    .await?;
    Ok(teams)
}

pub async fn latest_weekly_leaderboard(
    State(pool): State<PgPool>,
    ) -> Result<Json<Vec<WeekLeaderboard>>> {
    let teams = sqlx::query_as::<_, WeekLeaderboard>(
        r#"SELECT rank, name, team_id, points, year_points, year, week
        FROM weekly_leaderboard
        WHERE (year, week) = (
            SELECT year, week
            FROM weekly_leaderboard
            ORDER BY year DESC, week DESC
            LIMIT 1
        )
        ORDER BY rank
        "#,
    )
    .fetch_all(&pool)
    .await?;
    Ok(Json(teams))
}

pub async fn update_weekly_leaderboard(
    pool: &PgPool, year: i32, week: i32
    ) -> Result<()> {

    sqlx::query(
        "DELETE FROM weekly_leaderboard WHERE year = $1 AND week = $2"
    )
    .bind(year)
    .bind(week)
    .execute(pool)
    .await?;

    let teams = get_teams(pool, year, week).await?;
    let mut rank = 1;

    let mut prev_points: f64 = -1.0;
    for team in teams {
        if team.points == prev_points {
            rank = rank - 1;
        }
        sqlx::query(
            r#"
            INSERT INTO weekly_leaderboard
            (team_id, name, year, week, rank, points, year_points)
            VALUES
            ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (team_id, year, week)
            DO UPDATE SET
            rank = EXCLUDED.rank,
            points = EXCLUDED.points,
            year_points = EXCLUDED.year_points,
            name = EXCLUDED.name
        "#
        )
        .bind(team.team_id)
        .bind(team.name)
        .bind(year)
        .bind(week)
        .bind(rank)
        .bind(team.points)
        .bind(points(rank))
        .execute(pool)
        .await?;

        prev_points = team.points;
        rank += 1;
    }
    Ok(())
}

pub async fn update_yearly_leaderboard(
    pool: &PgPool,
    year: i32,
    ) -> Result<()> {
    let tx = pool.begin().await?;

    // remove old yearly leaderboard for this year
    sqlx::query(
        r#"
        DELETE FROM yearly_leaderboard
        WHERE year = $1
        "#
    )
    .bind(year)
    .execute(pool)
    .await?;

    // get summed yearly points from weekly leaderboard
    let rows = sqlx::query!(
        r#"
        SELECT
            team_id,
            name,
            SUM(year_points)::int as year_points
        FROM weekly_leaderboard
        WHERE year = $1
        GROUP BY team_id, name
        ORDER BY year_points DESC
        LIMIT 15
        "#,
        year
    )
    .fetch_all(pool)
    .await?;

    // insert ranked yearly leaderboard
    for (index, row) in rows.into_iter().enumerate() {
        let rank = (index + 1) as i32;

        sqlx::query(
            r#"
            INSERT INTO yearly_leaderboard
            (
                team_id,
                name,
                year,
                rank,
                year_points
            )
            VALUES
            ($1, $2, $3, $4, $5)
            "#
        )
        .bind(row.team_id)
        .bind(row.name)
        .bind(year)
        .bind(rank)
        .bind(row.year_points)
        .execute(pool)
        .await?;
    }

    tx.commit().await?;
    Ok(())
}

pub async fn all_weekly_leaderboard(
    State(pool): State<PgPool>,
    ) -> Result<Json<Vec<AllWeekLeaderboard>>> {
    let weekly_occurances = sqlx::query_as::<_, AllWeekLeaderboard>(
        r#"SELECT COUNT(*)::int AS teams, week, year
        FROM weekly_leaderboard
        GROUP BY year, week
        ORDER BY year DESC, week DESC
        "#,
    )
    .fetch_all(&pool)
    .await?;
    Ok(Json(weekly_occurances))
}

pub async fn all_yearly_leaderboard(
    State(pool): State<PgPool>,
    ) -> Result<Json<Vec<AllYearLeaderboard>>> {
    let years = sqlx::query_as::<_, AllYearLeaderboard>(
        r#"SELECT DISTINCT year
        FROM yearly_leaderboard
        ORDER BY year ASC
        "#,
    )
    .fetch_all(&pool)
    .await?;
    Ok(Json(years))
}

fn points(place: i32) -> i32 {
    match place {
    1 => 25,
    2 => 18,
    3 => 15,
    4 => 12,
    5 => 10,
    6 => 8,
    7 => 6,
    8 => 4,
    9 => 2,
    10 => 1,
    _ => 0,
    }
}
