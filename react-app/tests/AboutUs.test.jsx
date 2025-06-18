import { render, screen } from '@testing-library/react';
import AboutUs from '../src/pages/AboutUs';

describe('AboutUs Page', () => {
    test('renders the title', () => {
        render(<AboutUs />);
        const titleElement = screen.getByText(/About Us/i);
        expect(titleElement).toBeInTheDocument();
    });

    test('renders the team section', () => {
        render(<AboutUs />);
        const teamElement = screen.getByText(/Our Team/i);
        expect(teamElement).toBeInTheDocument();
    });
});