import React from 'react';
import { View } from 'react-native';
import { render } from '@testing-library/react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useAppDispatch, useAppSelector } from './hooks';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

describe('hooks', () => {
  it('useAppDispatch_returnsDispatchFromReactRedux', () => {
    const mockDispatch = jest.fn();
    (useDispatch as jest.Mock).mockReturnValue(mockDispatch);

    let dispatch: any;

    const TestComponent: React.FC = () => {
      dispatch = useAppDispatch();
      return React.createElement(View, null);
    };

    render(React.createElement(TestComponent));

    expect(dispatch).toBe(mockDispatch);
  });

  it('useAppSelector_passesSelectorToReactRedux', () => {
    const mockState = { counter: { value: 42 } };
    (useSelector as jest.Mock).mockImplementation((selector: any) => selector(mockState));

    let value: any;

    const TestComponent: React.FC = () => {
      value = useAppSelector((state: any) => state.counter.value);
      return React.createElement(View, null);
    };

    render(React.createElement(TestComponent));

    expect(value).toBe(42);
  });
});
