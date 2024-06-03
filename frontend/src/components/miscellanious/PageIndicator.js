import React from "react";
import "../styles.css";

function PageIndicator({ totalPages, currentPage, handleDotClick, setStep }) {
  const dots = [];

  for (let i = 0; i < totalPages; i++) {
    dots.push(
      <span
        key={i}
        className={i === currentPage ? "dot active" : "dot"}
        onClick={() => {
          if (!setStep) {
            handleDotClick(i);
          }
        }}
      ></span>
    );
  }

  return <div className="page-indicator">{dots}</div>;
}

export default PageIndicator;
