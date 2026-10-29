import {expectTypeOf} from 'nz';
import type {IntRange, NegativeInfinity, Opaque, PositiveInfinity, Tagged, UnionMin} from '../index.d.ts';

expectTypeOf<UnionMin<1 | 3 | 2>>().toBe<1>();
expectTypeOf<UnionMin<10 | 5 | 2>>().toBe<2>();
expectTypeOf<UnionMin<0 | 5 | 2 | 1>>().toBe<0>();
expectTypeOf<UnionMin<1 | 2 | 5 | 3 | 7 | 9 | 0>>().toBe<0>();

// Negative numbers are not supported yet.
// expectType<UnionMin<-1 | -3 | -2>>(-3);
// expectType<UnionMin<0 | -5 | -2>>(-5);

// Edge cases
expectTypeOf<any>().toBe<UnionMin<any>>();
expectTypeOf<never>().toBe<UnionMin<never>>();
expectTypeOf<number>().toBe<UnionMin<number>>();
expectTypeOf<number>().toBe<UnionMin<(number & {})>>();
expectTypeOf<number>().toBe<UnionMin<(number & {}) | 1 | 5>>();
expectTypeOf<PositiveInfinity>().toBe<UnionMin<PositiveInfinity>>();
expectTypeOf<NegativeInfinity>().toBe<UnionMin<NegativeInfinity>>();
expectTypeOf<1>().toBe<UnionMin<1 | PositiveInfinity>>();
expectTypeOf<NegativeInfinity>().toBe<UnionMin<1 | NegativeInfinity>>();

expectTypeOf<UnionMin<0>>().toBe<0>();
expectTypeOf<UnionMin<0 | 100>>().toBe<0>();
expectTypeOf<NegativeInfinity>().toBe<UnionMin<PositiveInfinity | NegativeInfinity>>();
expectTypeOf<UnionMin<0 | PositiveInfinity>>().toBe<0>();
expectTypeOf<2>().not.toBeAssignableTo<UnionMin<1 | 3 | 2>>();

const batchSizes = [1, 5, 20] as const;
expectTypeOf<UnionMin<typeof batchSizes[number]>>().toBe<1>();

// @ts-expect-error Non-numeric unions are not supported.
type InvalidUnion = UnionMin<'1' | '2'>;

// Sparse and dense unions keep their exact minimum across different magnitudes.
expectTypeOf<UnionMin<1 | 900>>().toBe<1>();
expectTypeOf<UnionMin<900 | PositiveInfinity>>().toBe<900>();
expectTypeOf<UnionMin<0 | 900 | PositiveInfinity>>().toBe<0>();
expectTypeOf<UnionMin<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9>>().toBe<0>();

// The counter stops at the minimum, so a large union with a small minimum stays cheap.
type DenseCandidates = IntRange<0, 600>;
expectTypeOf<UnionMin<DenseCandidates>>().toBe<0>();
expectTypeOf<UnionMin<Exclude<DenseCandidates, 0>>>().toBe<1>();
expectTypeOf<UnionMin<DenseCandidates | PositiveInfinity>>().toBe<0>();
expectTypeOf<UnionMin<DenseCandidates | NegativeInfinity>>().toBe<NegativeInfinity>();

// The counter is bounded by the minimum itself, which is where the documented limit comes from.
expectTypeOf<UnionMin<998>>().toBe<998>();

// @ts-expect-error - An unknown value cannot be compared.
type UnknownMinimum = UnionMin<unknown>;

// Enum members retain their known numeric values.
enum RetryLimit {
	None = 0,
	Low = 2,
	High = 5,
}
expectTypeOf<UnionMin<RetryLimit.Low | RetryLimit.High>>().toBe<2>();
expectTypeOf<UnionMin<RetryLimit.None>>().toBe<0>();
expectTypeOf<UnionMin<RetryLimit>>().toBe<0>();

declare enum RuntimeRetryLimit {
	Value,
}
expectTypeOf<UnionMin<RetryLimit.Low | 3>>().toBe<2>();
expectTypeOf<UnionMin<RetryLimit.High | 3>>().toBe<3>();
expectTypeOf<UnionMin<RetryLimit.None | PositiveInfinity>>().toBe<0>();
expectTypeOf<UnionMin<RetryLimit.High | NegativeInfinity>>().toBe<NegativeInfinity>();
expectTypeOf<UnionMin<RuntimeRetryLimit.Value>>().toBe<number>();
expectTypeOf<UnionMin<RetryLimit | number>>().toBe<number>();
expectTypeOf<UnionMin<RetryLimit | any>>().toBe<any>();
expectTypeOf<UnionMin<RetryLimit | never>>().toBe<0>();

// Brands must not hide the underlying value from the counter.
expectTypeOf<UnionMin<Tagged<1 | 3, 'Count'>>>().toBe<1>();
expectTypeOf<UnionMin<Tagged<number, 'Count'>>>().toBe<number>();

expectTypeOf<UnionMin<Opaque<1 | 3, 'Count'>>>().toBe<1>();
expectTypeOf<UnionMin<Tagged<Tagged<1 | 3, 'Count'>, 'Validated'>>>().toBe<1>();
expectTypeOf<UnionMin<(1 | 3) & {readonly __brand: unique symbol}>>().toBe<1>();
expectTypeOf<UnionMin<Tagged<0, 'Count'>>>().toBe<0>();
expectTypeOf<UnionMin<Tagged<3, 'Count'>>>().toBe<3>();
expectTypeOf<UnionMin<Tagged<1 | 5, 'First'> | Tagged<2 | 3, 'Second'>>>().toBe<1>();
expectTypeOf<UnionMin<Tagged<2, 'Count'> | 3>>().toBe<2>();
expectTypeOf<UnionMin<1 | Tagged<3, 'Count'>>>().toBe<1>();
expectTypeOf<UnionMin<Tagged<1 | 3, 'Count'> | PositiveInfinity>>().toBe<1>();
expectTypeOf<UnionMin<Tagged<PositiveInfinity, 'Count'>>>().toBe<PositiveInfinity>();
expectTypeOf<UnionMin<Tagged<1 | NegativeInfinity, 'Count'>>>().toBe<NegativeInfinity>();
expectTypeOf<UnionMin<Tagged<1, 'Count'> | Tagged<number, 'Other'>>>().toBe<number>();
expectTypeOf<UnionMin<Tagged<1 | 3, 'Count'> | any>>().toBe<any>();
expectTypeOf<UnionMin<Tagged<1 | 3, 'Count'> | never>>().toBe<1>();
expectTypeOf<UnionMin<Tagged<IntRange<0, 100>, 'Count'>>>().toBe<0>();
expectTypeOf<2>().not.toBeAssignableTo<UnionMin<Tagged<1 | 3, 'Count'>>>();
