import { useState } from "react";
import axios from "axios";
import "./App.css";
import SearchBox from "./scheduler/search/SearchBox";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Scheduler from "./scheduler/Scheduler";



function App() {
  const [courseCode, setCourseCode] = useState("");


  const fetchCourseData = async () => {
    if (!courseCode.trim()) return; 

    try {
      const response = await axios.get("http://127.0.0.1:8000/api/scrape-course/", {
        params: { courseCode },
      });
      console.log("Course Data:", response.data);
    } catch (error) {
      console.error("Error fetching course data:", error);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {





      fetchCourseData();
    }
  };

    return (
      <Router>
          <Routes>
              <Route path="/" element={<h1>Home Page</h1>} />
              <Route path="/scheduler" element={<Scheduler />} />
          </Routes>
      </Router>
  );
}

export default App;
