import checkoutReducer, {
  CheckoutStep,
  nextStep,
  previousStep,
  setStep,
  setTransactionInfo,
  resetCheckout,
} from './checkoutSlice';

describe('checkoutSlice', () => {
  const initialState = checkoutReducer(undefined, { type: '@@INIT' });

  it('returnsInitialState', () => {
    expect(initialState.currentStep).toBe(CheckoutStep.CATALOG);
    expect(initialState.transactionId).toBeNull();
    expect(initialState.status).toBe('IDLE');
    expect(initialState.error).toBeNull();
  });

  it('nextStep_whenNotAtLast_incrementsStep', () => {
    let state = checkoutReducer(
      { ...initialState, currentStep: CheckoutStep.CATALOG },
      nextStep(),
    );
    expect(state.currentStep).toBe(CheckoutStep.DETAIL);

    state = checkoutReducer(
      { ...state, currentStep: CheckoutStep.CONFIRMATION },
      nextStep(),
    );
    expect(state.currentStep).toBe(CheckoutStep.CONFIRMATION);
  });

  it('previousStep_whenNotAtFirst_decrementsStep', () => {
    let state = checkoutReducer(
      { ...initialState, currentStep: CheckoutStep.DETAIL },
      previousStep(),
    );
    expect(state.currentStep).toBe(CheckoutStep.CATALOG);

    state = checkoutReducer(
      { ...state, currentStep: CheckoutStep.CATALOG },
      previousStep(),
    );
    expect(state.currentStep).toBe(CheckoutStep.CATALOG);
  });

  it('setStep_updatesStep', () => {
    const state = checkoutReducer(initialState, setStep(CheckoutStep.PAYMENT));
    expect(state.currentStep).toBe(CheckoutStep.PAYMENT);
  });

  it('setTransactionInfo_updatesTransactionAndStatus', () => {
    const state = checkoutReducer(
      initialState,
      setTransactionInfo({ id: 'tx-1', status: 'APPROVED' }),
    );
    expect(state.transactionId).toBe('tx-1');
    expect(state.status).toBe('APPROVED');
  });

  it('resetCheckout_restoresInitialState', () => {
    const state = checkoutReducer(
      { ...initialState, currentStep: CheckoutStep.PAYMENT, transactionId: 'tx-1' },
      resetCheckout(),
    );
    expect(state.currentStep).toBe(CheckoutStep.CATALOG);
    expect(state.transactionId).toBeNull();
  });
});
