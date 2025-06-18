import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Footer from '../src/components/Footer';

describe('Footer Component', () => {
    test('renders Privacy Policy link', () => {
        render(
            <BrowserRouter>
                <Footer />
            </BrowserRouter>
        );
        const privacyLink = screen.getByText(/Privacy Policy/i);
        expect(privacyLink).toBeInTheDocument();
    });

    test('renders Terms of Service link', () => {
        render(
            <BrowserRouter>
                <Footer />
            </BrowserRouter>
        );
        const termsLink = screen.getByText(/Terms of Service/i);
        expect(termsLink).toBeInTheDocument();
    });

    test('renders About Us link', () => {
        render(
            <BrowserRouter>
                <Footer />
            </BrowserRouter>
        );
        const aboutUsLink = screen.getByText(/About Us/i);
        expect(aboutUsLink).toBeInTheDocument();
    });
});