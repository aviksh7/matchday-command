import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

// Mock scrollIntoView for JSDOM
if (typeof window !== 'undefined') {
  window.HTMLElement.prototype.scrollIntoView = function() {};
}
