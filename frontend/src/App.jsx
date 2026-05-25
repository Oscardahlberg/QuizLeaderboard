import { Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthUser, logoutAuthUser } from './hooks/useAuthUser';
import LeaderboardsPage from './pages/LeaderboardsPage';
import AllWeeklyLeaderboardsPage from './pages/AllWeeklyLeaderboardsPage';
import WeekLeaderboardPage from './pages/WeekLeaderboardPage';
import AllYearlyLeaderboardsPage from './pages/AllYearlyLeaderboardsPage';
import YearLeaderboardPage from './pages/YearLeaderboardPage';
import AdminPage from './pages/AdminPage';
import TeamsPage from './pages/TeamsPage';
import { supabase } from './lib/supabase';

function App() {
  const user = useAuthUser();

  return (
    <div className="app-shell">
      <header className="top-nav">
        <nav>
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            end
          >
          <h1 id="title">QUIZ CHAMPIONSHIP SCORES</h1>
          </NavLink>
        </nav>
      </header>

      <main className="page-content">
        <Routes>
          <Route path="/" element={<LeaderboardsPage />} />
          <Route path="/all/weeks" element={<AllWeeklyLeaderboardsPage />} />
          <Route path="/year/:year/week/:week" element={<WeekLeaderboardPage />} />
          <Route path="/all/years" element={<AllYearlyLeaderboardsPage />} />
          <Route path="/year/:year" element={<YearLeaderboardPage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer>
        {user ?
            (
            <div>
            <NavLink
            to="/teams"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
            Teams
            </NavLink>
            <button onClick={logoutAuthUser} id="logout-btn">
              Admin Logout
            </button>
            </div>
            ) : (
          <NavLink
            to="/admin"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Admin Login
          </NavLink>
        )}
      </footer>
    </div>
  );
}

export default App;
