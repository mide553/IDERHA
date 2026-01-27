import { render, screen, fireEvent } from '@testing-library/react';
import Help from '../src/pages/Help';

describe('Help Page', () => {
    test('renders the title', () => {
        render(<Help />);
        const titleElement = screen.getByText(/Help & Support/i);
        expect(titleElement).toBeInTheDocument();
    });

    test('renders getting started section', () => {
        render(<Help />);
        const gettingStarted = screen.getByText(/Getting Started/i);
        expect(gettingStarted).toBeInTheDocument();
    });

    test('renders quick navigation section', () => {
        render(<Help />);
        const quickNav = screen.getByText(/Quick Navigation/i);
        expect(quickNav).toBeInTheDocument();
    });

    test('renders FAQ section', () => {
        render(<Help />);
        const faqSection = screen.getByText(/Frequently Asked Questions/i);
        expect(faqSection).toBeInTheDocument();
    });

    test('FAQ items can be expanded and collapsed', () => {
        render(<Help />);
        const firstQuestion = screen.getByText(/What is eHealth Insights?/i);
        expect(firstQuestion).toBeInTheDocument();
        
        // Click to expand
        fireEvent.click(firstQuestion);
        
        // Check if answer is visible
        const answer = screen.getByText(/federated health analytics platform/i);
        expect(answer).toBeInTheDocument();
        
        // Click to collapse
        fireEvent.click(firstQuestion);
    });

    test('renders multiple FAQ items', () => {
        render(<Help />);
        
        expect(screen.getByText(/How do I log in to the system?/i)).toBeInTheDocument();
        expect(screen.getByText(/What are the different user roles?/i)).toBeInTheDocument();
        expect(screen.getByText(/How do I upload patient data?/i)).toBeInTheDocument();
    });

    test('renders need more help section', () => {
        render(<Help />);
        const needHelp = screen.getByText(/Need More Help?/i);
        expect(needHelp).toBeInTheDocument();
    });
});