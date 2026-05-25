import { useEffect, useState } from 'react';
import { createOrUpdateTeam, getWeeklyLeaderboard } from '../lib/api';
import { useAuthUser } from '../hooks/useAuthUser';

function TeamsPage() {
  const [loading, setLoading] = useState(false);
  const [week, setWeek] = useState(getCurrentWeek());
  const [year, setYear] = useState(new Date().getFullYear());
  const [teamName, setTeamName] = useState('');
  const [teamPoints, setTeamPoints] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [teams, setTeams] = useState([]);
  const [addedDate, setAddedDate] = useState({"week": 0, "year": 0})
  const [yearRange, setYearRange] = useState(getYearRange())

  const user = useAuthUser();

  function getYearRange() {
      const currYear = new Date().getFullYear();
      return [
          currYear - 2,
          currYear - 1,
          currYear,
          currYear + 1
      ]
  }


  // Get current ISO week number
  function getCurrentWeek() {
    const date = new Date();
    const utcDate = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const day = utcDate.getUTCDay() || 7;
    utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
    return Math.ceil(((utcDate - yearStart) / 86400000 + 1) / 7);
  }

  // Get week range for display
  function getWeekRange(week, year) {
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    if (dow <= 4)
      ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());

    const weekEnd = new Date(ISOweekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const options = { month: 'short', day: 'numeric' };
    return `${ISOweekStart.toLocaleDateString('en-US', options)} - ${weekEnd.toLocaleDateString('en-US', options)}`;
  }

  const handleAddTeam = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    // Validation
    if (!teamName.trim()) {
      setError('Team name is required');
      setLoading(false);
      return;
    }

    if (!teamPoints || isNaN(teamPoints) || teamPoints < 0) {
      setError('Points must be a valid number');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        week: parseInt(week),
        year: parseInt(year),
        name: teamName.trim(),
        points: parseInt(teamPoints),
      };

      const result = await createOrUpdateTeam(payload);
      setSuccessMessage(`Team "${teamName}" added successfully!`);
      setTeams(result.current)

      setAddedDate({
          year: parseInt(year),
          week: parseInt(week),
      })
      
      // Reset form
      setTeamName('');
      setTeamPoints('');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to create team entry');
      console.error('Error creating team:', err);
    } finally {
      setLoading(false);
    }
  };

  // If not authenticated, show message
  if (!user) {
    return (
      <div className="teams-page">
        <h1>Teams Management</h1>
        <p>Please log in as admin to manage teams.</p>
      </div>
    );
  }

  return (
    <div className="teams-page">
      <div className="teams-container">
        <div className="add-team-form">
          <h2>Add Team Entry</h2>
          
          <div className="date-selectors">
            <div className="date-group">
              <label htmlFor="year"></label>
              <select
                id="year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                disabled={loading}
              >
                {yearRange.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div className="date-group">
              <label htmlFor="week"></label>
              <select
                id="week"
                value={week}
                onChange={(e) => setWeek(e.target.value)}
                disabled={loading}
              >
                {Array.from({ length: 52 }, (_, i) => i + 1).map((w) => (
                  <option key={w} value={w}>
                    Week {w} ({getWeekRange(w, year)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <form className="add-team-form-2" onSubmit={handleAddTeam}>
            <div className="form-group">
              <label htmlFor="teamName">Team Name:</label>
              <input
                id="teamName"
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                disabled={loading}
                placeholder="Enter team name"
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label htmlFor="teamPoints">Points:</label>
              <input
                id="teamPoints"
                type="number"
                value={teamPoints}
                onChange={(e) => setTeamPoints(e.target.value)}
                disabled={loading}
                placeholder="Enter points"
                min="0"
                step="1"
              />
            </div>

            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Adding Team...' : 'Add Team'}
            </button>
          </form>
        </div>

        <div className="teams-list">
          {teams.length === 0 ? (
            <h3 className="is-leaderboard">Adding a user will show the leaderboard</h3>
          ) : (
            <>
            <h2 className="is-leaderboard">Teams for Week {addedDate.week}, {addedDate.year}</h2>
            <table className="teams-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Team Name</th>
                  <th>Points</th>
                  <th>Championship Score</th>
                </tr>
              </thead>
              <tbody>
                {teams?.map((row) => (
                    <tr key={row.team_id}>
                      <td>{row.rank}</td>
                      <td>{row.name}</td>
                      <td>{row.points}</td>
                      <td>{row.year_points}</td>
                    </tr>
                ))}
              </tbody>
            </table>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default TeamsPage;
