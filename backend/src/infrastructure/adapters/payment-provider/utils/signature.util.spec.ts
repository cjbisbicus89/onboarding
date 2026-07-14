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

  it('generate_whenCalledWithMandatoryCase_returnsExpectedHash', () => {
    // Caso de prueba obligatorio §8.2: 
    // Monto: 1500000, Referencia: "TX-1234", Secreto de integridad provisto
    const signature = SignatureUtil.generate(
      'TX-1234',
      1500000,
      'COP',
      'stagtest_integrity_nAIBuqayW70XpUqJS4qf4STYiISd89Fp',
    );

    expect(signature).toBe(
      '124ed60ee31a365505913f67b2ae45c2fcbf054202bbf793d87a277dd8738e48',
    );
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
