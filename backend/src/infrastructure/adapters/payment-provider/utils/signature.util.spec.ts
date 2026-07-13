import { SignatureUtil } from './signature.util';

describe('SignatureUtil', () => {
  it('generate_whenCalledWithSameInputs_returnsConsistentHash', () => {
    const signature = SignatureUtil.generate(
      'merchant-ref-1',
      150_000,
      'COP',
      'secret-key',
    );

    expect(signature).toBeDefined();
    expect(signature).toHaveLength(64);

    const signatureAgain = SignatureUtil.generate(
      'merchant-ref-1',
      150_000,
      'COP',
      'secret-key',
    );

    expect(signature).toBe(signatureAgain);
  });

  it('generate_whenInputsDiffer_returnsDifferentHash', () => {
    const signatureA = SignatureUtil.generate(
      'merchant-ref-1',
      150_000,
      'COP',
      'secret-key',
    );
    const signatureB = SignatureUtil.generate(
      'merchant-ref-2',
      150_000,
      'COP',
      'secret-key',
    );

    expect(signatureA).not.toBe(signatureB);
  });
});
