import { render, screen } from '@testing-library/react';
import Help from '../src/pages/Help';

describe('Help Page', () => {
    test('renders the title', () => {
        render(<Help />);
        const titleElement = screen.getByText(/Help/i);
        expect(titleElement).toBeInTheDocument();
    });
});