import { describe, it, expect } from 'vitest';
import { refs, getRef } from '../src/lib/references';

describe('reference registry', () => {
  it('every reference has a non-empty title and an absolute URL', () => {
    for (const [id, ref] of Object.entries(refs)) {
      expect(ref.title, `${id} title`).toBeTruthy();
      expect(ref.url, `${id} url`).toMatch(/^https?:\/\//);
    }
  });

  it('getRef returns a known reference and throws on unknown ids', () => {
    expect(getRef('easLdlCausality2017').url).toMatch(/^https?:\/\//);
    expect(() => getRef('does-not-exist' as never)).toThrow();
  });
});
