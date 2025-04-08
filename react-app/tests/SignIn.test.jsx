import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SignIn from '../src/pages/SignIn';

describe('SignIn Page', () => {
    test('renders the email input field', () => {
        render(
            <BrowserRouter>
                <SignIn setIsSignedIn={() => { }} />
            </BrowserRouter>
        );
        const emailInput = screen.getByLabelText(/email/i);
        expect(emailInput).toBeInTheDocument();
    });

    test('renders the password input field', () => {
        render(
            <BrowserRouter>
                <SignIn setIsSignedIn={() => { }} />
            </BrowserRouter>
        );
        const passwordInput = screen.getByLabelText(/password/i);
        expect(passwordInput).toBeInTheDocument();
    });
});