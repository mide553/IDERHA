import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../src/pages/Home';

describe('Home Page', () => {
    test('renders the title', () => {
        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );
        const titleElement = screen.getByText(/eHealth Insights/i);
        expect(titleElement).toBeInTheDocument();
    });

    test('renders the sign-in button', () => {
        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );
        const buttonElement = screen.getByText(/Sign In/i);
        expect(buttonElement).toBeInTheDocument();
    });
});