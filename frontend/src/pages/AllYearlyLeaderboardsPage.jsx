import { useCallback, useEffect, useState } from 'react';
import { getAllYearlyLeaderboards } from '../lib/api';
import { NavLink } from "react-router-dom";

function AllYearlyLeaderboardsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [years, setYears] = useState([]);
    
  const loadLeaderboards = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const years = await getAllYearlyLeaderboards();
      setYears(years);
    } catch (loaderror) {
      setError(loaderror.message || 'unable to load leaderboard data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeaderboards();
  }, [loadLeaderboards]);
  
  return (
      <div id="year-list">
      {isLoading ? (
          <h1>Loading...</h1>
      ) : (<>
          <h2 id="weekly-title">Click for a years leaderboard</h2>
          <table id="years-table">
          {years.map((row) =>(
              <tr>
              <td>
                <NavLink className="years-link" to={`/year/${row.year}`}>
                  {row.year}
                </NavLink>
              </td>
              </tr>
          ))}
          </table>
      </>)}
      </div>
  );
}

export default AllYearlyLeaderboardsPage;
