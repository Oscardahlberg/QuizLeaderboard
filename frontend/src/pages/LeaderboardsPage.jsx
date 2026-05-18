import { useCallback, useEffect, useState } from 'react';
import LeaderboardTable from '../components/LeaderboardTable';
import { getLatestWeeklyLeaderboard, getLatestYearlyLeaderboard } from '../lib/api';

function LeaderboardsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [latestYearly, setLatestYearly] = useState({ year: null, rows: []});
  const [latestWeekly, setLatestWeekly] = useState({ year: null, week: null, rows: [] });
  const [year, setYear] = useState(new Date().getFullYear());

  const loadLeaderboards = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const [yearly, weekly] = await Promise.all([
        getLatestYearlyLeaderboard(),
        getLatestWeeklyLeaderboard(),
      ]);
      setLatestYearly(yearly);
      setLatestWeekly(weekly);
    } catch (loadError) {
      setError(loadError.message || 'Unable to load leaderboard data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeaderboards();
  }, [loadLeaderboards]);

  return (
    <div className="page-stack">
      <section className="card">
        <h2>Leaderboards</h2>
        <div className="filters">
          <label htmlFor="year-input">Year</label>
          <input
            id="year-input"
            type="number"
            min="2000"
            max="9999"
            value={year}
            onChange={(event) => setYear(Number(event.target.value))}
          />
          <button type="button" onClick={loadLeaderboards}>
            Refresh
          </button>
        </div>
      </section>

      {error && <p className="error-text">{error}</p>}

      {isLoading ? (
        <section className="card">
          <p className="muted">Loading leaderboard data...</p>
        </section>
      ) : (
        <>
          <LeaderboardTable
            title={`Yearly Leaderboard (${latestYearly.year})`}
            rows={latestYearly.rows}
            pointsField="year_points"
          />
          <LeaderboardTable
            title={
              latestWeekly.week
                ? `Latest Weekly Leaderboard (Week ${latestWeekly.week}, ${latestWeekly.year})`
                : `Latest Weekly Leaderboard (${latestYearly.year})`
            }
            rows={latestWeekly.rows}
            pointsField="points"
          />
        </>
      )}
    </div>
  );
}

export default LeaderboardsPage;
