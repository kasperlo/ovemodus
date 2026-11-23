import { describe, expect, it } from 'vitest';
import { casioText } from './casio';

describe('casioText', () => {
  it('viser registreringsplassen når låten har en', () => {
    expect(casioText({ reg: [1, 4], tone: 49, layer: 202 })).toBe('Registrering 1-4: 049 CELESTA (en oktav opp) · lag: 202 HARP');
  });

  it('viser bare lyden når låten ikke har registreringsplass', () => {
    expect(casioText({ tone: 75 })).toBe('Lyd: 075 PIPE ORGAN 1');
  });

  it('viser oktavforskyvningen når stykket trenger den', () => {
    expect(casioText({ tone: 1, octave: -1 })).toBe('Lyd: 001 STAGE PIANO · oktav −1');
  });
});
