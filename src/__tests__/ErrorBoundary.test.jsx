import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';

// Component that throws an error
const ErrorComponent = () => {
  throw new Error('Test error');
};

// Component that doesn't throw
const SafeComponent = () => <div>Safe content</div>;

describe('ErrorBoundary', () => {
  // Mock console.error to avoid noise in test output
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('should render children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <SafeComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Safe content')).toBeInTheDocument();
  });

  it('should render error UI when an error occurs', () => {
    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong!')).toBeInTheDocument();
    expect(screen.getByText('Error: Test error')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument();
  });

  it('should call componentDidCatch when an error occurs', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(spy).toHaveBeenCalledWith(
      'Error caught by boundary:',
      expect.any(Error),
      expect.any(Object)
    );

    spy.mockRestore();
  });

  it('should handle different types of errors', () => {
    const CustomErrorComponent = () => {
      throw new TypeError('Custom type error');
    };

    render(
      <ErrorBoundary>
        <CustomErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('TypeError: Custom type error')).toBeInTheDocument();
  });

  it('should handle errors in nested components', () => {
    const NestedErrorComponent = () => (
      <div>
        <SafeComponent />
        <ErrorComponent />
      </div>
    );

    render(
      <ErrorBoundary>
        <NestedErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong!')).toBeInTheDocument();
    expect(screen.queryByText('Safe content')).not.toBeInTheDocument();
  });

  it('should handle async errors', async () => {
    const AsyncErrorComponent = () => {
      React.useEffect(() => {
        throw new Error('Async error');
      }, []);
      return <div>Async component</div>;
    };

    render(
      <ErrorBoundary>
        <AsyncErrorComponent />
      </ErrorBoundary>
    );

    // Wait for the error to be caught
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(screen.getByText('Something went wrong!')).toBeInTheDocument();
  });

  it('should show reload button when error occurs', () => {
    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    const reloadButton = screen.getByRole('button', { name: /reload page/i });
    expect(reloadButton).toBeInTheDocument();
  });
});