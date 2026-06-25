import React, { useEffect, useState } from "react";
import ActionCard from "./ActionCard";
import { SUPPLIER_ACTIONS_API } from "../api/config";
import { mockActions } from "../mocks/mockActions";


const urgencyOrder = {
  URGENT: 1,
  HIGH: 2,
  MEDIUM: 3,
  LOW: 4,
};

function ActionList() {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActions = async () => {
  try {
    const res = await fetch(SUPPLIER_ACTIONS_API);
    const data = await res.json();

    const sourceData =
      Array.isArray(data) && data.length > 0 ? data : mockActions;

    const sorted = sourceData
      .filter((item) => item.status === "PENDING")
      .sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

    setActions(sorted);
  } catch (error) {
    console.error("Failed to fetch supplier actions. Using mock data:", error);

    const sortedMock = mockActions
      .filter((item) => item.status === "PENDING")
      .sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

    setActions(sortedMock);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchActions();
  }, []);

  const handleDone = async (action) => {
    try {
      await fetch(`${SUPPLIER_ACTIONS_API}/${action.action_id}/complete`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "COMPLETED",
          marked_by: "Prem Sannith",
          completed_at: new Date().toISOString(),
        }),
      });

      setActions((prev) =>
        prev.filter((item) => item.action_id !== action.action_id)
      );
    } catch (error) {
      console.error("Failed to mark action done:", error);
    }
  };

  const handleSnooze = async (action) => {
    try {
      await fetch(`${SUPPLIER_ACTIONS_API}/${action.action_id}/snooze`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          snoozed_until: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
        }),
      });

      setActions((prev) =>
        prev.filter((item) => item.action_id !== action.action_id)
      );
    } catch (error) {
      console.error("Failed to snooze action:", error);
    }
  };

  if (loading) return <p>Loading recommended actions...</p>;

  return (
    <div className="page">
      <h2>Recommended Supplier Actions</h2>
      <p>Pending supplier actions sorted by urgency.</p>

      {actions.length === 0 ? (
        <p>No pending supplier actions.</p>
      ) : (
        actions.map((action) => (
          <ActionCard
            key={action.action_id}
            action={action}
            onDone={handleDone}
            onSnooze={handleSnooze}
          />
        ))
      )}
    </div>
  );
}

export default ActionList;