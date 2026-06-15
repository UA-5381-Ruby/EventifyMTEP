import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SidebarNav } from '@/components/layout/sidebar/sidebar-nav';

describe('SidebarNav', () => {
    const defaultProps = {
        currentPath: '/dashboard',
        onNavigate: jest.fn(),
        isCollapsed: false,
        onSelect: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders superadmin navigation items when isSuperAdmin is true', () => {
        render(<SidebarNav {...defaultProps} isSuperAdmin={true} />);

        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Brands')).toBeInTheDocument();
        expect(screen.getByText('Users')).toBeInTheDocument();
        expect(screen.getByText('Logs Page')).toBeInTheDocument();

        expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
        expect(screen.queryByText('Events')).not.toBeInTheDocument();
    });

    test('renders brand navigation items when isSuperAdmin is false and role is admin', () => {
        render(<SidebarNav {...defaultProps} isSuperAdmin={false} role="admin" />);

        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Events')).toBeInTheDocument();
        expect(screen.getByText('Members')).toBeInTheDocument();
        expect(screen.getByText('Settings')).toBeInTheDocument();
        expect(screen.getByText('Our policy')).toBeInTheDocument();

        expect(screen.queryByText('SuperAdmin Dash')).not.toBeInTheDocument();
        expect(screen.queryByText('Brands')).not.toBeInTheDocument();
    });

    test('renders nothing when isSuperAdmin is false and role is not admin', () => {
        const { container } = render(
            <SidebarNav {...defaultProps} isSuperAdmin={false} role="member" />
        );
        expect(container.firstChild).toBeNull();
    });

    test('calls onNavigate and onSelect when item is clicked', () => {
        render(<SidebarNav {...defaultProps} isSuperAdmin={false} role="admin" />);

        const eventsButton = screen.getByText('Events').closest('button');

        if (eventsButton) {
            fireEvent.click(eventsButton);
        }

        expect(defaultProps.onNavigate).toHaveBeenCalledWith('/events');
        expect(defaultProps.onSelect).toHaveBeenCalledWith('Events');
    });

    test('applies none display style when isCollapsed is true', () => {
        render(
            <SidebarNav {...defaultProps} isSuperAdmin={false} role="admin" isCollapsed={true} />
        );

        const dashboardButton = screen.getByText('Dashboard').closest('button');
        expect(dashboardButton).toHaveStyle({ display: 'none' });
    });

    test('applies active styles when currentPath matches item href', () => {
        render(
            <SidebarNav {...defaultProps} isSuperAdmin={false} role="admin" currentPath="/events" />
        );

        const eventsButton = screen.getByText('Events').closest('button');
        expect(eventsButton).toHaveStyle({
            border: '1px solid #10B981',
            background: 'rgba(16, 185, 129, 0.1)',
            color: '#10B981',
        });
    });
});