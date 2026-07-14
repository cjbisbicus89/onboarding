import { httpStatusPhrase } from './http-status-phrase.util';

describe('httpStatusPhrase', () => {
  it('returnsKnownStatusPhrase', () => {
    expect(httpStatusPhrase(400)).toBe('Bad Request');
  });

  it('returnsErrorForUnknownStatus', () => {
    expect(httpStatusPhrase(418)).toBe('Error');
  });
});
