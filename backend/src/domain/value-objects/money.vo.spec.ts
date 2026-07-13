import { DomainException } from '../exceptions/domain.exception';
import { MoneyVO } from './money.vo';

describe('MoneyVO', () => {
  it('fromCents_whenAmountAndCurrencyAreValid_createsValueObject', () => {
    const money = MoneyVO.fromCents(150_000, 'COP');

    expect(money.amount).toBe(150_000);
    expect(money.currency).toBe('COP');
    expect(money.toCents()).toBe(150_000);
  });

  it('fromCents_whenAmountIsNotInteger_throwsDomainException', () => {
    expect(() => MoneyVO.fromCents(1500.5, 'COP')).toThrow(DomainException);
  });

  it('fromCents_whenAmountIsNegative_throwsDomainException', () => {
    expect(() => MoneyVO.fromCents(-1, 'COP')).toThrow(DomainException);
  });

  it('fromCents_whenCurrencyIsInvalid_throwsDomainException', () => {
    expect(() => MoneyVO.fromCents(100, 'usd')).toThrow(DomainException);
    expect(() => MoneyVO.fromCents(100, 'US')).toThrow(DomainException);
  });

  it('zero_createsMoneyWithZeroAmount', () => {
    const money = MoneyVO.zero('COP');

    expect(money.amount).toBe(0);
    expect(money.currency).toBe('COP');
  });

  it('add_whenSameCurrency_returnsSum', () => {
    const a = MoneyVO.fromCents(100, 'COP');
    const b = MoneyVO.fromCents(250, 'COP');

    const result = a.add(b);

    expect(result.amount).toBe(350);
    expect(result.currency).toBe('COP');
  });

  it('add_whenDifferentCurrencies_throwsDomainException', () => {
    const a = MoneyVO.fromCents(100, 'COP');
    const b = MoneyVO.fromCents(250, 'USD');

    expect(() => a.add(b)).toThrow(DomainException);
  });

  it('multiply_whenFactorIsNonNegativeInteger_returnsProduct', () => {
    const money = MoneyVO.fromCents(1_000, 'COP');

    const result = money.multiply(3);

    expect(result.amount).toBe(3_000);
  });

  it('multiply_whenFactorIsNegative_throwsDomainException', () => {
    const money = MoneyVO.fromCents(1_000, 'COP');

    expect(() => money.multiply(-1)).toThrow(DomainException);
  });

  it('equals_whenSameAmountAndCurrency_returnsTrue', () => {
    const a = MoneyVO.fromCents(1_000, 'COP');
    const b = MoneyVO.fromCents(1_000, 'COP');

    expect(a.equals(b)).toBe(true);
  });

  it('equals_whenDifferentAmounts_returnsFalse', () => {
    const a = MoneyVO.fromCents(1_000, 'COP');
    const b = MoneyVO.fromCents(2_000, 'COP');

    expect(a.equals(b)).toBe(false);
  });

  it('equals_whenDifferentCurrencies_returnsFalse', () => {
    const a = MoneyVO.fromCents(1_000, 'COP');
    const b = MoneyVO.fromCents(1_000, 'USD');

    expect(a.equals(b)).toBe(false);
  });
});
