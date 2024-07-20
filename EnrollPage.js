import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db, auth } from './firebase'; // Ensure correct import from your Firebase configuration file
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { Container, Card, Button, Spinner, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const EnrollPage = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseRef = doc(db, 'courses', courseId);
        const courseSnapshot = await getDoc(courseRef);

        if (courseSnapshot.exists()) {
          const courseData = courseSnapshot.data();
          setCourse(courseData);

          // Check if the user is already enrolled
          const user = auth.currentUser;
          if (user && courseData.enrolledStudents && courseData.enrolledStudents.includes(user.uid)) {
            setIsEnrolled(true);
          }
        } else {
          setError('Course not found');
        }
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Failed to fetch course');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleEnroll = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        setError('You must be logged in to enroll in a course.');
        return;
      }

      const courseRef = doc(db, 'courses', courseId);
      await updateDoc(courseRef, {
        enrolledStudents: arrayUnion(user.uid)
      });

      setIsEnrolled(true); // Update state to reflect enrollment
      alert('You have successfully enrolled in the course!');
    } catch (err) {
      console.error('Error enrolling in course:', err);
      setError('Failed to enroll in course');
    }
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="sr-only">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="text-center my-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <Card className="text-center">
        <Card.Body>
          <Card.Title>{course.title}</Card.Title>
          <Card.Title>{course.instructor}</Card.Title>
          <Card.Text>{course.description}</Card.Text>
          <Button
            variant={isEnrolled ? "success" : "primary"}
            onClick={handleEnroll}
            disabled={isEnrolled}
          >
            {isEnrolled ? 'Already Enrolled' : 'Enroll'}
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EnrollPage;
