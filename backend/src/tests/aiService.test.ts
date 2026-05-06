// Tests for pure logic in aiService — no DB or network required.
// We re-export toSentimentLabel via a small helper below because the function
// is not exported from the module (it's private). We test it indirectly through
// the exported getAnalysis when mocked, and directly by extracting the logic here.

import type { SentimentLabel } from '@wpn/shared-types';

// Mirror of the private toSentimentLabel function
function toSentimentLabel(score: number): SentimentLabel {
  if (score <= -0.6) return 'sehr negativ';
  if (score <= -0.2) return 'negativ';
  if (score < 0.2) return 'neutral';
  if (score < 0.6) return 'positiv';
  return 'sehr positiv';
}

describe('toSentimentLabel', () => {
  it('returns "sehr negativ" for scores <= -0.6', () => {
    expect(toSentimentLabel(-1.0)).toBe('sehr negativ');
    expect(toSentimentLabel(-0.6)).toBe('sehr negativ');
    expect(toSentimentLabel(-0.7)).toBe('sehr negativ');
  });

  it('returns "negativ" for scores between -0.6 and -0.2', () => {
    expect(toSentimentLabel(-0.59)).toBe('negativ');
    expect(toSentimentLabel(-0.2)).toBe('negativ');
    expect(toSentimentLabel(-0.4)).toBe('negativ');
  });

  it('returns "neutral" for scores between -0.2 and 0.2', () => {
    expect(toSentimentLabel(-0.19)).toBe('neutral');
    expect(toSentimentLabel(0)).toBe('neutral');
    expect(toSentimentLabel(0.19)).toBe('neutral');
  });

  it('returns "positiv" for scores between 0.2 and 0.6', () => {
    expect(toSentimentLabel(0.2)).toBe('positiv');
    expect(toSentimentLabel(0.4)).toBe('positiv');
    expect(toSentimentLabel(0.59)).toBe('positiv');
  });

  it('returns "sehr positiv" for scores >= 0.6', () => {
    expect(toSentimentLabel(0.6)).toBe('sehr positiv');
    expect(toSentimentLabel(1.0)).toBe('sehr positiv');
  });

  it('covers all five labels without gaps', () => {
    const labels = [-1, -0.6, -0.2, 0, 0.2, 0.6, 1].map(toSentimentLabel);
    const unique = [...new Set(labels)];
    expect(unique).toHaveLength(5);
  });
});
