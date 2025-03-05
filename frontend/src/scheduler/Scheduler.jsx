import { useState } from "react";
import SearchBox from "./search/SearchBox";
import Schedule from "./Schedule";
import Popup from "./Popup"; 
import { IoMdClose, IoMdMenu } from "react-icons/io";

export default function Scheduler() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourseData, setSelectedCourseData] = useState(null);

  const handleAddCourse = (courseData) => {
    console.log("Course added to schedule:", courseData);
    setSelectedCourseData(courseData);
    setIsModalOpen(true);
  };

  const toggleSearchBox = () => {
    setIsCollapsed((prev) => !prev);
    setTimeout(() => {
      document.getElementById("search-input")?.blur();
    }, 50);
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col md:flex-row relative">
      <div 
        className="absolute top-6 left-6 md:top-1/2 md:left-2 md:transform md:-translate-y-1/2 bg-white text-gray-700 p-2 rounded-full shadow-md z-10 cursor-pointer flex items-center justify-center hover:bg-gray-100 transition border border-gray-300"
        onClick={toggleSearchBox}
      >
        {isCollapsed ? <IoMdMenu size={22} /> : <IoMdClose size={22} />}
      </div>

      <div
        className={`no-select transition-all duration-300 ease-out bg-white shadow-lg overflow-hidden 
          ${isCollapsed ? "w-0 opacity-0" : "w-full md:w-[350px] opacity-100"} flex flex-col h-full`}
      >
        {!isCollapsed && <SearchBox onAddCourse={handleAddCourse} />}
      </div>

      <div className="flex-1 p-4 h-full">
        <Schedule />
      </div>

      <Popup 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        courseData={selectedCourseData} 
      />
    </div>
  );
}