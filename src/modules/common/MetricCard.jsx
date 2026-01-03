import React from 'react';

const MetricCard = ({ title, value, icon, color }) => (
  <div className="col-md-4">
    <div className="card shadow-sm border-0 h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between mb-3">
          <div className={`text-${color} bg-${color} bg-opacity-10 p-2 rounded`}>{icon}</div>
        </div>
        <h6 className="text-muted fw-normal">{title}</h6>
        {Array.isArray(value) ? (
          <ul className="list-unstyled mb-0 small">
            {value.map((item, i) => (
              <li key={i} className="text-danger fw-bold">• {item}</li>
            ))}
            {value.length === 0 && <span>Todo en orden</span>}
          </ul>
        ) : (
          <h3 className="fw-bold mb-0">{value}</h3>
        )}
      </div>
    </div>
  </div>
);

export default MetricCard;
