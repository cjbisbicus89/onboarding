import { Theme } from '../../infrastructure/theme';

export const makeBackdropStyles = (height: number) => ({
  overlay: {
    backgroundColor: Theme.colors.neutral['900'],
  },
  backdrop: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: height * Theme.animation.BackdropHeightRatio,
    backgroundColor: Theme.colors.background,
    borderTopLeftRadius: Theme.animation.BackdropBorderRadius,
    borderTopRightRadius: Theme.animation.BackdropBorderRadius,
    ...Theme.shadows.elevated,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
} as const);
