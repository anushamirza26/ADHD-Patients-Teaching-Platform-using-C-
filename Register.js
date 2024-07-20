import React, { useState } from 'react';
import { auth, db } from './firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Register.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [userType, setUserType] = useState('student'); // Default to 'student'
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Additional information to save
      const userId = userCredential.user.uid;
      await saveAdditionalUserInfo(userId, age, educationLevel, userType);

      alert('Registration successful!');
      navigate('/login'); // Redirect to login page after registration
    } catch (err) {
      setError(err.message);
    }
  };

  const saveAdditionalUserInfo = async (userId, age, educationLevel, userType) => {
    try {
      await addDoc(collection(db, 'users'), {
        userId: userId,
        age: parseInt(age), // Ensure age is stored as number
        educationLevel: educationLevel,
        userType: userType,
        email: email
      });
      console.log('Additional user info saved successfully.');
    } catch (error) {
      console.error('Error saving additional user info:', error);
      throw new Error('Failed to save additional user info: ' + error.message);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="register-form card p-4">
      
        <div className="card-body">
          <h2 className="text-center mb-4">Register</h2>
          <form onSubmit={handleRegister}>
            <div className="form-group mb-3">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group mb-3">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group mb-3">
              <label htmlFor="age">Age</label>
              <input
                type="number"
                id="age"
                className="form-control"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
              />
            </div>
            <div className="form-group mb-3">
              <label htmlFor="educationLevel">Education Level</label>
              <input
                type="text"
                id="educationLevel"
                className="form-control"
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                required
              />
            </div>
            <div className="form-group mb-3">
              <label htmlFor="userType">Register as</label>
              <select
                id="userType"
                className="form-control"
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                required
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
              </select>
            </div>
            <button type="submit" className="btn btn-success w-100">
              Register
            </button>
            {error && <p className="text-danger mt-3">{error}</p>}
          </form>
          <div className="text-center mt-3">
            <Link to="/">Already have an account? Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
