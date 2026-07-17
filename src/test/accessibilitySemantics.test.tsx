import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from '../pages/Home';

describe('Shared page accessibility semantics', () => {
  it('associates the Home mode section with its visible heading', () => {
    render(<Home setCurrentPage={vi.fn()} openCrowdMap={vi.fn()} />);

    const heading = screen.getByRole('heading', {
      level: 2,
      name: 'One venue snapshot, built for the people moving through it.',
    });
    const section = screen.getByRole('region', {
      name: 'One venue snapshot, built for the people moving through it.',
    });

    expect(heading).toHaveAttribute('id', 'mode-split-title');
    expect(section).toHaveAttribute('aria-labelledby', 'mode-split-title');
  });
});
