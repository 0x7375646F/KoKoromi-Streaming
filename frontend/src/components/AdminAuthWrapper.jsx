import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loader from './Loader';

const AdminAuthWrapper = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No token found in localStorage");

      const response = await axios.get('http://localhost:6969/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': '*/*',
          'Content-Type': 'application/json',
        }
      });

      console.log(response);

      if (response.data.role === 'root') {
        setIsAuthenticated(true);
        setUser(response.data);
        navigate('/admin'); // 🔁 Redirect root users here
      } else {
        setIsAuthenticated(false);
        navigate('/home');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      navigate('/home');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
    navigate('/admin/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <Loader className="h-32 w-32" />
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate('/home');
    return null;
  }

  return (
    <div className="admin-auth-wrapper">
      {React.cloneElement(children, { user, onLogout: handleLogout })}
    </div>
  );
};

export default AdminAuthWrapper;
