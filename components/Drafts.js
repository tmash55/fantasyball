import React, { useEffect, useState } from "react";
import axios from "axios";
import DraftPicks from "./DraftPicks"; // Import the DraftPicks component
import clsx from "clsx";

const Drafts = ({ leagueHistory }) => {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDraftId, setSelectedDraftId] = useState(null);
  const [selectedLeagueId, setSelectedLeagueId] = useState(null);

  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        const draftPromises = leagueHistory.map(async (league) => {
          const response = await axios.get(
            `https://api.sleeper.app/v1/league/${league.leagueId}/drafts`
          );
          return {
            leagueId: league.leagueId,
            season: league.season,
            drafts: response.data,
          };
        });

        const fetchedDrafts = await Promise.all(draftPromises);
        setDrafts(fetchedDrafts);
      } catch (err) {
        console.error("Error fetching drafts:", err);
        setError("Failed to fetch drafts");
      } finally {
        setLoading(false);
      }
    };

    if (leagueHistory.length > 0) {
      fetchDrafts();
    }
  }, [leagueHistory]);

  if (loading) return <p>Loading drafts...</p>;
  if (error) return <p>{error}</p>;

  const handleDraftClick = (draftId, leagueId) => {
    if (selectedDraftId === draftId) {
      // If the clicked draft is already selected, deselect it
      setSelectedDraftId(null);
      setSelectedLeagueId(null);
    } else {
      // Otherwise, select the clicked draft
      setSelectedDraftId(draftId);
      setSelectedLeagueId(leagueId);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap p-6">
        {drafts.map((draftGroup) => (
          <div key={draftGroup.leagueId} className="mr-4">
            <div className="flex space-x-4">
              {draftGroup.drafts.map((draft) => (
                <button
                  key={draft.draft_id}
                  onClick={() =>
                    handleDraftClick(draft.draft_id, draftGroup.leagueId)
                  }
                  className={clsx(
                    "btn",
                    selectedDraftId === draft.draft_id && "btn-neutral"
                  )}
                >
                  {draftGroup.season}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {selectedDraftId && (
        <DraftPicks draftId={selectedDraftId} leagueId={selectedLeagueId} />
      )}
    </div>
  );
};

export default Drafts;
