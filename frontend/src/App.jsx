import { Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import LeaderboardsPage from './pages/LeaderboardsPage';
import AdminPage from './pages/AdminPage';
import TeamsPage from './pages/TeamsPage';
import { supabase } from './lib/supabase';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    } catch (err) {
      console.error('Error checking user:', err);
    }
  };
  
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setError(error.message);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

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
            <button onClick={handleLogout} id="logout-button">
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
