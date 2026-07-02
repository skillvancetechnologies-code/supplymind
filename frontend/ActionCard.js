import React from "react";
import "./ActionCard.css";

const urgencyClass = {
  URGENT: "urgent",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
};

function ActionCard({ action, onDone, onSnooze }) {
  return (
    <div className="action-card">
      <div className="action-card-header">
        <span className={`urgency-badge ${urgencyClass[action.urgency] || "low"}`}>
          {action.urgency}
        </span>
        <span className="supplier-id">{action.supplier_id}</span>
      </div>

     <h3>{action.action || action.action_description}</h3>

      <p className="reason">
        <strong>Reason:</strong> {action.reason}
      </p>

      <p className="supplier">
        <strong>Supplier:</strong> {action.supplier_name} ({action.supplier_id})
      </p>

      <div className="action-buttons">
        <button onClick={() => onDone(action)} className="done-btn">
          Mark as Done
        </button>

        <button onClick={() => onSnooze(action)} className="snooze-btn">
          Snooze for 1 week
        </button>
      </div>
    </div>
  );
}

export default ActionCard;