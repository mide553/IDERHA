import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../src/components/Header';

describe('Header Component', () => {
    test('renders the logo', () => {
        render(
            <BrowserRouter>
                <Header isSignedIn={false} setIsSignedIn={() => { }} />
            </BrowserRouter>
        );
        const logoElement = screen.getByText(/eHealth Insights/i);
        expect(logoElement).toBeInTheDocument();
    });

    test('renders Sign In link when not signed in', () => {
        render(
            <BrowserRouter>
                <Header isSignedIn={false} setIsSignedIn={() => { }} />
            </BrowserRouter>
        );
        const signInLink = screen.getByText(/Sign In/i);
        expect(signInLink).toBeInTheDocument();
    });

    test('renders Sign Out button when signed in', () => {
        render(
            <BrowserRouter>
                <Header isSignedIn={true} setIsSignedIn={() => { }} />
            </BrowserRouter>
        );
        const signOutButton = screen.getByText(/Sign Out/i);
        expect(signOutButton).toBeInTheDocument();
    });
});