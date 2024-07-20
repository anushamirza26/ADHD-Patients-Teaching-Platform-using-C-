import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'; // Import Link from react-router-dom
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './Login';
import Register from './Register';
import CreateCourse from './CreateCourse';
import ManageCourses from './ManageCourses';
import HomePage1 from './HomePage1';
import Homepage from './HomPage'; // Corrected import to match route
import { auth, db } from './firebase'; // Assuming you have auth and db imported
import { collection, query, where, getDocs } from 'firebase/firestore'; // Import Firestore functions

import EnrollPage from './EnrollPage';
import StudentDashboard from './StudentDashboard';

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null); // Added state for user type

  // Check authentication state on app load
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setAuthenticated(true);
        // Determine user type from Firestore or other method
        const q = query(collection(db, 'users'), where('email', '==', user.email));
        getDocs(q).then((querySnapshot) => {
          if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
              const userData = doc.data();
              setUserType(userData.userType);
            });
          }
        }).catch((error) => {
          console.error('Error getting user document:', error);
        });
      } else {
        setAuthenticated(false);
        setUserType(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const navigateToEnroll = (courseId) => {
    const baseUrl = window.location.origin;
    const enrollUrl = `${baseUrl}/enroll/${courseId}`;
    window.location.href = enrollUrl;
    console.log(`Navigate to enroll page for course ID: ${courseId}`);
  };

  return (
    <Router>
      <div>
        {/* Conditional navbar based on user type */}
        {authenticated && (
          <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container-fluid">
              {/* Logo */}
              <Link to="/" className="navbar-brand">
                <img src="/logo.png" alt="Logo" width="30" height="30" className="d-inline-block align-top" />
                {' '}Harper Russo
              </Link>
              <div className="collapse navbar-collapse">
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                  {userType === 'instructor' ? (
                    <>
                      <li className="nav-item">
                        <Link to="/create-course" className="nav-link">Create Course</Link>
                      </li>
                      <li className="nav-item">
                        <Link to="/manage-courses" className="nav-link">Manage Courses</Link>
                      </li>
                      <li className="nav-item">
                        <Link to="/homepage" className="nav-link">Home</Link>
                      </li>
                    </>
                  ) : userType === 'student' ? (
                    <>
                      <li className="nav-item">
                        <Link to="/homepage1" className="nav-link">Home</Link>
                      </li>
                      <li className="nav-item">
                        <Link to="/student-dashboard" className="nav-link">StudentDashboard</Link>
                      </li>
                    </>
                  ) : null}
                </ul>
                
                <button className="btn btn-outline-danger" onClick={() => auth.signOut()}>Logout</button>
              </div>
            </div>
          </nav>
        )}

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/create-course" element={<CreateCourse />} />
          <Route path="/manage-courses" element={<ManageCourses />} />
          <Route path="/homepage" element={<Homepage />} />
          <Route path="/homepage1" element={<HomePage1 navigateToEnroll={navigateToEnroll} />} />
          <Route path="/enroll/:courseId" element={<EnrollPage />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
         
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
