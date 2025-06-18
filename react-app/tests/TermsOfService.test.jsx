import { render, screen } from '@testing-library/react';
import TermsOfService from '../src/pages/TermsOfService';

describe('TermsOfService Page', () => {
    test('renders the title', () => {
        render(<TermsOfService />);
        const titleElement = screen.getByText(/Terms of Service/i);
        expect(titleElement).toBeInTheDocument();
    });
});