// Header.tsx
import React from 'react';
import profilePicture from '../assets/profile.jpg'; // Relative path to the Instagram icon image
import '../styles/font.css';
import '../styles/header.css'
import '../styles/profile.css'

const Header: React.FC = () => {
  return (
    <header className="profile">
      <img
        className="profile-picture"
        src={profilePicture}
        alt="Michael Sparre headshot" />
      <div className="name">
        <h1 className="first-name">Michael</h1>
        <h1 className="last-name">Sparre</h1>
      </div>
    </header>
  );
};

export default Header;
