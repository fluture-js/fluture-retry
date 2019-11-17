export default {
  input: 'index.js',
  external: ['fluture/index.js'],
  output: {
    format: 'umd',
    file: 'index.cjs',
    name: 'flutureRetry',
    interop: false,
    globals: {
      'fluture/index.js': 'Fluture'
    },
    paths: {
      'fluture/index.js': 'fluture'
    }
  }
};
