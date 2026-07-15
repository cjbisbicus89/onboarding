import { Theme } from '../../infrastructure/theme';

export const makeErrorBoundaryStyles = () => ({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.neutral['200'],
  },
  title: {
    fontSize: Theme.typography.xl,
    fontWeight: Theme.typography.weights.bold,
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: Theme.typography.base,
    marginBottom: Theme.spacing.lg,
    textAlign: 'center',
  },
} as const);
