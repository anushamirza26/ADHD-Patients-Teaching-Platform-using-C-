// CourseCard.js
import React from 'react';

const CourseCard = ({ course, imageUrl, enrolledStudentsCount }) => {
  return (
    <div className="card">
      <img src={imageUrl} className="card-img-top" alt={course.title} />
      <div className="card-body">
        <h5 className="card-title">{course.title}</h5>
        <p className="card-text">Instructor: {course.instructor}</p>
        <p className="card-text">Enrolled Students: {enrolledStudentsCount}</p>
      </div>
    </div>
  );
};

export default CourseCard;
