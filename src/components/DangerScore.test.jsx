import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DangerScore from './DangerScore';

describe('DangerScore Component', () => {
  it('renders a high danger score correctly with red styling', () => {
    render(<DangerScore score={85} />);
    
    // Check if the score text is rendered
    expect(screen.getByText('85')).toBeDefined();
    
    // Check if the DANGER label is present
    expect(screen.getByText(/DO NOT SIGN/i)).toBeDefined();
  });

  it('renders a safe score correctly with green styling', () => {
    render(<DangerScore score={25} />);
    
    expect(screen.getByText('25')).toBeDefined();
    expect(screen.getByText(/SAFE TO SIGN/i)).toBeDefined();
  });
});
