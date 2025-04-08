import { render, screen } from '@testing-library/react';
import Welcome from '../src/pages/Welcome';

describe('Welcome Page', () => {
    test('renders the main welcome heading', () => {
        render(<Welcome />);
        const welcomeHeadings = screen.getAllByText(/Welcome/i);
        expect(welcomeHeadings[0]).toBeInTheDocument();
    });
});