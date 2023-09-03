// SocialLinks.tsx
import React from 'react';
import githubIcon from '../assets/icons/GitHub-Icon.png'; // Relative path to the GitHub icon image
import linkedinIcon from '../assets/icons/LinkedIn-Icon.png'; // Relative path to the LinkedIn icon image
import instagramIcon from '../assets/icons/Instagram-Icon.png'; // Relative path to the Instagram icon image
import '../styles/SocialLinks.css'; // Create a separate CSS file for the icons


const SocialLinks: React.FC = () => {
  return (
    <div className="social-links">
      <a href="https://github.com/micsparre" target="_blank" rel="noopener noreferrer">
        <img src={githubIcon} alt="GitHub" />
      </a>
      <a href="https://linkedin.com/in/michaelthorsparre" target="_blank" rel="noopener noreferrer">
        <img src={linkedinIcon} alt="LinkedIn" />
      </a>
      <a href="https://instagram.com/micsparre" target="_blank" rel="noopener noreferrer">
        <img src={instagramIcon} alt="Instagram" />
      </a>
    </div>
  );
};

export default SocialLinks;
