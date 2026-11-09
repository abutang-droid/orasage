import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeChannelCode } from './index.ts';

test('normalizeChannelCode lowercases a valid code', () => {
  assert.equal(normalizeChannelCode(' BR-Sao '), 'br-sao');
});

test('normalizeChannelCode rejects empty, spaces, and punctuation', () => {
  assert.equal(normalizeChannelCode(''), null);
  assert.equal(normalizeChannelCode('   '), null);
  assert.equal(normalizeChannelCode('br sao'), null);
  assert.equal(normalizeChannelCode('br.sao'), null);
  assert.equal(normalizeChannelCode(null), null);
});
