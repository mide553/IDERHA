import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/SignIn.css';

const SignIn = ({ setIsSignedIn }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const templateAccount = {
        email: 'test@test.com',
        password: '12345678'
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (email === templateAccount.email && password === templateAccount.password) {
            console.log('Sign In Successful');
            setError('');
            setIsSignedIn(true);
            navigate('/welcome');
        } else {
            setError('Invalid email or password');
        }
    };

    return (
        <div className="signin-container">
            <h2>Login to IDERHA</h2>
            <form className="signin-form" onSubmit={handleSubmit}>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p className="error">{error}</p>}
                <button type="submit">Sign In</button>
            </form>
        </div>
    );
};

export default SignIn;