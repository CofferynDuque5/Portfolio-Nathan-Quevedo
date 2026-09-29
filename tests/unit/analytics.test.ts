import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detectBrowser, detectDevice } from '../../server/src/controllers/analytics.controller';

const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const IPAD = 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/604.1';
const EDGE = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36 Edg/130.0';
const ANDROID_TABLET = 'Mozilla/5.0 (Linux; Android 14; SM-X710) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';

test('tipo de dispositivo', () => {
  assert.equal(detectDevice(IPHONE), 'mobile');
  assert.equal(detectDevice(IPAD), 'tablet');
  assert.equal(detectDevice(ANDROID_TABLET), 'tablet');
  assert.equal(detectDevice(EDGE), 'desktop');
});

test('navegador (Edge antes que Chrome, Safari al final)', () => {
  assert.equal(detectBrowser(EDGE), 'Edge');
  assert.equal(detectBrowser(ANDROID_TABLET), 'Chrome');
  assert.equal(detectBrowser(IPHONE), 'Safari');
  assert.equal(detectBrowser('curl/8.0'), null);
});
