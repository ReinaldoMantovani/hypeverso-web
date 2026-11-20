import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from '@/ui';
describe('Button', () => {
  it('renders label', () => {
    render(<Button>Entrar</Button>);
    expect(screen.getByText('Entrar')).toBeTruthy();
  });
});
