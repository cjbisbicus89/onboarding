import React from 'react';
import { render } from '@testing-library/react-native';
import { CardBrandLogo } from './card-brand-logo.component';
import { CardBrand } from '../../validators/card.validator';

describe('CardBrandLogo', () => {
  it('returns null when brand is UNKNOWN', () => {
    const { toJSON } = render(<CardBrandLogo brand={CardBrand.UNKNOWN} />);
    expect(toJSON()).toBeNull();
  });

  it('renders VISA logo correctly', () => {
    const { getByText } = render(<CardBrandLogo brand={CardBrand.VISA} />);
    expect(getByText('VISA')).toBeTruthy();
  });

  it('renders MASTERCARD logo correctly', () => {
    const { getByText } = render(<CardBrandLogo brand={CardBrand.MASTERCARD} />);
    expect(getByText('MASTERCARD')).toBeTruthy();
  });

  it('renders other brands as generic badge', () => {
    const { getByText } = render(<CardBrandLogo brand={CardBrand.AMEX} />);
    expect(getByText('AMEX')).toBeTruthy();
  });
});
