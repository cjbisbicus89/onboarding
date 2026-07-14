import React from 'react';
import { render } from '@testing-library/react-native';
import { RootNavigator } from './root-navigator';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

jest.mock('@react-navigation/stack', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    createStackNavigator: jest.fn(() => ({
      Navigator: ({ children }: any) => React.createElement('View', null, children),
      Screen: ({ name }: any) => React.createElement(Text, null, name),
    })),
  };
});

describe('RootNavigator', () => {
  it('renders all defined screens', () => {
    const store = configureStore({
      reducer: {
        transaction: (state = {}) => state,
        cart: (state = {}) => state,
        catalog: (state = {}) => state,
      },
    });

    const { getByText } = render(
      <Provider store={store}>
        <RootNavigator />
      </Provider>
    );

    expect(getByText('Splash')).toBeTruthy();
    expect(getByText('Home')).toBeTruthy();
    expect(getByText('ProductDetail')).toBeTruthy();
    expect(getByText('Checkout')).toBeTruthy();
    expect(getByText('Result')).toBeTruthy();
  });
});
