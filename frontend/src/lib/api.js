import { supabase } from "./supabase";

const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api"
).replace(/\/$/, "");

async function request(path, options = {}) {
    let headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
    };

    // Add authorization token if user is logged in
    try {
        const {
            data: { session },
        } = await supabase.auth.getSession();
        if (session?.access_token) {
            headers["Authorization"] = `Bearer ${session.access_token}`;
        }
    } catch (err) {
        console.warn("Failed to get Supabase session:", err);
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(
            text || `Request failed with status ${response.status}`
        );
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

function getIsoWeek(date) {
    const utcDate = new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const day = utcDate.getUTCDay() || 7;
    utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
    return Math.ceil(((utcDate - yearStart) / 86400000 + 1) / 7);
}

export async function getYearlyLeaderboard(year) {
    return request(`/year/${year}`);
}

export async function getWeeklyLeaderboard(week, year) {
    return request(`/week/${week}/${year}`);
}

export async function getLatestYearlyLeaderboard() {
    const rows = await request(`/latest/year`);
    let year = rows?.[0]?.year ?? null;
    return { year, rows };
}

export async function getLatestWeeklyLeaderboard() {
    const rows = await request(`/latest/week`);
    let year = rows?.[0]?.year ?? null;
    let week = rows?.[0]?.week ?? null;
    return { year, week, rows };
}

export async function createOrUpdateTeam(payload) {
    return request("/teams", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}
