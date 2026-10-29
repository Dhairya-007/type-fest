import type {Finite, NegativeInfinity, PositiveInfinity} from './numeric.d.ts';
import type {UnknownArray} from './unknown-array.d.ts';
import type {IsAnyOrNever} from './internal/type.d.ts';
import type {UnwrapBrand} from './internal/object.d.ts';
import type {UnionMax} from './union-max.d.ts'; // For `@link`

/**
Returns the minimum number in a union of numbers.

Use this to derive a minimum batch size or poll interval from a fixed set of supported values.

Supports small non-negative integer literals, plus `PositiveInfinity` and `NegativeInfinity`. Negative finite numbers and fractional numbers are not supported.

Returns `number`, `any`, or `never` when given those types.

@example
```
import type {UnionMin} from 'type-fest';

const batchSizes = [1, 5, 20] as const;
type SmallestBatch = UnionMin<typeof batchSizes[number]>;
//=> 1

const smallestBatch: SmallestBatch = 1;
```

@example
```
import type {NegativeInfinity, UnionMin} from 'type-fest';

type Unbounded = UnionMin<5 | 20 | NegativeInfinity>;
//=> -Infinity
```

The implementation counts upward using a tuple and stops at the first member it reaches, so the work is bounded by the minimum rather than by the largest member: `UnionMin<1 | 900>` takes a single step, while `UnionMin<900>` takes 900. A minimum above 998 therefore exceeds TypeScript's recursion limit, no matter how small the union is. Infinity and non-literal inputs are handled before counting.

See {@link UnionMax} for the maximum of a union.

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
					: InternalUnionMin<Finite<NumberUnion>>;

/**
The actual implementation of `UnionMin`. It's private because it has some arguments that don't need to be exposed.
*/
type InternalUnionMin<NumberUnion extends number, Counter extends UnknownArray = []> =
	Counter['length'] extends NumberUnion
		? Counter['length']
		: InternalUnionMin<NumberUnion, [...Counter, unknown]>;

export {};
