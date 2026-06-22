import React, { useEffect, useState } from "react";
import ActionCard from "./ActionCard";
import { SUPPLIER_ACTIONS_API } from "../api/config";

function SupplierActions({ supplierId }) {
  const [pendingActions, setPendingActions] = useState([]);
  const [completedActions, setCompletedActions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSupplierActions = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${SUPPLIER_ACTIONS_API}/${supplierId}`);
        const data = await res.json();

        console.log("Live Supplier Actions API:", data);

        const liveActions = (data.recommended_actions || []).map(
          (item, index) => ({
            action_id: `${data.supplier_id}-ACT-${index + 1}`,
            supplier_id: data.supplier_id,
            supplier_name: data.supplier_name,
            action_description: item.action,
            reason: item.reason,
            urgency: item.urgency,
            action_within: item.action_within,
            status: "PENDING",
          })
        );

        setPendingActions(liveActions);
        setCompletedActions([]);
      } catch (error) {
        console.error("Live supplier actions fetch failed:", error);
        setPendingActions([]);
        setCompletedActions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSupplierActions();
  }, [supplierId]);

  const handleDone = (action) => {
    setPendingActions((prev) =>
      prev.filter((item) => item.action_id !== action.action_id)
    );

    setCompletedActions((prev) => [
      {
        ...action,
        status: "COMPLETED",
        marked_by: "Prem Sannith",
        completed_at: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const handleSnooze = (action) => {
    setPendingActions((prev) =>
      prev.filter((item) => item.action_id !== action.action_id)
    );
  };

  if (loading) {
    return <p>Loading live recommended actions...</p>;
  }

  return (
    <div>
      <h3>Active Recommended Actions</h3>

      {pendingActions.length === 0 ? (
        <p>No live recommended actions found for this supplier.</p>
      ) : (
        pendingActions.map((action) => (
          <ActionCard
            key={action.action_id}
            action={action}
            onDone={handleDone}
            onSnooze={handleSnooze}
          />
        ))
      )}

      <h3>Completed Actions - Last 30 Days</h3>

      {completedActions.length === 0 ? (
        <p>No completed action history.</p>
      ) : (
        completedActions.map((action) => (
          <div key={action.action_id} className="action-card">
            <h4>{action.action_description}</h4>
            <p>{action.reason}</p>
            <p>
              Completed by {action.marked_by} on{" "}
              {new Date(action.completed_at).toLocaleDateString()}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default SupplierActions;