import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ErrorBoundary } from './error-boundary.component';

const ProblematicComponent = () => {
  throw new Error('Test Error');
};

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <Text>Safe Content</Text>
      </ErrorBoundary>
    );
    expect(getByText('Safe Content')).toBeTruthy();
  });

  it('renders error UI when child throws', () => {
    // Hide console.error for this test to avoid clutter
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { getByText } = render(
      <ErrorBoundary>
        <ProblematicComponent />
      </ErrorBoundary>
    );

    expect(getByText('Ha ocurrido un error inesperado')).toBeTruthy();
    consoleSpy.mockRestore();
  });

  it('does not log error in production mode', () => {
    const prevDev = (global as any).__DEV__;
    (global as any).__DEV__ = false;
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { getByText } = render(
      <ErrorBoundary>
        <ProblematicComponent />
      </ErrorBoundary>
    );

    expect(getByText('Ha ocurrido un error inesperado')).toBeTruthy();
    expect(consoleSpy).not.toHaveBeenCalledWith('Error capturado por Error Boundary:', expect.anything(), expect.anything());

    consoleSpy.mockRestore();
    (global as any).__DEV__ = prevDev;
  });

  it('resets error state when clicking Restart', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { getByText, queryByText, rerender } = render(
      <ErrorBoundary>
        <ProblematicComponent />
      </ErrorBoundary>
    );

    expect(getByText('Ha ocurrido un error inesperado')).toBeTruthy();

    // Change children to something safe BEFORE restarting
    rerender(
      <ErrorBoundary>
        <Text>Safe Content</Text>
      </ErrorBoundary>
    );

    fireEvent.press(getByText('Reiniciar Aplicación'));

    expect(queryByText('Safe Content')).toBeTruthy();
    consoleSpy.mockRestore();
  });
});
