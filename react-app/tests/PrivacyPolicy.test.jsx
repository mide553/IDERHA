import { render, screen } from '@testing-library/react';
import PrivacyPolicy from '../src/pages/PrivacyPolicy';

describe('PrivacyPolicy Page', () => {
    test('renders the title', () => {
        render(<PrivacyPolicy />);
        const titleElement = screen.getByRole('heading', { name: 'Privacy Policy', level: 1 });
        expect(titleElement).toBeInTheDocument();
    });

    test('renders last updated date', () => {
        render(<PrivacyPolicy />);
        const dateElement = screen.getByText(/Last Updated: January 13, 2026/i);
        expect(dateElement).toBeInTheDocument();
    });

    test('renders placeholder content', () => {
        render(<PrivacyPolicy />);
        const content = screen.getByText(/Lorem ipsum dolor sit amet/i);
        expect(content).toBeInTheDocument();
    });
});