export type Primitives<T> = {
  [key in keyof Properties<T>]: ValueObjectValue<T[key]>;
};
type ValueObjectValue<T> = T extends PrimitiveTypes ? T : SimpleValueObject<T>;

type SimpleValueObject<T> = T extends { value: infer U } ? U : ArrayValueObject<T>;

type ArrayValueObject<T> =
  T extends Array<{ value: infer U }>
    ? U[]
    : T extends Array<infer U>
      ? Array<ValueObjectValue<U>>
      : NestedValueObject<T>;

type NestedValueObject<T> = T extends { [K in keyof Properties<T>]: infer U }
  ? { [K in keyof Properties<T>]: ValueObjectValue<Properties<T>[K]> }
  : never;

type Methods<T> = {
  [P in keyof T]: T[P] extends Function ? P : never;
}[keyof T];

type MethodsAndProperties<T> = { [key in keyof T]: T[key] };

type Properties<T> = Omit<MethodsAndProperties<T>, Methods<T>>;

type PrimitiveTypes = string | number | boolean | Date | undefined | null;
