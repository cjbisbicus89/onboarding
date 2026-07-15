import { useWindowDimensions, Dimensions } from 'react-native';

export const useResponsiveDimensions = () => {
  const { width, height } = useWindowDimensions();
  return { width, height, isSmallDevice: width <= 375 };
};

export const responsiveWidth = (percentage: number): number => {
  const { width } = Dimensions.get('window');
  return (width * percentage) / 100;
};

export const responsiveHeight = (percentage: number): number => {
  const { height } = Dimensions.get('window');
  return (height * percentage) / 100;
};
