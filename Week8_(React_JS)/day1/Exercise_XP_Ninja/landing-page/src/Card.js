import React from 'react';

function Card({ icon, title, description }) {
  return (
    <div className="col-md-4 mb-4 mb-md-0">
      <div className="custom-card">
        <i className={icon}></i>
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default Card;
