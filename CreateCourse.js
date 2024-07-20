import React, { useState, useEffect } from 'react';
import { auth, db, storage } from './firebase'; // Ensure correct imports
import { collection, addDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';

const CreateCourse = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [instructorName, setInstructorName] = useState('');
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState('');
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();
  const user = auth.currentUser; // Get the current authenticated user

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const uploadFiles = async (files) => {
    const uploadedFileURLs = [];
    for (const file of files) {
      try {
        const fileRef = storageRef(storage, `files/${file.name}`);
        await uploadBytes(fileRef, file);
        const fileURL = await getDownloadURL(fileRef);
        uploadedFileURLs.push({ url: fileURL, type: file.type });
      } catch (error) {
        console.error('Error uploading file:', error.message);
        throw error;
      }
    }
    return uploadedFileURLs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      setMessage('Please upload at least one file.');
      return;
    }

    try {
      const uploadedFiles = await uploadFiles(files);

      const courseData = {
        title: title,
        description: description,
        price: price,
        category: category, // Include category in course data
        instructorName: instructorName,
        files: uploadedFiles,
        instructorEmail: user.email, // Associate course with current user's email
      };

      const docRef = await addDoc(collection(db, 'courses'), courseData);
      setMessage('Course created successfully!');
      setCourses([...courses, { id: docRef.id, ...courseData }]);
      setTitle('');
      setDescription('');
      setPrice('');
      setCategory('');
      setInstructorName('');
      setFiles([]);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      console.error('Error adding document:', error);
    }
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };



  return (
    <div className="container">
      <h2>Create Course</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description (max 5 lines)</label>
          <textarea
            id="description"
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            style={{ maxHeight: '120px', overflow: 'hidden' }}
            rows={5}
          />
        </div>
        <div className="form-group">
          <label htmlFor="price">Price</label>
          <input
            type="number"
            id="price"
            className="form-control"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <input
            type="text"
            id="category"
            className="form-control"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="instructorName">Instructor Name</label>
          <input
            type="text"
            id="instructorName"
            className="form-control"
            value={instructorName}
            onChange={(e) => setInstructorName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="file">Upload File</label>
          <input
            type="file"
            id="file"
            className="form-control"
            accept="video/*,image/*"
            onChange={handleFileChange}
            multiple
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Create Course</button>
      </form>
      {message && <p>{message}</p>}

      <h3>Courses</h3>
      <ul>
        {courses.map((course, index) => (
          <li key={index}>
            <h4>{course.title}</h4>
            <p>{course.description}</p>
            <p>Price: ${course.price}</p>
            <p>Category: {course.category}</p>
            <p>Instructor: {course.instructorName}</p>
            <div>
              {course.files.map((file, i) => (
                <div key={i}>
                  {file.type.startsWith('image/') ? (
                    <img src={file.url} alt={`File ${i + 1}`} style={{ maxWidth: '100%', marginBottom: '10px' }} />
                  ) : (
                    <a href={file.url} target="_blank" rel="noopener noreferrer">File {i + 1}</a>
                  )}
                </div>
              ))}
            </div>
          </li>
        ))}
      </ul>
    
    </div>
  );
};

export default CreateCourse;
