// About.tsx
import React from 'react';
import '../styles/font.css'; // Import the font CSS file
import '../styles/layout.css'; // Import the font CSS file


const About: React.FC = () => {
  const resumePath = './msparre-res.pdf'
  return (
    <div className="content">
      <section>
        <p>
          Hello! I'm Michael, a passionate software engineer with a strong
          desire to create innovative solutions that solve real-world problems.
          My journey in the world of software development has been driven by my
          curiosity and enthusiasm for technology. My life goal is to leverage my
          coding skills to make a positive impact on society by helping as many people
          as possible.
        </p>
        <p>
          In my free time, I enjoy playing/watching soccer, reading sci-fi books,
          and spending time with my cats. I'm always eager to learn and explore
          new technologies to stay at the forefront of the ever-evolving software
          development landscape.
        </p>
        <div className="resume-link">
          <p> Link to my <a href={resumePath} target="_blank" rel="noopener noreferrer">resume</a></p>
        </div>
        <div className="email-address">
          <p>You can reach me at: <a href="mailto:micsparre@gmail.com">micsparre@gmail.com</a></p>
        </div>
      </section>
    </div>
  );
};

export default About;
