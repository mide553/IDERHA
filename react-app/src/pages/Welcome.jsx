import React from 'react';
import '../css/Welcome.css';

const Welcome = () => {
    return (
        <div className="welcome-main">
            <div className="welcome-text">
                <h1>Welcome to eHealth Insights</h1>
                <p>Welcome to the eHealth Insights, your innovative eHealth Data Space. 
                    Our platform is designed to securely manage and analyze health data, 
                    ensuring a seamless and secure exchange of healthcare information 
                    while maintaining the highest standards of privacy and security</p>
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