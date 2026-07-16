import { describe, expect, it } from 'vitest';
import firebaseConfig from '../../firebase.json';

interface HostingHeader {
  key: string;
  value: string;
}

interface HostingHeaderRule {
  source: string;
  headers: HostingHeader[];
}

interface HostingRewrite {
  source: string;
  destination?: string;
  run?: {
    serviceId: string;
    region: string;
    pinTag: boolean;
  };
}

interface FirebaseHostingConfig {
  hosting: {
    headers?: HostingHeaderRule[];
    rewrites?: HostingRewrite[];
  };
}

const config = firebaseConfig as FirebaseHostingConfig;

describe('Firebase Hosting Configuration Verification', () => {
  it('keeps the /api/** Cloud Run rewrite before the final SPA catch-all', () => {
    const rewrites = config.hosting.rewrites ?? [];
    const apiRewriteIndex = rewrites.findIndex(rewrite => rewrite.source === '/api/**');
    const spaRewriteIndex = rewrites.findIndex(rewrite => rewrite.source === '**');

    expect(apiRewriteIndex).toBeGreaterThanOrEqual(0);
    expect(spaRewriteIndex).toBeGreaterThanOrEqual(0);
    expect(apiRewriteIndex).toBeLessThan(spaRewriteIndex);
    expect(spaRewriteIndex).toBe(rewrites.length - 1);

    const apiRewrite = rewrites[apiRewriteIndex];
    expect(apiRewrite.run).toEqual({
      serviceId: 'matchday-command-api',
      region: 'northamerica-northeast2',
      pinTag: false,
    });

    const spaRewrite = rewrites[spaRewriteIndex];
    expect(spaRewrite.destination).toBe('/index.html');
  });

  it('sets exact cache policies without targeting the Cloud Run API', () => {
    const headerRules = config.hosting.headers ?? [];

    const cacheValueFor = (source: string) => {
      const matchingRules = headerRules.filter(rule => rule.source === source);
      expect(matchingRules).toHaveLength(1);

      const cacheHeaders = matchingRules[0].headers.filter(
        header => header.key.toLowerCase() === 'cache-control',
      );
      expect(cacheHeaders).toHaveLength(1);

      return cacheHeaders[0].value;
    };

    expect(headerRules.map(rule => rule.source)).toEqual(['/assets/**', '/', '/index.html']);
    expect(headerRules.map(rule => rule.source)).not.toContain('/api/**');
    expect(cacheValueFor('/assets/**')).toBe('public, max-age=31536000, immutable');
    expect(cacheValueFor('/')).toBe('no-cache');
    expect(cacheValueFor('/index.html')).toBe('no-cache');
  });
});
