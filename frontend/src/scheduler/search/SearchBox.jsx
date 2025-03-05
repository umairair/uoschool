import { useState, useEffect } from "react";
import axios from "axios";
import Result from "./Result";

export default function SearchBox({ onAddCourse }) {
  const [searchByName, setSearchByName] = useState(false);
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [courseData, setCourseData] = useState(null);

  useEffect(() => {
    setQuery("");
    setResults([]);
  }, [searchByName]);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(query), 150);
    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }
    const searchCourses = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/search-course/", {
          params: { query: debouncedQuery, searchByName },
        });
        setResults(response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    searchCourses();
  }, [debouncedQuery, searchByName]);

  const handleSelectCourse = async (course) => {
    if (selectedCourse && selectedCourse.courseCode === course.courseCode) {
      setSelectedCourse(null);
      setCourseData(null);
      return;
    }
    setSelectedCourse(course);
    setIsLoading(true);
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/scrape-course/", {
        params: { courseCode: course.courseCode },
      });
      setCourseData(response.data);
    } catch (error) {
      console.error("Error fetching course data:", error);
      setCourseData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = (data) => onAddCourse(data);

  const handleClearInput = () => {
    setQuery("");
    setResults([]);
  };

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-y-auto">
      <div className="p-4">
        <div className="flex w-full">
          <button
            className={`flex-1 text-center cursor-pointer py-2 font-semibold text-sm transition 
              ${!searchByName ? "text-blue-600 border-2 border-blue-500 rounded-lg" : "text-gray-500"}`}
            onClick={() => setSearchByName(false)}
          >
            Course Code
          </button>
          <button
            className={`flex-1 text-center cursor-pointer py-2 font-semibold text-sm transition 
              ${searchByName ? "text-blue-600 border-2 border-blue-500 rounded-lg" : "text-gray-500"}`}
            onClick={() => setSearchByName(true)}
          >
            Course Name
          </button>
        </div>
      </div>
      <div className="px-4">
        <div className="relative mt-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchByName ? "Search by course name..." : "Search by course code..."}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none text-sm"
          />
          {query && (
            <button
              onClick={handleClearInput}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none p-2"
              style={{ fontSize: '1.25rem' }} // Increase font size for better visibility
            >
              &times;
            </button>
          )}
        </div>
      </div>
      <div className="mt-3 px-4 space-y-2 overflow-y-auto">
        {results.length > 0 ? (
          results.map((course) => (
            <Result
              key={course.id || course.courseCode}
              course={course}
              isSelected={selectedCourse && selectedCourse.courseCode === course.courseCode}
              isLoading={isLoading && selectedCourse && selectedCourse.courseCode === course.courseCode}
              courseData={selectedCourse?.courseCode === course.courseCode ? courseData : null}
              onSelect={() => handleSelectCourse(course)}
              onAdd={handleAdd}
            />
          ))
        ) : (
          query && <p className="text-gray-500 text-sm text-center">No results found.</p>
        )}
      </div>
    </div>
  );
}