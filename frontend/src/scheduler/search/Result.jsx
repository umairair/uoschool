import React from "react";

export default function Result({ course, isSelected, isLoading, courseData, onSelect, onAdd }) {
  // Check if the courseData has sections
  const hasData = courseData && Array.isArray(courseData.sections) && courseData.sections.length > 0;

  return (
    <div
      className={`p-3 rounded-lg transition cursor-pointer relative flex items-center justify-between 
        ${isSelected ? "bg-blue-100 border border-blue-300" : "bg-gray-100 hover:bg-gray-200"}`}
      onClick={onSelect}
    >
      {/* Course Info */}
      <div>
        <h2 className="text-md font-semibold">{course.courseCode}</h2>
        <p className="text-sm text-gray-600">{course.courseName}</p>
      </div>

      {/* Dynamic Status (Loading, Button, or Not Found) */}
      <div>
        {isSelected && isLoading ? (
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        ) : isSelected && courseData ? (
          hasData ? (
            <button 
              onClick={(e) => {
                e.stopPropagation(); // prevent triggering onSelect
                onAdd(courseData);
              }}
              className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
            >
              Add to Schedule
            </button>
          ) : (
            <span className="text-xs text-gray-500">Not Available in Winter 2025</span>
          )
        ) : null}
      </div>
    </div>
  );
}
