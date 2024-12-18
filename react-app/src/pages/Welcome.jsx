import React from 'react';
import '../css/Welcome.css';

const Welcome = () => {
    return (
        <div className="welcome-main">
            <div className="welcome-text">
                <h1>Welcome to IDERHA</h1>
                <p>your trusted platform for securely managing and analyzing health data. 
                    Whether you're a healthcare provider or a patient, IDERHA 
                    ensures a seamless and secure exchange of healthcare data 
                    in compliance with the highest privacy standards.</p>
            </div>
            <div className="welcome-image-full">
                <img src="/src/img/Image1.png" alt="Description of image 1" />
            </div>
            <div className="welcome-images-side-by-side">
                <img src="/src/img/Image2.png" alt="Description of image 2" />
                <img src="/src/img/Image3.png" alt="Description of image 3" />
            </div>
        </div>
    );
};

export default Welcome;