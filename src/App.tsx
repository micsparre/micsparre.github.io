// App.tsx
import React from 'react';
import Header from './components/Header';
import About from './components/About';
import SocialLinks from './components/SocialLinks';
import './App.css'; // Add any global styles here

const App: React.FC = () => {
  return (
    <div className="App">
      <Header />
      <About />
      <SocialLinks />
    </div>
  );
};

export default App;
