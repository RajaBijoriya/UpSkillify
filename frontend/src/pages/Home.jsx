// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';

function Home() {
  const [courses, setCourses] = useState([]);
 const [filters, setFilters] = useState({ search: '', category: '', min: 0, max: 500 });  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCourses = async () => {
    try {
      const queryParams = new URLSearchParams({
        ...filters,
        page,
        limit: 10,
      }).toString();

      const res = await api.get(`/courses?${queryParams}`);
      setCourses(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [filters, page]);
  

  return (
    <div>
      <h2>All Courses</h2>
      <input
        type="text"
        placeholder="Search courses..."
        value={filters.search}
        onChange={e => setFilters({ ...filters, search: e.target.value })}
      />
      <input 
        placeholder="Search..." 
        value={filters.search} 
        onChange={e => setFilters({ ...filters, search: e.target.value })} 
      />
      <input 
        placeholder="Category" 
        value={filters.category}
        onChange={e => setFilters({ ...filters, category: e.target.value })}
      />
      <input 
        type="number" placeholder="Min Price"
        value={filters.min}
        onChange={e => setFilters({ ...filters, min: e.target.value })}
      />
      <input
        type="number" placeholder="Max Price"
        value={filters.max}
        onChange={e => setFilters({ ...filters, max: e.target.value })}
      />
      <button onClick={fetchCourses}>Apply</button>
      <ul>
        {courses.map(course => (
          <li key={course._id}>
            <Link to={`/course/${course._id}`}>
              {course.title} - ${course.price} - {course.category}
            </Link>
          </li>
        ))}
      </ul>

      <div>
        <button disabled={page<=1} onClick={() => setPage(page - 1)}>Prev</button>
        <span> Page {page} of {totalPages} </span>
        <button disabled={page>=totalPages} onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  );
}

export default Home;
