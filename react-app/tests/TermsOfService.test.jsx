import { render, screen } from '@testing-library/react';
import TermsOfService from '../src/pages/TermsOfService';

describe('TermsOfService Page', () => {
    test('renders the title', () => {
        render(<TermsOfService />);
        const titleElement = screen.getByRole('heading', { name: 'Terms of Service', level: 1 });
        expect(titleElement).toBeInTheDocument();
    });

    test('renders last updated date', () => {
        render(<TermsOfService />);
        const dateElement = screen.getByText(/Last Updated: January 13, 2026/i);
        expect(dateElement).toBeInTheDocument();
    });

    test('renders placeholder content', () => {
        render(<TermsOfService />);
        const content = screen.getByText(/Lorem ipsum dolor sit amet/i);
        expect(content).toBeInTheDocument();
    });
});