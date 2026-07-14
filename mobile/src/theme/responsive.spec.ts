import React from 'react';
import { View } from 'react-native';
import { render } from '@testing-library/react-native';
import { useResponsiveDimensions } from './responsive';

describe('useResponsiveDimensions', () => {
  it('returnsDimensionsAndSmallDeviceFlag', () => {
    let result: { width: number; height: number; isSmallDevice: boolean } | undefined;

    const TestComponent: React.FC = () => {
      result = useResponsiveDimensions();
      return React.createElement(View, null);
    };

    render(React.createElement(TestComponent));

    expect(result).toBeDefined();
    expect(typeof result?.width).toBe('number');
    expect(typeof result?.isSmallDevice).toBe('boolean');
  });
});
