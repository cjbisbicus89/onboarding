import React from 'react';
import { render, act } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Backdrop } from './backdrop.component';

describe('Backdrop', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns null when not visible', () => {
    const { toJSON } = render(
      <Backdrop visible={false} onClose={() => {}}>
        <Text>Content</Text>
      </Backdrop>
    );
    expect(toJSON()).toBeNull();
  });

  it('renders children when visible', () => {
    const { getByText } = render(
      <Backdrop visible={true} onClose={() => {}}>
        <Text>Content</Text>
      </Backdrop>
    );

    act(() => {
      jest.runAllTimers();
    });

    expect(getByText('Content')).toBeTruthy();
  });
});
