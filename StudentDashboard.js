import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase'; // Ensure correct import from your Firebase configuration file
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore'; // Import getDoc
import CourseCard from './CourseCard';
import Rating from 'react-rating-stars-component';

const StudentDashboard = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError('You must be logged in to view your courses.');
          setLoading(false);
          return;
        }

        const q = query(collection(db, 'courses'), where('enrolledStudents', 'array-contains', user.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const enrolledCoursesData = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            const imageUrl = data.files && data.files.length > 0 ? data.files[0].url : '';
            return {
              id: doc.id,
              ...data,
              imageUrl, // Extract the imageUrl from the files array
              enrolledStudentsCount: data.enrolledStudents ? data.enrolledStudents.length : 0, // Count the enrolled students
              ratings: data.ratings || {} // Initialize ratings
            };
          });

          setEnrolledCourses(enrolledCoursesData);
        } else {
          setEnrolledCourses([]);
        }
      } catch (error) {
        console.error('Error fetching enrolled courses:', error.message);
        setError('Failed to fetch enrolled courses.');
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, []);

  const handleRatingChange = async (courseId, newRating) => {
    try {
      const user = auth.currentUser;

      if (!user) {
        setError('You must be logged in to rate a course.');
        return;
      }

      const courseRef = doc(db, 'courses', courseId);
      const courseSnapshot = await getDoc(courseRef);
      const courseData = courseSnapshot.data();

      const updatedRatings = {
        ...courseData.ratings,
        [user.uid]: newRating
      };

      await updateDoc(courseRef, {
        ratings: updatedRatings
      });

      setEnrolledCourses((prevCourses) =>
        prevCourses.map((course) =>
          course.id === courseId ? { ...course, ratings: updatedRatings } : course
        )
      );
      
      alert('Rating submitted successfully!');
    } catch (error) {
      console.error('Error submitting rating:', error.message);
      setError('Failed to submit rating.');
    }
  };

  const calculateAverageRating = (ratings) => {
    if (!ratings) return 0;
    const totalRating = Object.values(ratings).reduce((acc, curr) => acc + curr, 0);
    return (totalRating / Object.keys(ratings).length).toFixed(1);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container">
      <h2>My Courses</h2>
      <div className="row">
        {enrolledCourses.length === 0 ? (
          <p>No enrolled courses.</p>
        ) : (
          enrolledCourses.map((course) => (
            <div className="col-md-4 mb-4" key={course.id}>
              <CourseCard 
                course={course} 
                imageUrl={course.imageUrl} 
                enrolledStudentsCount={course.enrolledStudentsCount} 
              />
              <div>
                <h5>Rate this course</h5>
                <Rating
                  count={5}
                  value={course.ratings[auth.currentUser.uid] || 0}
                  onChange={(newRating) => handleRatingChange(course.id, newRating)}
                  size={24}
                  activeColor="#ffd700"
                />
                <p>Average Rating: {calculateAverageRating(course.ratings)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
