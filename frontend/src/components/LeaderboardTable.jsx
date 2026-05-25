import { useEffect, useState } from 'react';
import { useAuthUser } from '../hooks/useAuthUser';
import { deleteTeam, deleteTeamEntry } from '../lib/api';

function LeaderboardTable({ title, rows, pointsField, scoreField, }) {
  const user = useAuthUser();

    //{ user && (<td><button type="submit" onClick={() => deleteTeamEntry(row.name, row.week, row.year)} className="delete-team-btn"> delete entry </button></td>)}
    //{ user && (<td><button type="submit" onClick={() => deleteTeam(row.name)} className="delete-team-btn"> delete team </button></td>)}

  return (
    <section className="card">
      <h2 id="leaderboard-title">{title}</h2>
      {rows.length === 0 ? (
        <p className="muted">No rows found.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Team</th>
                { scoreField ? (
                    <>
                    <th>Quiz Score</th>
                    <th>Championship Points</th>
                    </>) : (<>
                    <th>Championship Score</th>
                </>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.team_id}-${row.rank}`}>
                  <td>{row.rank}</td>
                  <td>{row.name}</td>
                  <td>{row[pointsField]}</td>
                  { scoreField && (<>
                      <th>{row[scoreField]}</th>
                  </>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default LeaderboardTable;
