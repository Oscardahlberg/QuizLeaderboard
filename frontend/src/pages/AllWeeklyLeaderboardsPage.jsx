import { useCallback, useEffect, useState } from 'react';
import { getAllWeeklyLeaderboards } from '../lib/api';
import { useNavigate } from "react-router-dom";

function AllWeeklyLeaderboardsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [weeks, setWeeks] = useState([]);

  const loadLeaderboards = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const weeks = await getAllWeeklyLeaderboards();
      setWeeks(weeks);
    } catch (loaderror) {
      setError(loaderror.message || 'unable to load leaderboard data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeaderboards();
  }, [loadLeaderboards]);

  const navigate = useNavigate();
  
  return (
      <div id="week-list">
      {isLoading ? (
          <h1>Loading...</h1>
      ) : (<>
        <h2 id="weekly-title">Click to get that weeks leaderboard</h2>
        <table id="weekly-table">
          <thead>
          <tr>
              <th>Year</th>
              <th>Week</th>
              <th>Number of teams</th>
          </tr>
          </thead>
          <tbody>
            {weeks.map((row) =>(
            <tr className="weeks-link"
              key={`${row.year}-${row.week}`}
              onClick={() => navigate(`/year/${row.year}/week/${row.week}`)}>
              <td>{row.year}</td>
              <td>{row.week}</td>
              <td>{row.teams}</td>
            </tr>
            ))}
          </tbody>
        </table>
        </>
      )}
      </div>
  );
}

export default AllWeeklyLeaderboardsPage;
