import React from 'react';
import { Link } from 'react-router-dom';
import '../css/Home.css';

const Home = () => {
    return (
        <div className="home-main">
            <h1>eHealth Insights</h1>
            <p>Revolutionizing eHealth Data Spaces with secure, user-friendly solutions for data processing, analysis, and sharing.</p>
            <Link to="/signin" className="nav-button">Sign In</Link>
        </div>
    );
};

export default Home;