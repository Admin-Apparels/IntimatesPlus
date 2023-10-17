import React from "react";

function PageIndicator({ totalPages, currentPage }) {
  const dots = [];

  for (let i = 0; i < totalPages; i++) {
    dots.push(
      <span key={i} className={i === currentPage ? "dot active" : "dot"}></span>
    );
  }

  return <div className="page-indicator">{dots}</div>;
}

export default PageIndicator;
