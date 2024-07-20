import React, { useEffect, useState } from 'react';
import { auth, db, rtdb } from './firebase';
import { collection, getDocs, deleteDoc, doc, query, where, getDoc, updateDoc } from 'firebase/firestore';

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [ratings, setRatings] = useState({});
  const [enrolledStudentsCounts, setEnrolledStudentsCounts] = useState({}); // State to store enrolled students count
  const [courseToUpdate, setCourseToUpdate] = useState(null); // State to manage the course being updated
  const [newTitle, setNewTitle] = useState(''); // State to store new title for update

  const user = auth.currentUser; // Get the current authenticated user

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Fetch courses from Firestore
        const q = query(collection(db, 'courses'), where('instructorEmail', '==', user.email));
        const querySnapshot = await getDocs(q);
        const coursesData = [];

        for (const doc of querySnapshot.docs) {
          const course = {
            id: doc.id,
            ...doc.data(),
          };

          // Fetch enrolled students count for each course
          const enrolledStudentsCount = await getEnrolledStudentsCount(course.id);
          course.enrolledStudentsCount = enrolledStudentsCount;

          coursesData.push(course);
        }

        setCourses(coursesData);

        // Realtime Database listener for ratings
        const ratingsRef = rtdb.ref('ratings');
        ratingsRef.on('value', (snapshot) => {
          setRatings(snapshot.val() || {});
        });

        return () => {
          ratingsRef.off(); // Clean up listener
        };
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    const getEnrolledStudentsCount = async (courseId) => {
      try {
        const docRef = doc(db, 'courses', courseId);
        const docSnapshot = await getDoc(docRef);

        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          return data.enrolledStudents ? data.enrolledStudents.length : 0;
        }

        return 0;
      } catch (error) {
        console.error("Error fetching enrolled students count:", error);
        return 0;
      }
    };

    if (user) {
      fetchCourses();
    }
  }, [user]);

  const handleDelete = async (courseId) => {
    try {
      await deleteDoc(doc(db, 'courses', courseId));
      setCourses(courses.filter((course) => course.id !== courseId));
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };

  const handleUpdate = async (courseId) => {
    try {
      const courseRef = doc(db, 'courses', courseId);
      await updateDoc(courseRef, { title: newTitle });

      // Update courses state to reflect changes
      setCourses(courses.map(course => {
        if (course.id === courseId) {
          return { ...course, title: newTitle };
        }
        return course;
      }));

      setCourseToUpdate(null); // Reset courseToUpdate state after update
      setNewTitle(''); // Reset newTitle state
    } catch (error) {
      console.error("Error updating course:", error);
    }
  };

  const getRating = (courseId) => {
    return ratings[courseId] || 0;
  };

  const handleUpdateClick = (courseId) => {
    // Set courseToUpdate state to the selected course id
    setCourseToUpdate(courseId);

    // Optionally, set initial newTitle state to current course title
    const courseToUpdate = courses.find(course => course.id === courseId);
    if (courseToUpdate) {
      setNewTitle(courseToUpdate.title);
    }
  };

  const handleTitleChange = (e) => {
    setNewTitle(e.target.value); // Update the new title in state
  };

  return (
    <div className="container">
      <h2>Manage Courses</h2>
      {courses.length === 0 ? (
        <p>No courses available.</p>
      ) : (
        <ul className="list-group">
          {courses.map((course) => (
            <li key={course.id} className="list-group-item">
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <p>Price: ${course.price}</p>
              <p>Instructor: {course.instructorName}</p>
              <p>Enrolled Students: {course.enrolledStudentsCount}</p>
              <p>Rating: {getRating(course.id)}</p>
              <button
                onClick={() => handleDelete(course.id)}
                className="btn btn-danger"
              >
                Delete
              </button>
              <button
                onClick={() => handleUpdateClick(course.id)}
                className="btn btn-primary mx-2"
              >
                Update
              </button>
              {/* Conditional rendering of update form */}
              {courseToUpdate === course.id && (
                <div>
                  <input
                    type="text"
                    placeholder="New title"
                    value={newTitle}
                    onChange={handleTitleChange}
                  />
                  {/* Add fields for other properties to update */}
                  <button
                    onClick={() => handleUpdate(course.id)}
                    className="btn btn-success mx-2"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setCourseToUpdate(null)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ManageCourses;
