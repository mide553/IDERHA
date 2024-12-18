import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import Welcome from './pages/Welcome';
import './css/Main.css';

const App = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);

  return (
    <div className="app-container">
      <Router>
        <Header isSignedIn={isSignedIn} setIsSignedIn={setIsSignedIn} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signin" element={<SignIn setIsSignedIn={setIsSignedIn} />} />
            <Route path="/welcome" element={<Welcome />} />
          </Routes>
        </main>
        <Footer />
      </Router>
    </div>
  );
};

export default App;