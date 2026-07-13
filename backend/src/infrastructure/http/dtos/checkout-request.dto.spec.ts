import { validate } from 'class-validator';
import {
  CheckoutItemDto,
  CheckoutRequestDto,
  CustomerDto,
  PaymentMethodDto,
} from './checkout-request.dto';

function createValidDto(): CheckoutRequestDto {
  return Object.assign(new CheckoutRequestDto(), {
    items: [
      Object.assign(new CheckoutItemDto(), {
        productId: '11111111-1111-4111-a111-111111111111',
        quantity: 1,
      }),
    ],
    customer: Object.assign(new CustomerDto(), {
      email: 'customer@example.com',
      fullName: 'John Doe',
    }),
    paymentMethod: Object.assign(new PaymentMethodDto(), {
      cardNumber: '4111111111111111',
      cvc: '123',
      expMonth: '12',
      expYear: '2027',
      holderName: 'John Doe',
    }),
  } as CheckoutRequestDto);
}

describe('CheckoutRequestDto', () => {
  it('validate_whenPayloadIsValid_returnsNoErrors', async () => {
    const errors = await validate(createValidDto());

    expect(errors.length).toBe(0);
  });

  it('validate_whenQuantityIsLessThanOne_returnsError', async () => {
    const dto = createValidDto();
    Object.assign(dto as unknown as Record<string, unknown>, {
      items: [
        Object.assign(new CheckoutItemDto(), {
          productId: '11111111-1111-4111-a111-111111111111',
          quantity: 0,
        }),
      ],
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('validate_whenCardNumberIsTooShort_returnsError', async () => {
    const dto = createValidDto();
    Object.assign(dto as unknown as Record<string, unknown>, {
      paymentMethod: Object.assign(new PaymentMethodDto(), {
        cardNumber: '411111',
        cvc: '123',
        expMonth: '12',
        expYear: '2027',
        holderName: 'John Doe',
      }),
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });
});
