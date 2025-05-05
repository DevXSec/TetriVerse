import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom'; // ✅ Fix: Ensures Jest recognizes text matchers
import { ThemeProvider, useTheme } from '../../../src/views/Theme/ThemeContext';

// Mock localStorage
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock component to consume ThemeContext
const TestComponent = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <p data-testid="theme-value">{theme}</p>
      <button onClick={toggleTheme} data-testid="toggle-button">Toggle Theme</button>
    </div>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  test('loads default theme from localStorage', () => {
    window.localStorage.setItem('theme', 'dark'); // Mock localStorage value

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-value')).toHaveTextContent('dark'); // ✅ No more error!
  });

  test('defaults to "light" theme if localStorage is empty', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-value')).toHaveTextContent('light'); // ✅ No more error!
  });

  test('toggles theme when button is clicked', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const button = screen.getByTestId('toggle-button');

    act(() => {
      button.click();
    });

    expect(screen.getByTestId('theme-value')).toHaveTextContent('dark'); // ✅ Works now!
    expect(window.localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');

    act(() => {
      button.click();
    });

    expect(screen.getByTestId('theme-value')).toHaveTextContent('light'); // ✅ No errors!
    expect(window.localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
  });
});
