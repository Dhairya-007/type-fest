import {expectTypeOf} from 'nz';
import type {IsEqual, NegativeInfinity, PositiveInfinity} from '../../index.d.ts';
import type {IsNumberLike, ReverseSign} from '../../source/internal/index.d.ts';

expectTypeOf<IsEqual<IsNumberLike<'1'>, true>>().toBe<true>();
expectTypeOf<IsEqual<IsNumberLike<'-1.1'>, true>>().toBe<true>();
expectTypeOf<IsEqual<IsNumberLike<'5e-20'>, true>>().toBe<true>();
expectTypeOf<IsEqual<IsNumberLike<1>, true>>().toBe<true>();
expectTypeOf<IsEqual<IsNumberLike<'a'>, false>>().toBe<true>();
expectTypeOf<IsEqual<IsNumberLike<''>, false>>().toBe<true>();
expectTypeOf<IsEqual<IsNumberLike<true>, false>>().toBe<true>();
expectTypeOf<IsEqual<IsNumberLike<any>, boolean>>().toBe<true>();
expectTypeOf<IsEqual<IsNumberLike<never>, false>>().toBe<true>();

// The result follows TypeScript's own notion of a numeric string, which is lenient about surrounding whitespace, a leading `+`, and a hexadecimal form.
expectTypeOf<IsEqual<IsNumberLike<' 1'>, true>>().toBe<true>();
expectTypeOf<IsEqual<IsNumberLike<'+1'>, true>>().toBe<true>();
expectTypeOf<IsEqual<IsNumberLike<'0x10'>, true>>().toBe<true>();
expectTypeOf<IsEqual<IsNumberLike<'1_0'>, false>>().toBe<true>();
expectTypeOf<IsEqual<IsNumberLike<'Infinity'>, false>>().toBe<true>();

expectTypeOf<IsEqual<ReverseSign<-1>, 1>>().toBe<true>();
expectTypeOf<IsEqual<ReverseSign<1>, -1>>().toBe<true>();
expectTypeOf<IsEqual<ReverseSign<0>, 0>>().toBe<true>();
expectTypeOf<IsEqual<ReverseSign<-0>, 0>>().toBe<true>();
expectTypeOf<IsEqual<ReverseSign<NegativeInfinity>, PositiveInfinity>>().toBe<true>();
expectTypeOf<IsEqual<ReverseSign<PositiveInfinity>, NegativeInfinity>>().toBe<true>();
expectTypeOf<IsEqual<ReverseSign<-1.5>, 1.5>>().toBe<true>();
expectTypeOf<ReverseSign<number>>().toBe<number>();

// `IsEqual` does not see through a nested application, so this one is asserted on the result directly rather than through `IsEqual`.
expectTypeOf<ReverseSign<ReverseSign<-42>>>().toBe<-42>();

// Enum members have known signs even though `number` is assignable to them.
enum Offset {
	Positive = 3,
	Negative = -3,
}
expectTypeOf<ReverseSign<Offset.Positive>>().toBe<-3>();
expectTypeOf<ReverseSign<Offset.Negative>>().toBe<3>();
