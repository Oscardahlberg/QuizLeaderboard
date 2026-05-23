import { useCallback, useEffect, useState } from 'react';
import LeaderboardTable from '../components/LeaderboardTable';
import { getLatestWeeklyLeaderboard, getLatestYearlyLeaderboard } from '../lib/api';
import { NavLink } from "react-router-dom";

function LeaderboardsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [years, setYears] = useState({});
  const [latestYearly, setLatestYearly] = useState({ year: null, rows: []});
  const [latestWeekly, setLatestWeekly] = useState({ year: null, week: null, rows: [] });

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

  const loadAllYearlyLeaderboards = useCallback(async () => {
    try {
      const allYears = await getAllYearlyLeaderboard();
      setYears(allYears);
      } catch(err) {
          setError(err)
      }
    }, []);

  useEffect(() => {
    loadAllYearlyLeaderboards();
  }, [loadAllYearlyLeaderboards]);

  return (
    <div className="page-stack">
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
            scoreField=""
          />
            <NavLink id="to-all-yearly-leaderboards"
            to="/all/years">
            All yearly leaderboards
            </NavLink>
          <LeaderboardTable
            title={
              latestWeekly.week
                ? `Latest Weekly Leaderboard (Week ${latestWeekly.week}, ${latestWeekly.year})`
                : `Latest Weekly Leaderboard (${latestYearly.year})`
            }
            rows={latestWeekly.rows}
            pointsField="points"
            scoreField="year_points"
          />
        </>
      )}
    </div>
  );
}

export default LeaderboardsPage;
