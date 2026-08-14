import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EmptyState from './EmptyState';

describe('EmptyState', () => {
  it('shows title and description', () => {
    render(
      <EmptyState title="No visitors" description="Register a guest to begin." />
    );
    expect(screen.getByText('No visitors')).toBeInTheDocument();
    expect(screen.getByText('Register a guest to begin.')).toBeInTheDocument();
  });
});
