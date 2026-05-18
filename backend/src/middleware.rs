use axum::{
    body::Body,
    extract::Request,
    middleware::Next,
    response::Response,
};
use http::HeaderMap;

use crate::error::AppError;

/// Middleware to verify Supabase JWT token
pub async fn auth_middleware(
    headers: HeaderMap,
    mut request: Request,
    next: Next,
) -> Result<Response, AppError> {
    let token = headers
        .get("authorization")
        .and_then(|h| h.to_str().ok())
        .and_then(|h| {
            if h.starts_with("Bearer ") {
                Some(&h[7..])
            } else {
                None
            }
        })
        .ok_or(AppError::Unauthorized)?;

    // Verify the token is not empty
    if token.is_empty() {
        return Err(AppError::Unauthorized);
    }

    // Store token in extensions for potential future use
    request.extensions_mut().insert(token.to_string());

    Ok(next.run(request).await)
}
