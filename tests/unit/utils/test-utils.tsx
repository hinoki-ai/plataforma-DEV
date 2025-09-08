import { render } from '@testing-library/react';
import { ReactElement } from 'react';

export const renderWithProviders = (ui: ReactElement, options = {}) => {
  return render(ui, {
    wrapper: ({ children }) => children,
    ...options,
  });
};

export * from '@testing-library/react';
