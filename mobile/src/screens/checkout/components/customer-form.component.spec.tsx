import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CustomerFormComponent } from './customer-form.component';

describe('CustomerFormComponent', () => {
  const baseProps = {
    initialData: { email: 'john@example.com', fullName: 'John Doe' },
    onComplete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with initial data', () => {
    const { getByDisplayValue } = render(<CustomerFormComponent {...baseProps} />);
    expect(getByDisplayValue('John Doe')).toBeTruthy();
    expect(getByDisplayValue('john@example.com')).toBeTruthy();
  });

  it('shows error when full name is empty', () => {
    const { getByText, getByPlaceholderText } = render(<CustomerFormComponent {...baseProps} />);
    fireEvent.changeText(getByPlaceholderText('Nombre completo'), '');
    fireEvent.changeText(getByPlaceholderText('Correo electrónico'), 'test@example.com');
    fireEvent.press(getByText('Continuar al Pago'));
    expect(getByText('El nombre es obligatorio')).toBeTruthy();
    expect(baseProps.onComplete).not.toHaveBeenCalled();
  });

  it('shows error when email is invalid', () => {
    const { getByText, getByPlaceholderText } = render(<CustomerFormComponent {...baseProps} />);
    fireEvent.changeText(getByPlaceholderText('Nombre completo'), 'Jane');
    fireEvent.changeText(getByPlaceholderText('Correo electrónico'), 'invalid');
    fireEvent.press(getByText('Continuar al Pago'));
    expect(getByText('Correo electrónico no válido')).toBeTruthy();
    expect(baseProps.onComplete).not.toHaveBeenCalled();
  });

  it('calls onComplete with valid data', () => {
    const { getByText, getByPlaceholderText } = render(<CustomerFormComponent {...baseProps} />);
    fireEvent.changeText(getByPlaceholderText('Nombre completo'), 'Jane');
    fireEvent.changeText(getByPlaceholderText('Correo electrónico'), 'jane@example.com');
    fireEvent.press(getByText('Continuar al Pago'));
    expect(baseProps.onComplete).toHaveBeenCalledWith({ email: 'jane@example.com', fullName: 'Jane' });
  });
});
