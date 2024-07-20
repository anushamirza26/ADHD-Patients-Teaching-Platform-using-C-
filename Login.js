import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import 'bootstrap/dist/css/bootstrap.min.css';
import './login.css'; // Ensure you create and import a custom CSS file for additional styles

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      // Query Firestore for the user document based on the authenticated user's email
      const q = query(collection(db, 'users'), where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          const userType = userData.userType;

          if (userType === 'instructor') {
            navigate('/homepage'); // Redirect to instructor dashboard
          } else if (userType === 'student') {
            navigate('/homepage1'); // Redirect to student homepage
          } else {
            setError('User type not found.');
          }
        });
      } else {
        setError('User data not found in Firestore.');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="login-form card p-4">
        <img src="./logo.png" className="card-img-top" alt="Login" />
        <div className="card-body">
          <h2 className="text-center mb-4">Login</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group mb-3">
              <label htmlFor="login_email">Email</label>
              <input
                type="email"
                id="login_email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group mb-3">
              <label htmlFor="login_password">Password</label>
              <input
                type="password"
                id="login_password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-success w-100">
              Login
            </button>
            {error && <p className="text-danger mt-3">{error}</p>}
          </form>
          <div className="text-center mt-3">
            <Link to="/register">Don't have an account? Register</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
