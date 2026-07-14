import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CardFormComponent } from './card-form.component';

describe('CardFormComponent', () => {
  const baseProps = {
    onComplete: jest.fn(),
    loading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls onComplete with valid card data', () => {
    const { getByText, getByPlaceholderText } = render(<CardFormComponent {...baseProps} />);

    fireEvent.changeText(getByPlaceholderText('Número de tarjeta'), '4111111111111111');
    fireEvent.changeText(getByPlaceholderText('MM/YY'), '1230');
    fireEvent.changeText(getByPlaceholderText('CVC'), '123');
    fireEvent.changeText(getByPlaceholderText('Nombre del titular'), 'John Doe');

    fireEvent.press(getByText('Continuar'));

    expect(baseProps.onComplete).toHaveBeenCalledWith({
      cardNumber: '4111111111111111',
      expMonth: '12',
      expYear: '2030',
      cvc: '123',
      holderName: 'John Doe',
    });
  });

  it('displays detected card brand', () => {
    const { getByPlaceholderText, getByText } = render(<CardFormComponent {...baseProps} />);
    fireEvent.changeText(getByPlaceholderText('Número de tarjeta'), '4111111111111111');
    expect(getByText('VISA')).toBeTruthy();
  });

  it('shows card number validation error', () => {
    const { getByText, getByPlaceholderText } = render(<CardFormComponent {...baseProps} />);
    fireEvent.changeText(getByPlaceholderText('Número de tarjeta'), '123');
    fireEvent.changeText(getByPlaceholderText('MM/YY'), '1230');
    fireEvent.changeText(getByPlaceholderText('CVC'), '123');
    fireEvent.changeText(getByPlaceholderText('Nombre del titular'), 'John Doe');
    fireEvent.press(getByText('Continuar'));
    expect(getByText(/tarjeta debe tener entre 13 y 19/)).toBeTruthy();
  });

  it('shows expiry validation error', () => {
    const { getByText, getByPlaceholderText } = render(<CardFormComponent {...baseProps} />);
    fireEvent.changeText(getByPlaceholderText('Número de tarjeta'), '4111111111111111');
    fireEvent.changeText(getByPlaceholderText('MM/YY'), '1325');
    fireEvent.changeText(getByPlaceholderText('CVC'), '123');
    fireEvent.changeText(getByPlaceholderText('Nombre del titular'), 'John Doe');
    fireEvent.press(getByText('Continuar'));
    expect(getByText('Mes inválido')).toBeTruthy();
  });

  it('shows cvc validation error', () => {
    const { getByText, getByPlaceholderText } = render(<CardFormComponent {...baseProps} />);
    fireEvent.changeText(getByPlaceholderText('Número de tarjeta'), '4111111111111111');
    fireEvent.changeText(getByPlaceholderText('MM/YY'), '1230');
    fireEvent.changeText(getByPlaceholderText('CVC'), '12');
    fireEvent.changeText(getByPlaceholderText('Nombre del titular'), 'John Doe');
    fireEvent.press(getByText('Continuar'));
    expect(getByText(/CVC inválido/)).toBeTruthy();
  });

  it('shows holder name validation error', () => {
    const { getByText, getByPlaceholderText } = render(<CardFormComponent {...baseProps} />);
    fireEvent.changeText(getByPlaceholderText('Número de tarjeta'), '4111111111111111');
    fireEvent.changeText(getByPlaceholderText('MM/YY'), '1230');
    fireEvent.changeText(getByPlaceholderText('CVC'), '123');
    fireEvent.press(getByText('Continuar'));
    expect(getByText('Nombre requerido')).toBeTruthy();
  });

  it('shows loading indicator when loading is true', () => {
    const { toJSON, queryByText } = render(<CardFormComponent {...baseProps} loading={true} />);
    expect(queryByText('Continuar')).toBeNull();
    const hasActivityIndicator = (node: any): boolean =>
      node?.type === 'ActivityIndicator' || (node?.children && node.children.some((child: any) => hasActivityIndicator(child)));
    expect(hasActivityIndicator(toJSON())).toBe(true);
  });
});
