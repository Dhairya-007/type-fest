import {expectTypeOf} from 'nz';
import type {IntRange, NegativeInfinity, Opaque, PositiveInfinity, Tagged, UnionMin} from '../index.d.ts';

expectTypeOf<UnionMin<1 | 3 | 2>>().toBe<1>();
expectTypeOf<UnionMin<10 | 5 | 2>>().toBe<2>();
expectTypeOf<UnionMin<0 | 5 | 2 | 1>>().toBe<0>();
expectTypeOf<UnionMin<1 | 2 | 5 | 3 | 7 | 9 | 0>>().toBe<0>();

// Negatives are not supported, as documented, because only tuple lengths are passed in (skipped)
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

// Enum members retain their known numeric values.
enum Limit {
	Low = 3,
	High = 5,
}
expectTypeOf<UnionMin<Limit>>().toBe<3>();
expectTypeOf<UnionMin<Limit.High | 4>>().toBe<4>();

// A computed enum member has no known value.
declare enum RuntimeLimit {
	Value,
}
expectTypeOf<UnionMin<RuntimeLimit.Value | 3>>().toBe<number>();

// A brand does not hide the underlying value.
expectTypeOf<UnionMin<Tagged<5, 'Limit'> | 7>>().toBe<5>();
expectTypeOf<UnionMin<Tagged<3 | 5, 'Limit'>>>().toBe<3>();
expectTypeOf<UnionMin<Tagged<number, 'Limit'> | 3>>().toBe<number>();

// A single candidate needs no counting and still normalizes enum and branded values.
expectTypeOf<UnionMin<800>>().toBe<800>();
expectTypeOf<UnionMin<Limit.High>>().toBe<5>();
expectTypeOf<UnionMin<Tagged<5, 'Limit'>>>().toBe<5>();
// @ts-expect-error Candidates must be numbers.
type UnknownMinimum = UnionMin<unknown>;

function _readGenericMinimum<Value extends number>(value: UnionMin<Value>): number {
	return value;
}

// Removing a losing infinity retains known finite enum and branded candidates.
expectTypeOf<UnionMin<Limit | PositiveInfinity>>().toBe<3>();
expectTypeOf<UnionMin<Tagged<2 | 4 | PositiveInfinity, 'Candidates'>>>().toBe<2>();
expectTypeOf<4>().not.toBeAssignableTo<UnionMin<2 | 4 | PositiveInfinity>>();

function _readMinimumWithInfinity<Candidates extends number>(value: UnionMin<Candidates | PositiveInfinity>): number {
	return value;
}

// The documented maximum stays within the recursion limit.
expectTypeOf<UnionMin<997 | 998>>().toBe<997>();
expectTypeOf<UnionMin<998 | PositiveInfinity>>().toBe<998>();

// The documented range ceiling stays within the recursion limit on its own too.
expectTypeOf<UnionMin<998>>().toBe<998>();

// @ts-expect-error Non-numeric unions are not supported.
type InvalidUnion = UnionMin<'1' | '2'>;

// Sparse and dense unions keep their exact minimum across different magnitudes.
expectTypeOf<UnionMin<1 | 900>>().toBe<1>();
expectTypeOf<UnionMin<0 | 900 | PositiveInfinity>>().toBe<0>();
expectTypeOf<UnionMin<900 | NegativeInfinity>>().toBe<NegativeInfinity>();
expectTypeOf<UnionMin<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9>>().toBe<0>();
expectTypeOf<2>().not.toBeAssignableTo<UnionMin<1 | 3 | 2>>();

// Counting upward stops at the first match, so a dense union costs no extra recursion.
type DenseCandidates = IntRange<0, 600>;
expectTypeOf<UnionMin<DenseCandidates>>().toBe<0>();
expectTypeOf<UnionMin<Exclude<DenseCandidates, 0>>>().toBe<1>();
expectTypeOf<UnionMin<DenseCandidates | PositiveInfinity>>().toBe<0>();
expectTypeOf<UnionMin<DenseCandidates | NegativeInfinity>>().toBe<NegativeInfinity>();
expectTypeOf<UnionMin<Tagged<IntRange<2, 100>, 'Limit'>>>().toBe<2>();

expectTypeOf<UnionMin<Opaque<3 | 5, 'Limit'>>>().toBe<3>();
expectTypeOf<UnionMin<Tagged<Tagged<3 | 5, 'Limit'>, 'Validated'>>>().toBe<3>();
expectTypeOf<UnionMin<(3 | 5) & {readonly __brand: unique symbol}>>().toBe<3>();

// The example from the documentation comment.
const pollIntervals = [30, 60, 300] as const;
expectTypeOf<UnionMin<typeof pollIntervals[number]>>().toBe<30>();

declare function fastestPollInterval<const Intervals extends readonly number[]>(intervals: Intervals): UnionMin<Intervals[number]>;
expectTypeOf(fastestPollInterval([7])).toBe<7>();
expectTypeOf(fastestPollInterval([60, 30, 300])).toBe<30>();
// @ts-expect-error A singleton minimum cannot be a different supported interval.
const wrongSingletonMinimum: UnionMin<7> = 6;
