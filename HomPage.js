import React, { useState, useEffect } from 'react';
import { db } from './firebase'; // Assume firebase is configured
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import CourseCard from './CourseCard';

const HomePage1 = ({ navigateToEnroll, currentUserId }) => {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [popularCategories, setPopularCategories] = useState(['Programming', 'Design', 'Business']);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const [trendingCourses, setTrendingCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [allCourses, setAllCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [showFilteredCourses, setShowFilteredCourses] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'courses'));
        const coursesData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          const imageUrl = data.files && data.files.length > 0 ? data.files[0].url : '';
          const enrolledStudentsCount = data.enrolledStudents ? data.enrolledStudents.length : 0;
          
          // Calculate average rating if ratings exist
          let averageRating = 0;
          if (data.ratings) {
            const ratingsArray = Object.values(data.ratings);
            if (ratingsArray.length > 0) {
              const totalRating = ratingsArray.reduce((acc, curr) => acc + curr, 0);
              averageRating = totalRating / ratingsArray.length;
            }
          }
          
          return {
            id: doc.id,
            ...data,
            imageUrl,
            enrolledStudentsCount,
            averageRating
          };
        });

        setFeaturedCourses(coursesData.slice(0, 3)); // Displaying 3 featured courses

        const trendingCoursesData = await calculateTrendingCourses(coursesData);
        setTrendingCourses(trendingCoursesData);

        setAllCourses(coursesData);
      } catch (error) {
        console.error('Error fetching courses:', error.message);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    // Simulated enrolled courses (replace with actual logic to fetch enrolled courses)
    const fetchEnrolledCourses = async () => {
      // Example: Fetch enrolled courses from a user's profile or database
      // Simulated delay for demonstration purposes
      setTimeout(() => {
        const enrolled = ['course_id_1']; // Replace with actual enrolled courses
        setEnrolledCourses(enrolled);
      }, 1000); // Simulated delay of 1 second
    };

    fetchEnrolledCourses();
  }, []);

  const calculateTrendingCourses = async (coursesData) => {
    const trendingCourses = [];

    for (const course of coursesData) {
      try {
        const courseRef = doc(db, 'courses', course.id);
        const courseDoc = await getDoc(courseRef);

        if (courseDoc.exists()) {
          const ratingsData = courseDoc.data().ratings;
          const ratingsArray = Object.values(ratingsData);

          if (ratingsArray.length > 0) {
            const totalRating = ratingsArray.reduce((acc, curr) => acc + curr, 0);
            const averageRating = totalRating / ratingsArray.length;

            trendingCourses.push({ ...course, averageRating });
          } else {
            console.error(`No ratings found for course ${course.id}`);
          }
        } else {
          console.error(`Course document ${course.id} does not exist`);
        }
      } catch (error) {
        console.error(`Error fetching course ${course.id}:`, error.message);
      }
    }

    trendingCourses.sort((a, b) => b.averageRating - a.averageRating);

    return trendingCourses.slice(0, 3); // Displaying top 3 trending courses
  };

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    if (query.trim() === '') {
      setFeaturedCourses([]);
      return;
    }

    const filtered = featuredCourses.filter(course =>
      (course.title && course.title.toLowerCase().includes(query)) ||
      (course.instructor && course.instructor.toLowerCase().includes(query))
    );

    setFeaturedCourses(filtered);
  };

  const handleCategorySelect = (category) => {
    if (category) {
      const filtered = featuredCourses.filter(course => course.category === category);
      setFilteredCourses(filtered);
      setShowFilteredCourses(true);
      setSelectedCategory(category);
    } else {
      setFilteredCourses(featuredCourses);
      setShowFilteredCourses(false);
      setSelectedCategory(null);
    }
  };

  const handleResetCategoryFilter = () => {
    setFilteredCourses(featuredCourses);
    setShowFilteredCourses(false);
    setSelectedCategory(null);
  };

  const handleEnrollClick = (courseId) => {
    if (enrolledCourses.includes(courseId)) {
      alert('You are already enrolled in this course.');
      return;
    }

    navigateToEnroll(courseId);
  };

  return (
    <div>
      {/* Main Content */}
      <div className="container mt-4">
        <div className="row">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control mb-3"
              placeholder="Search by course or instructor name..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
        </div>

        <h2>Featured Courses</h2>
        <div className="row">
          {(showFilteredCourses ? filteredCourses : featuredCourses).map((course) => (
            <div className="col-md-4 mb-4" key={course.id}>
              <CourseCard course={course} imageUrl={course.imageUrl} enrolledStudentsCount={course.enrolledStudentsCount} />
              {course.averageRating > 0 && (
                <p>Average Rating: {course.averageRating.toFixed(1)}</p>
              )}
              <button
                className="btn btn-primary mt-2"
                onClick={() => handleEnrollClick(course.id)}
                disabled={enrolledCourses.includes(course.id)}
              >
                {enrolledCourses.includes(course.id) ? 'Enrolled' : 'Enroll Now'}
              </button>
            </div>
          ))}
        </div>

        <h2>Popular Categories</h2>
        <div className="row">
          {popularCategories.map((category, index) => (
            <div className="col-md-4 mb-4" key={index}>
              <div className={`card ${selectedCategory === category ? 'border-primary' : ''}`}>
                <div className="card-body">
                  <h5 className="card-title">{category}</h5>
                  <p className="card-text">Explore courses in {category}</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleCategorySelect(category)}
                  >
                    View Courses
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {trendingCourses.length > 0 && (
          <div>
            <h2>Trending Courses</h2>
            <div className="row">
              {trendingCourses.map((course) => (
                <div className="col-md-4 mb-4" key={course.id}>
                  <CourseCard course={course} imageUrl={course.imageUrl} enrolledStudentsCount={course.enrolledStudentsCount} />
                  <p>Average Rating: {course.averageRating.toFixed(1)}</p>
                  
                </div>
              ))}
            </div>
          </div>
        )}

        {trendingCourses.length === 0 && (
          <div className="row">
            <h2>No Trending Courses</h2>
          </div>
        )}

        {/* Render all courses */}
        <h2>All Courses</h2>
        <div className="row">
          {allCourses.map((course) => (
            <div className="col-md-4 mb-4" key={course.id}>
              <CourseCard course={course} imageUrl={course.imageUrl} enrolledStudentsCount={course.enrolledStudentsCount} />
              {course.averageRating > 0 && (
                <p>Average Rating: {course.averageRating.toFixed(1)}</p>
              )}
              
              <button
                className="btn btn-primary mt-2"
                onClick={() => handleEnrollClick(course.id)}
                disabled={enrolledCourses.includes(course.id)}
              >
                {enrolledCourses.includes(course.id) ? 'Enrolled' : 'Enroll Now'}
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default HomePage1;
