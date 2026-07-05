import React, { useEffect, useState } from "react";
import ActionCard from "./ActionCard";
import { SUPPLIER_ACTIONS_API } from "../api/config";
import { mockActions } from "../mocks/mockActions";
import "./ActionCard.css";

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

      const sourceData = Array.isArray(data) && data.length > 0 ? data : [];

      const flattenedActions = sourceData.flatMap((supplier) =>
        supplier.recommended_actions.map((action, index) => ({
          action_id: `${supplier.supplier_id}-${index}`,
          supplier_id: supplier.supplier_id,
          supplier_name: supplier.supplier_name,
          category: supplier.category,
          urgency: action.urgency,
          action: action.action,
          reason: action.reason,
          act_within: action.act_within,
        }))
      );

      const sorted = flattenedActions.sort(
        (a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
      );

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
        headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
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

  return (
    <div className="actions-page">
      <h1>Recommended Supplier Actions</h1>
      <p className="actions-subtitle">
        Pending supplier actions sorted by urgency.
      </p>

      {loading ? (
        <div className="actions-loading">Loading recommended actions...</div>
      ) : actions.length === 0 ? (
        <div className="actions-empty">No pending supplier actions.</div>
      ) : (
        <div className="actions-list">
          {actions.map((action) => (
            <ActionCard
              key={action.action_id}
              action={action}
              onDone={handleDone}
              onSnooze={handleSnooze}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ActionList;