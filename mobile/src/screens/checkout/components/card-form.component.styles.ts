import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../../infrastructure/theme';

const HORIZONTAL_PADDING_RATIO = 0.05;
const TITLE_FONT_SIZE_RATIO = 0.05;
const TITLE_MARGIN_BOTTOM_RATIO = 0.02;
const INPUT_HEIGHT_RATIO = 0.06;
const INPUT_FONT_SIZE_RATIO = 0.04;
const BUTTON_HEIGHT_RATIO = 0.07;

export const makeCardFormStyles = ({ width, height }: { width: number; height: number }) => ({
  container: {
    padding: width * HORIZONTAL_PADDING_RATIO,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: width * TITLE_FONT_SIZE_RATIO,
    fontWeight: 'bold',
    marginBottom: height * TITLE_MARGIN_BOTTOM_RATIO,
    textAlign: 'center',
    color: COLORS.textPrimary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    height: height * INPUT_HEIGHT_RATIO,
  },
  halfInputContainer: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  halfInputContainerLast: {
    flex: 1,
  },
  icon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: width * INPUT_FONT_SIZE_RATIO,
    color: COLORS.textPrimary,
  },
  row: {
    flexDirection: 'row',
  },
  halfErrorText: {
    flex: 1,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  button: {
    backgroundColor: COLORS.primary,
    height: height * BUTTON_HEIGHT_RATIO,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  disabledButton: {
    backgroundColor: COLORS.primaryLight,
  },
  pressedButton: {
    opacity: 0.85,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
} as const);
