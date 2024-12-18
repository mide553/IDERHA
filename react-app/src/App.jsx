import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import Welcome from './pages/Welcome';
import './index.css';

const App = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);

  return (
    <Router>
      <Header isSignedIn={isSignedIn} setIsSignedIn={setIsSignedIn} />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn setIsSignedIn={setIsSignedIn} />} />
          <Route path="/welcome" element={<Welcome />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
};

export default App;