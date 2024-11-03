import React, { useRef } from "react";
import { OrderForm } from "./Order";

const ZoomedDateList = () => {
  const containerRef = useRef(null);

  const dates = [
    "http://res.cloudinary.com/dvc7i8g1a/image/upload/v1706014611/hrelhdnn52dkcl77cotk.jpg",
    "http://res.cloudinary.com/dvc7i8g1a/image/upload/v1706014611/hrelhdnn52dkcl77cotk.jpg",
    "http://res.cloudinary.com/dvc7i8g1a/image/upload/v1706014611/hrelhdnn52dkcl77cotk.jpg",
    "http://res.cloudinary.com/dvc7i8g1a/image/upload/v1706014611/hrelhdnn52dkcl77cotk.jpg",
    "http://res.cloudinary.com/dvc7i8g1a/image/upload/v1706014611/hrelhdnn52dkcl77cotk.jpg",
    "http://res.cloudinary.com/dvc7i8g1a/image/upload/v1706014611/hrelhdnn52dkcl77cotk.jpg",
    "http://res.cloudinary.com/dvc7i8g1a/image/upload/v1706014611/hrelhdnn52dkcl77cotk.jpg",
    "http://res.cloudinary.com/dvc7i8g1a/image/upload/v1706014611/hrelhdnn52dkcl77cotk.jpg",
  ];

  return (
    <div className="flex flex-col items-center bg-whitesmoke w-full h-[50%] rounded-lg overflow-hidden">
      {/* Horizontal Scroll List */}
      <div
        ref={containerRef}
        className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide w-full bg-whitesmoke"
        style={{ WebkitOverflowScrolling: "touch" }} // Enables smooth scrolling on iOS
      >
        {dates.map((date, index) => (
          <OrderForm key={index}>
            <div className="flex-shrink-0 w-[120px] h-[120px] bg-whitesmoke p-4 flex items-center justify-center transition-transform">
              <img
                src={date}
                alt={`Date ${index}`}
                className="w-full h-full object-cover rounded-lg shadow-md"
              />
            </div>
          </OrderForm>
        ))}
      </div>
    </div>
  );
};

export default ZoomedDateList;
