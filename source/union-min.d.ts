import type {NegativeInfinity, PositiveInfinity} from './numeric.d.ts';
import type {UnknownArray} from './unknown-array.d.ts';
import type {IsAnyOrNever} from './internal/type.d.ts';
import type {UnwrapBrand} from './internal/object.d.ts';
import type {IsUnion} from './is-union.d.ts';
import type {StringToNumber} from './string-to-number.d.ts';

/**
Returns the minimum number in a union of numbers.

Use this to derive a lower bound, such as a minimum poll interval or the smallest supported page size, from a fixed set of allowed values.

Supports small non-negative integer literals, plus `PositiveInfinity` and `NegativeInfinity`. Negative finite numbers and fractional numbers are not supported. Large integers or unions can exceed TypeScript’s recursion limit.

Returns `number`, `any`, or `never` when given those types.

@example
```
import type {UnionMin} from 'type-fest';

const pollIntervals = [30, 60, 300] as const;
type FastestPoll = UnionMin<typeof pollIntervals[number]>;
//=> 30

const fastestPoll: FastestPoll = 30;
```

@example
```
import type {NegativeInfinity, UnionMin} from 'type-fest';

type Unbounded = UnionMin<1 | 5 | NegativeInfinity>;
//=> -Infinity
```

The implementation counts upward using a tuple and stops at the first union member it matches, which is the minimum. Infinity, non-literal inputs, and a single known value are handled before counting.

@see {@link UnionMax}
@see https://github.com/sindresorhus/type-fest/issues/676
@category Numeric
*/
export type UnionMin<NumberUnion extends number> =
	UnionMinImplementation<NumberUnion extends object ? UnwrapBrand<NumberUnion> : NumberUnion>;

// Normalize the candidates once so the counter can match branded values.
type UnionMinImplementation<NumberUnion extends number> =
	IsAnyOrNever<NumberUnion> extends true ? NumberUnion
		: `${number}` extends `${NumberUnion}` ? number
			: NegativeInfinity extends NumberUnion ? NegativeInfinity
				: [NumberUnion] extends [PositiveInfinity] ? PositiveInfinity
					// A single candidate is already the minimum. Read its printed value so enum members still produce plain numbers.
					: IsUnion<NumberUnion> extends false
						? StringToNumber<`${NumberUnion}`>
						// Broad inputs and the winning infinity are already handled; only the losing infinity needs removal.
						: InternalUnionMin<Exclude<NumberUnion, PositiveInfinity>>;

/**
The actual implementation of `UnionMin`. Counting upward means the first member the counter matches is already the smallest, so no member ever needs to be removed.
*/
type InternalUnionMin<NumberUnion extends number, Counter extends UnknownArray = []> =
	Counter['length'] extends NumberUnion
		? Counter['length']
		: InternalUnionMin<NumberUnion, [...Counter, unknown]>;

export {};
