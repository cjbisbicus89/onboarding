import { Theme } from '../../infrastructure/theme';

const TOAST_Z_INDEX = 1000;

export const makeToastStyles = () => ({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Theme.spacing.base,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: TOAST_Z_INDEX,
  },
  text: {
    color: Theme.colors.neutral['100'],
    fontWeight: Theme.typography.weights.semibold,
    textAlign: 'center',
  },
  info: { backgroundColor: Theme.colors.info },
  success: { backgroundColor: Theme.colors.success },
  warning: { backgroundColor: Theme.colors.warning },
  error: { backgroundColor: Theme.colors.error },
} as const);
