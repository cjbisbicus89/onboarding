import { COLORS, SHADOWS, AnimationConfig } from '../../infrastructure/theme';

export const makeBackdropStyles = (height: number) => ({
  overlay: {
    backgroundColor: COLORS.black,
  },
  backdrop: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: height * AnimationConfig.BackdropHeightRatio,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: AnimationConfig.BackdropBorderRadius,
    borderTopRightRadius: AnimationConfig.BackdropBorderRadius,
    ...SHADOWS.elevated,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
