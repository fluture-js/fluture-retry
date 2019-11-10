import * as Future from 'fluture'

declare function retry(time: (a: number) => number): (max: number) => <A, B>(task: Future.FutureInstance<A, B>) => Future.FutureInstance<A[], B>;
declare function exponentially(t: number): (n: number) => number;
declare function linearly(t: number): (n: number) => number;
declare function statically(t: number): (_: any) => number;
declare function linearSeconds(n: number): number;
declare function retryLinearly<A, B>(task: Future.FutureInstance<A, B>): Future.FutureInstance<A, B>;
