//. # Fluture retry
//.
//. Toolset for retrying potentially failing computations represented by
//. [Fluture][] Futures.
//.
//. ## Usage
//.
//. ### Node
//.
//. ```console
//. $ npm install --save fluture fluture-retry
//. ```
//.
//. On Node 12 and up, this module can be loaded directly with `import` or
//. `require`. On Node versions below 12, `require` or the [esm][]-loader can
//. be used.
//.
//. ### Deno and Modern Browsers
//.
//. You can load the EcmaScript module from various content delivery networks:
//.
//. - [Skypack](https://cdn.skypack.dev/fluture-retry@3.1.0)
//. - [JSPM](https://jspm.dev/fluture-retry@3.1.0)
//. - [jsDelivr](https://cdn.jsdelivr.net/npm/fluture-retry@3.1.0/+esm)
//.
//. ### Old Browsers and Code Pens
//.
//. There's a [UMD][] file included in the NPM package, also available via
//. jsDelivr: https://cdn.jsdelivr.net/npm/fluture-retry@3.1.0/dist/umd.js
//.
//. This file adds `flutureRetry` to the global scope, or use CommonJS/AMD
//. when available.
//.
//. ### Usage Example
//.
//. Let's say we have the following `Future Error String` that may fail
//. occasionally:
//.
//. ```js
//. import {Future} from 'fluture';
//. const task = Future ((rej, res) => {
//.   const fail = Math.random () > 0.8;
//.   setTimeout (fail ? rej : res, 100, fail ? new Error ('rej') : 'res');
//. });
//. ```
//.
//. We might simply want to try again when it does fail, a certain amount of
//. times, waiting a certain length of time in between tries.
//.
//. #### Basic usage
//.
//. The `retryLinearly` export will take a Future and produce a Future which
//. retries the computation five times, at linearly increasing intervals
//. (1 second, 2 seconds, 3 seconds, etc). If all tries fail, the Future
//. rejects with the last encountered rejection reason. So we can simply wrap
//. our `task` from before, and we get back a `Future Error String` with
//. increased odds of success.
//.
//. ```js
//. import {fork} from 'fluture';
//. import {retryLinearly} from 'fluture-retry';
//. const retriedTask = retryLinearly (task);
//. fork (retriedTask) (console.error) (console.log);
//. ```
//.
//. #### Advanced usage
//.
//. The pre-baked retry strategies may not include exactly what you need. The
//. `retry` function puts you in control of the following:
//.
//. * How much time is in between every try, and how the amount of failures
//.   affect the waiting time.
//. * How many times a Future is retried.
//. * What to do with the accumulated errors.
//.
//. In the following example, we retry our task 32 times, with an exponentially
//. increasing interval starting at 64ms. It will have retried 32 times after
//. about two and a half minutes, waiting just over a minute at most. At the
//. end we list all unique error messages.
//.
//. ```js
//. import {fork} from 'fluture';
//. import {retry, exponentially} from 'fluture-retry';
//.
//. //    retriedTask :: Future (Array Error) String
//. const retriedTask = retry (exponentially (64)) (32) (task);
//.
//. fork (retriedTask) (
//.   errors => console.error (
//.     `All tries failed. The following errors were encountered: \n  ${
//.       Array.from (
//.         new Set (errors.map (({message}) => message))
//.       ).join ('\n  ')
//.     }.`
//.   )
//. ) (console.log);
//. ```

import {reject, after, mapRej, chain, chainRej} from 'fluture/index.js';

//  last :: NonEmpty (Array a) -> a
function last(xs) {
  return xs[xs.length - 1];
}

//. ## API
//.
//# retry :: (Number -> Number) -> Number -> Future a b -> Future (Array a) b
//.
//. Create a retrying Future using the given parameters:
//.
//. 1. A function over the amount of failures to determine waiting time.
//.    See [`exponentially`](#exponentially), [`linearly`](#linearly) and
//.    [`statically`](#statically) for pre-baked functions of this sort.
//. 1. The maximum number of retries before failing.
//. 1. A Future representing the computation to retry.
//.
//. See [Advanced usage](#advanced-usage) for an example.
export function retry(time) {
  return function retry(max) {
    return function retry(task) {
      var failures = new Array (max);
      return (function recur(i) {
        return task.pipe (chainRej (function(failure) {
          failures[i] = failure;
          var total = i + 1;
          return total === max ? reject (failures)
                               : chain (recur) (after (time (total)) (total));
        }));
      } (0));
    };
  };
}

//# exponentially :: Number -> Number -> Number
//.
//. Takes two numbers and returns the result of multiplying the first by
//. the second raised to the power of two. To be partially applied and used
//. as a first argument to `retry`.
export function exponentially(t) {
  return function exponentially(n) {
    return t * Math.pow (n, 2);
  };
}

//# linearly :: Number -> Number -> Number
//.
//. Takes two numbers and returns the result of multiplying them. To be
//. partially applied and used as a first argument to `retry`.
export function linearly(t) {
  return function linearly(n) {
    return t * n;
  };
}

//# statically :: a -> b -> a
//.
//. Takes two values and returns the first. To be partially applied and used
//. as a first argument to `retry`.
export function statically(t) {
  return function statically(_) {
    return t;
  };
}

//# linearSeconds :: Number -> Number
//.
//. Takes a number and multiplies it by 1000.
export var linearSeconds = linearly (1000);

//# retryLinearly :: Future a b -> Future a b
//.
//. A pre-baked retry strategy. See [Basic usage](#basic-usage).
export function retryLinearly(task) {
  return mapRej (last) (retry (linearSeconds) (5) (task));
}

//. [Fluture]: https://github.com/fluture-js/Fluture
//. [esm]: https://github.com/standard-things/esm
//. [UMD]: https://github.com/umdjs/umd
