import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from './StatusBadge';

describe('StatusBadge', () => {
  it('renders the status text', () => {
    render(<StatusBadge status="pending" />);
    expect(screen.getByText('pending')).toBeInTheDocument();
  });

  it('renders checked-in status', () => {
    render(<StatusBadge status="checked-in" />);
    expect(screen.getByText('checked-in')).toBeInTheDocument();
  });

  it('handles missing status gracefully', () => {
    const { container } = render(<StatusBadge />);
    expect(container.querySelector('span')).toBeTruthy();
  });
});
