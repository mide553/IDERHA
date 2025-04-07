import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import '../css/SignIn.css';

const SignIn = ({ setIsSignedIn }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8080/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (data.status === 'success') {
                setIsSignedIn(true);
                navigate('/welcome');
            } else {
                setError(data.message);
            }
        } catch (err) {
            console.error('Error during sign-in:', err);
            setError('An error occurred. Please try again.');
        }
    };

    return (
        <div className="signin-container">
            <h2>Login to eHealth Insights</h2>
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

SignIn.propTypes = {
    setIsSignedIn: PropTypes.func.isRequired,
};

export default SignIn;