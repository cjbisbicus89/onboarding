import { useWindowDimensions } from 'react-native';

export const useResponsiveDimensions = () => {
  const { width, height } = useWindowDimensions();
  return { width, height, isSmallDevice: width <= 375 };
};
