import { render, screen } from '@testing-library/react';
import PrivacyPolicy from '../src/pages/PrivacyPolicy';

describe('PrivacyPolicy Page', () => {
    test('renders the title', () => {
        render(<PrivacyPolicy />);
        const titleElement = screen.getByText(/eHealth Insights/i);
        expect(titleElement).toBeInTheDocument();
    });
});