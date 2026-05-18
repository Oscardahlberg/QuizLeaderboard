import { useEffect, useState } from 'react';
import { createOrUpdateTeam } from '../lib/api';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

function AdminPage() {
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusError, setStatusError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    points: '',
    week: '',
    year: String(new Date().getFullYear()),
  });

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsAuthLoading(false);
      return undefined;
    }

    let isMounted = true;

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!isMounted) {
          return;
        }
        if (error) {
          setAuthError(error.message);
        }
        setSession(data.session || null);
      })
      .finally(() => {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    setAuthError('');
    setStatusMessage('');
    setStatusError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthError(error.message);
      return;
    }

    setPassword('');
  };

  const handleLogout = async () => {
    setStatusMessage('');
    setStatusError('');
    await supabase.auth.signOut();
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatusMessage('');
    setStatusError('');

    const payload = {
      name: form.name.trim(),
      points: Number(form.points),
      week: Number(form.week),
      year: Number(form.year),
    };

    if (!payload.name) {
      setStatusError('Team name is required.');
      return;
    }

    if (Number.isNaN(payload.points) || payload.points < 0) {
      setStatusError('Points must be a non-negative number.');
      return;
    }

    if (Number.isNaN(payload.week) || payload.week < 1 || payload.week > 53) {
      setStatusError('Week must be between 1 and 53.');
      return;
    }

    if (Number.isNaN(payload.year) || payload.year < 2000) {
      setStatusError('Year must be valid.');
      return;
    }

    setIsSaving(true);
    try {
      await createOrUpdateTeam(payload);
      setStatusMessage('Team saved successfully.');
      setForm((prev) => ({ ...prev, name: '', points: '', week: '' }));
    } catch (submitError) {
      setStatusError(submitError.message || 'Failed to save team.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <section className="card">
        <h2>Admin</h2>
        <p className="error-text">
          Supabase is not configured. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in
          `frontend/.env`.
        </p>
      </section>
    );
  }

  if (isAuthLoading) {
    return (
      <section className="card">
        <h2>Admin</h2>
        <p className="muted">Checking session...</p>
      </section>
    );
  }

  return (
    <div className="page-stack">
      <section className="card">
        <h2>Admin</h2>
        {!session ? (
          <form className="form-grid" onSubmit={handleLogin}>
            <label htmlFor="admin-email">Email</label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            <button type="submit">Sign in</button>
            {authError && <p className="error-text">{authError}</p>}
          </form>
        ) : (
          <div className="admin-header">
            <p>
              Signed in as <strong>{session.user?.email || 'admin'}</strong>
            </p>
            <button type="button" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        )}
      </section>

      {session && (
        <section className="card">
          <h3>Add Team Points</h3>
          <form className="form-grid" onSubmit={handleSubmit}>
            <label htmlFor="team-name">Team name</label>
            <input
              id="team-name"
              name="name"
              value={form.name}
              onChange={handleFormChange}
              required
            />

            <label htmlFor="team-points">Points</label>
            <input
              id="team-points"
              name="points"
              type="number"
              min="0"
              value={form.points}
              onChange={handleFormChange}
              required
            />

            <label htmlFor="team-week">Week</label>
            <input
              id="team-week"
              name="week"
              type="number"
              min="1"
              max="53"
              value={form.week}
              onChange={handleFormChange}
              required
            />

            <label htmlFor="team-year">Year</label>
            <input
              id="team-year"
              name="year"
              type="number"
              min="2000"
              max="9999"
              value={form.year}
              onChange={handleFormChange}
              required
            />

            <button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save team'}
            </button>
          </form>

          {statusMessage && <p className="success-text">{statusMessage}</p>}
          {statusError && <p className="error-text">{statusError}</p>}
        </section>
      )}
    </div>
  );
}

export default AdminPage;
