import { useCallback, useEffect, useState } from 'react';
import { getWeeklyLeaderboard } from '../lib/api';
import { useParams } from "react-router-dom";
import LeaderboardTable from '../components/LeaderboardTable';

function WeekLeaderboardPage() {
  const {year, week} = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [leaderboard, setLeaderboard] = useState({});

  const loadLeaderboard = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const data = await getWeeklyLeaderboard(week, year);
      setLeaderboard(data);
    } catch (loaderror) {
      setError(loaderror.message || 'unable to load leaderboard data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  return (
    <div className="page-stack">
      {isLoading ? (
        <section className="card">
          <p className="muted">Loading leaderboard data...</p>
        </section>
      ) : (
        <LeaderboardTable
          title={`Leaderboard for ${year}, Week ${week}`}
          rows={leaderboard}
          pointsField="points"
          scoreField="year_points"
        />
      )}
    </div>
  );
}

export default WeekLeaderboardPage;
