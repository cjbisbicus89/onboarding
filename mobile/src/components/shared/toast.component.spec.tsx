import React, { useState } from 'react';
import { render, act, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Toast, useToast } from './toast.component';

describe('Toast', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders message correctly', () => {
    const { getByText } = render(<Toast message="Test Message" />);
    expect(getByText('Test Message')).toBeTruthy();
  });

  it('calls onDismiss after duration', () => {
    const onDismiss = jest.fn();
    render(<Toast message="Test" duration={1000} onDismiss={onDismiss} />);

    act(() => {
      jest.advanceTimersByTime(1301); // duration + animation duration
    });

    expect(onDismiss).toHaveBeenCalled();
  });

  it('useToast exposes current toast and hides it', () => {
    const TestComponent = () => {
      const { toast, show, hide } = useToast();
      const [visible, setVisible] = useState(false);

      return (
        <>
          <Text testID="toast-message">{toast ? toast.message : 'no-toast'}</Text>
          <Text testID="toast-type">{toast ? toast.type : 'no-type'}</Text>
          <Text
            testID="show"
            onPress={() => {
              show('Hello', 'success');
              setVisible(true);
            }}
          >
            Show
          </Text>
          <Text testID="hide" onPress={hide}>Hide</Text>
        </>
      );
    };

    const { getByText } = render(<TestComponent />);

    expect(getByText('no-toast')).toBeTruthy();

    fireEvent.press(getByText('Show'));
    expect(getByText('Hello')).toBeTruthy();

    fireEvent.press(getByText('Hide'));
    expect(getByText('no-toast')).toBeTruthy();
  });
});
