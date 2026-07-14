import { COLORS, SPACING } from '../../infrastructure/theme';

const TOAST_Z_INDEX = 1000;

export const makeToastStyles = () => ({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.base,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: TOAST_Z_INDEX,
  },
  text: {
    color: COLORS.white,
    fontWeight: '600',
    textAlign: 'center',
  },
  info: { backgroundColor: COLORS.info },
  success: { backgroundColor: COLORS.success },
  warning: { backgroundColor: COLORS.warning },
  error: { backgroundColor: COLORS.error },
});
