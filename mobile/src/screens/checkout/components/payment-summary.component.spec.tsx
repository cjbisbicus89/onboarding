import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PaymentSummaryComponent } from './payment-summary.component';

describe('PaymentSummaryComponent', () => {
  const baseProps = {
    cart: {
      items: [
        { productId: '1', name: 'Product 1', priceCentavos: 1000, quantity: 2 },
      ],
      totalAmountCentavos: 2000,
    },
    customer: { fullName: 'John Doe', email: 'john@example.com' },
    paymentMethod: { cardNumber: '4111111111111111', holderName: 'John Doe' },
    onConfirm: jest.fn(),
    loading: false,
  };

  it('renders cart summary, customer and payment details', () => {
    const { getByText, getAllByText } = render(<PaymentSummaryComponent {...baseProps} />);
    expect(getByText('Product 1 x 2')).toBeTruthy();
    expect(getByText(/Total/)).toBeTruthy();
    expect(getAllByText('John Doe').length).toBeGreaterThanOrEqual(2);
    expect(getByText('john@example.com')).toBeTruthy();
    expect(getByText(/Tarjeta terminada en 1111/)).toBeTruthy();
    expect(getByText('Confirmar Pago')).toBeTruthy();
  });

  it('shows fallback when payment method is missing', () => {
    const { getByText } = render(<PaymentSummaryComponent {...baseProps} paymentMethod={null} />);
    expect(getByText('Método de pago no seleccionado')).toBeTruthy();
  });

  it('calls onConfirm when confirm button is pressed', () => {
    const { getByText } = render(<PaymentSummaryComponent {...baseProps} />);
    fireEvent.press(getByText('Confirmar Pago'));
    expect(baseProps.onConfirm).toHaveBeenCalled();
  });

  it('shows activity indicator when loading', () => {
    const { toJSON } = render(<PaymentSummaryComponent {...baseProps} loading={true} />);
    const hasActivityIndicator = (node: any): boolean =>
      node?.type === 'ActivityIndicator' || (node?.children && node.children.some((child: any) => hasActivityIndicator(child)));
    expect(hasActivityIndicator(toJSON())).toBe(true);
  });
});
