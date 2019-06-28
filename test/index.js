'use strict';

var assert = require ('assert');
var Future = require ('fluture');
var Z = require ('sanctuary-type-classes');

var fr = require ('..');


var resolved = Future.of ('resolved');
var rejected = Future.reject ('rejected');

function eq(actual, expected) {
  assert.strictEqual (arguments.length, eq.length);
  assert.strictEqual (Z.toString (actual), Z.toString (expected));
  assert.strictEqual (Z.equals (actual, expected), true);
}

function feq(ok, actual, expected) {
  expected.fork (function(a) {
    actual.fork (function(b) {
      eq (a, b);
      ok ();
    }, function(b) {
      eq ('resolved<' + Z.toString (a) + '>', 'rejected<' + Z.toString (b) + '>');
    });
  }, function(a) {
    actual.fork (function(b) {
      eq ('rejected<' + Z.toString (a) + '>', 'resolved<' + Z.toString (b) + '>');
    }, function(b) {
      eq (a, b);
      ok ();
    });
  });
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
  eq (Future.isFuture (fr.retry (fr.statically (1)) (1) (resolved)), true);
});

test ('retry success', function(done) {
  var actual = fr.retry (fr.statically (1)) (1) (resolved);
  feq (done, actual, resolved);
});

test ('retry failure', function(done) {
  var actual = fr.retry (fr.statically (1)) (1) (rejected);
  feq (done, actual, Future.reject (['rejected']));
});

test ('retryLinearly', function() {
  eq (typeof fr.retryLinearly, 'function');
  eq (fr.retryLinearly.length, 1);
  eq (Future.isFuture (fr.retryLinearly (resolved)), true);
});

test ('retryLinearly success', function(done) {
  feq (done, fr.retryLinearly (resolved), resolved);
});

test ('retryLinearly failure', function(done) {
  feq (done, fr.retryLinearly (rejected), rejected);
});
