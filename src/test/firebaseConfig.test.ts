import { describe, it, expect } from 'vitest';
import firebaseConfig from '../../firebase.json';

describe('Firebase Hosting Configuration Verification', () => {
  it('validates pinTag is false and /api/** rewrite is ordered before SPA ** catch-all', () => {
    const config = firebaseConfig as any;

    expect(config.hosting).toBeDefined();

    const rewrites = config.hosting.rewrites || [];
    expect(rewrites.length).toBeGreaterThanOrEqual(2);

    const apiRewriteIndex = rewrites.findIndex((r: any) => r.source === '/api/**');
    const spaRewriteIndex = rewrites.findIndex((r: any) => r.source === '**');

    expect(apiRewriteIndex).toBeGreaterThanOrEqual(0);
    expect(spaRewriteIndex).toBeGreaterThanOrEqual(0);
    expect(apiRewriteIndex).toBeLessThan(spaRewriteIndex);

    const apiRewrite = rewrites[apiRewriteIndex];
    expect(apiRewrite.run).toBeDefined();
    expect(apiRewrite.run.serviceId).toBe('matchday-command-api');
    expect(apiRewrite.run.region).toBe('northamerica-northeast2');
    expect(apiRewrite.run.pinTag).toBe(false);
  });
});
