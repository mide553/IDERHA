import { render, screen } from '@testing-library/react';
import Analytics from '../src/pages/Analytics';

describe('Analytics Page', () => {
    test('renders without crashing', () => {
        render(<Analytics />);
        const analyticsElement = screen.getByRole('heading', { name: /Advanced Analytics Dashboard/i });
        expect(analyticsElement).toBeInTheDocument();
    });
});