import assert from 'assert';
import {resolve, reject, isFuture} from 'fluture/index.js';
import {equivalence} from 'fluture/test/assertions.js';
import Z from 'sanctuary-type-classes';
import * as fr from '../index.js';
import test from 'oletus';

var resolved = resolve ('resolved');
var rejected = reject ('rejected');

function eq(actual, expected) {
  assert.strictEqual (arguments.length, eq.length);
  assert.strictEqual (Z.toString (actual), Z.toString (expected));
  assert.strictEqual (Z.equals (actual, expected), true);
}

test ('exponentially', function() {
  eq (typeof fr.exponentially, 'function');
  eq (fr.exponentially.length, 1);
  eq (typeof fr.exponentially (1), 'function');
  eq (fr.exponentially (1).length, 1);
  eq (typeof fr.exponentially (1) (1), 'number');

  eq (fr.exponentially (1) (1), 1);
  eq (fr.exponentially (1) (10), 100);
  eq (fr.exponentially (2) (10), 200);
  eq (fr.exponentially (64) (32), 65536);
});

test ('linearly', function() {
  eq (typeof fr.linearly, 'function');
  eq (fr.linearly.length, 1);
  eq (typeof fr.linearly (1), 'function');
  eq (fr.linearly (1).length, 1);
  eq (typeof fr.linearly (1) (1), 'number');

  eq (fr.linearly (1) (1), 1);
  eq (fr.linearly (1) (10), 10);
  eq (fr.linearly (2) (10), 20);
  eq (fr.linearly (64) (32), 2048);
});

test ('statically', function() {
  eq (typeof fr.statically, 'function');
  eq (fr.statically.length, 1);
  eq (typeof fr.statically (1), 'function');
  eq (fr.statically (1).length, 1);
  eq (typeof fr.statically (1) (1), 'number');

  eq (fr.statically (1) (1), 1);
  eq (fr.statically (1) (10), 1);
  eq (fr.statically (2) (10), 2);
  eq (fr.statically (64) (32), 64);
});

test ('linearSeconds', function() {
  eq (typeof fr.linearSeconds, 'function');
  eq (fr.linearSeconds.length, 1);
  eq (typeof fr.linearSeconds (1), 'number');

  eq (fr.linearSeconds (1), 1000);
  eq (fr.linearSeconds (10), 10000);
  eq (fr.linearSeconds (32), 32000);
});

test ('retry', function() {
  eq (typeof fr.retry, 'function');
  eq (fr.retry.length, 1);
  eq (typeof fr.retry (), 'function');
  eq (fr.retry ().length, 1);
  eq (typeof fr.retry () (), 'function');
  eq (fr.retry () ().length, 1);
  eq (isFuture (fr.retry (fr.statically (1)) (1) (resolved)), true);
});

test ('retry success', function() {
  var actual = fr.retry (fr.statically (1)) (1) (resolved);
  return equivalence (actual) (resolved);
});

test ('retry failure', function() {
  var actual = fr.retry (fr.statically (1)) (1) (rejected);
  return equivalence (actual) (reject (['rejected']));
});

test ('retryLinearly', function() {
  eq (typeof fr.retryLinearly, 'function');
  eq (fr.retryLinearly.length, 1);
  eq (isFuture (fr.retryLinearly (resolved)), true);
});

test ('retryLinearly success', function() {
  return equivalence (fr.retryLinearly (resolved)) (resolved);
});

test ('retryLinearly failure', function() {
  return equivalence (fr.retryLinearly (rejected)) (rejected);
});
