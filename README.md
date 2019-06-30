# Fluture retry

[![NPM Version](https://badge.fury.io/js/fluture-retry.svg)](https://www.npmjs.com/package/fluture-retry)
[![Dependencies](https://david-dm.org/fluture-js/fluture-retry.svg)](https://david-dm.org/fluture-js/fluture-retry)
[![Build Status](https://travis-ci.org/fluture-js/fluture-retry.svg?branch=master)](https://travis-ci.org/fluture-js/fluture-retry)
[![Code Coverage](https://codecov.io/gh/fluture-js/fluture-retry/branch/master/graph/badge.svg)](https://codecov.io/gh/fluture-js/fluture-retry)
[![Greenkeeper badge](https://badges.greenkeeper.io/fluture-js/fluture-retry.svg)](https://greenkeeper.io/)

Toolset for retrying potentially failing computations represented by
[Fluture][] Futures.

```console
$ npm install --save fluture fluture-retry
```

## Usage

Let's say we have the following `Future Error String` that may fail
occasionally:

```js
const Future = require ('fluture');
const task = Future ((rej, res) => {
  const fail = Math.random () > 0.8;
  setTimeout (fail ? rej : res, 100, fail ? new Error ('rej') : 'res');
});
```

We might simply want to try again when it does fail, a certain amount of
times, waiting a certain length of time in between tries.

### Basic usage

The `retryLinearly` export will take a Future and produce a Future which
retries the computation five times, at linearly increasing intervals
(1 second, 2 seconds, 3 seconds, etc). If all tries fail, the Future
rejects with the last encountered rejection reason. So we can simply wrap
our `task` from before, and we get back a `Future Error String` with
increased odds of success.

```js
const {retryLinearly} = require ('fluture-retry');
const retriedTask = retryLinearly (task);
retriedTask.fork (console.error, console.log);
```

### Advanced usage

The pre-baked retry strategies may not include exactly what you need. The
`retry` function puts you in control of the following:

* How much time is in between every try, and how the amount of failures
  affect the waiting time.
* How many times a Future is retried.
* What to do with the accumulated errors.

In the following example, we retry our task 32 times, with an exponentially
increasing interval starting at 64ms. It will have retried 32 times after
about two and a half minutes, waiting just over a minute at most. At the
end we list all unique error messages.

```js
const Future = require ('fluture');
const {retry, exponentially} = require ('fluture-retry');

//    retriedTask :: Future (Array Error) String
const retriedTask = retry (exponentially (64)) (32) (task);

retriedTask.fork (
  errors => console.error (
    `All tries failed. The following errors were encountered: \n  ${
      Array.from (
        new Set (errors.map (({message}) => message))
      ).join ('\n  ')
    }.`
  ),
  console.log
);
```

## API

#### <a name="retry" href="https://github.com/fluture-js/fluture-retry/blob/v2.0.0/index.js#L102">`retry :: (Number -⁠> Number) -⁠> Number -⁠> Future a b -⁠> Future (Array a) b`</a>

Create a retrying Future using the given parameters:

1. A function over the amount of failures to determine waiting time.
   See [`exponentially`](#exponentially), [`linearly`](#linearly) and
   [`statically`](#statically) for pre-baked functions of this sort.
1. The maximum number of retries before failing.
1. A Future representing the computation to retry.

See [Advanced usage](#advanced-usage) for an example.

#### <a name="exponentially" href="https://github.com/fluture-js/fluture-retry/blob/v2.0.0/index.js#L130">`exponentially :: Number -⁠> Number -⁠> Number`</a>

Takes two numbers and returns the result of multiplying the first by
the second raised to the power of two. To be partially applied and used
as a first argument to `retry`.

#### <a name="linearly" href="https://github.com/fluture-js/fluture-retry/blob/v2.0.0/index.js#L141">`linearly :: Number -⁠> Number -⁠> Number`</a>

Takes two numbers and returns the result of multiplying them. To be
partially applied and used as a first argument to `retry`.

#### <a name="statically" href="https://github.com/fluture-js/fluture-retry/blob/v2.0.0/index.js#L151">`statically :: a -⁠> b -⁠> a`</a>

Takes two values and returns the first. To be partially applied and used
as a first argument to `retry`.

#### <a name="linearSeconds" href="https://github.com/fluture-js/fluture-retry/blob/v2.0.0/index.js#L161">`linearSeconds :: Number -⁠> Number`</a>

Takes a number and multiplies it by 1000.

#### <a name="retryLinearly" href="https://github.com/fluture-js/fluture-retry/blob/v2.0.0/index.js#L166">`retryLinearly :: Future a b -⁠> Future a b`</a>

A pre-baked retry strategy. See [Basic usage](#basic-usage).

[Fluture]: https://github.com/fluture-js/Fluture
