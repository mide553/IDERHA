import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import Welcome from './pages/Welcome';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Help from './pages/Help';
import AboutUs from './pages/AboutUs';
import Analytics from './pages/Analytics';
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
              <Route path="/welcome" element={isSignedIn ? <Welcome /> : <Navigate to="/signin" />} />
              <Route path="/privacy-policy" element={isSignedIn ? <PrivacyPolicy /> : <Navigate to="/signin" />} />
              <Route path="/terms-of-service" element={isSignedIn ? <TermsOfService /> : <Navigate to="/signin" />} />
              <Route path="/help" element={isSignedIn ? <Help /> : <Navigate to="/signin" />} />
              <Route path="/about-us" element={isSignedIn ? <AboutUs /> : <Navigate to="/signin" />} />
              <Route path="/analytics" element={isSignedIn ? <Analytics /> : <Navigate to="/signin" />} />
            </Routes>
          </main>
          <Footer />
        </Router>
      </div>
  );
};

export default App;