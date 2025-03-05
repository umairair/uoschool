import React, { useState, useEffect, useRef } from "react";

export default function Schedule() {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const totalRows = 80;
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const startMinutes = 8 * 60 + 30;

  useEffect(() => {
    function updateDimensions() {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    }
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const { width, height } = dimensions;
  if (!width || !height) {
    return <div ref={containerRef} className="w-full h-full" />;
  }

  const headerHeight = height * 0.07;
  const rowHeight = (height - headerHeight) / totalRows;

  return (
    <div ref={containerRef} className="w-full no-select h-full p-4 bg-white text-gray-800 font-sans">
      <div className="w-full h-full rounded-lg border border-gray-300 overflow-hidden">
        <div
          className="grid w-full h-full"
          style={{
            gridTemplateRows: `${headerHeight}px repeat(${totalRows}, ${rowHeight}px)`,
            gridTemplateColumns: "repeat(7, 1fr)",
          }}
        >
          {days.map((day, index) => (
            <div
              key={day}
              className="font-bold text-center border-b border-gray-300 border-r border-gray-200 last:border-r-0 py-2"
              style={{ gridColumn: index + 1, gridRow: 1 }}
            >
              {day}
            </div>
          ))}

          {Array.from({ length: totalRows }).map((_, rowIndex) => (
            days.map((_, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="border-r border-gray-200 last:border-r-0"
                style={{
                  gridColumn: colIndex + 1,
                  gridRow: rowIndex + 2,
                }}
              />
            ))
          ))}
        </div>
      </div>
    </div>
  );
}