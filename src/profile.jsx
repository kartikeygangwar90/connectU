import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function Profile () {
  const { user, logOut } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => {
    await logOut();
    navigate("/login", { replace : true });
  };

  return (
    <>
      <h1>Hey I am on profile page welcome {user.email}</h1>
      <button onClick={handleLogout}>Logout</button>
    </>
  )
}

export default Profile