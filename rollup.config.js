import pkg from './package.json';

const dependencyNames = Array.prototype.concat.call (
  Object.keys (pkg.dependencies),
  Object.keys (pkg.peerDependencies),
  ['fluture/index.js']
);

export default {
  input: 'index.js',
  external: dependencyNames,
  output: {
    format: 'umd',
    file: 'dist/umd.js',
    name: 'flutureRetry',
    interop: false,
    exports: 'named',
    globals: {
      'fluture/index.js': 'Fluture'
    },
    paths: {
      'fluture/index.js': 'fluture'
    }
  }
};
