import { Navigate, NavLink, Route, Routes } from 'react-router-dom';
import LeaderboardsPage from './pages/LeaderboardsPage';
import AdminPage from './pages/AdminPage';
import TeamsPage from './pages/TeamsPage';

function App() {
  return (
    <div className="app-shell">
      <header className="top-nav">
        <h1>Quiz Leaderboard</h1>
        <nav>
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            end
          >
            Leaderboards
          </NavLink>
          <NavLink
            to="/teams"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Teams
          </NavLink>
          <NavLink
            to="/admin"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Admin
          </NavLink>
        </nav>
      </header>

      <main className="page-content">
        <Routes>
          <Route path="/" element={<LeaderboardsPage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
