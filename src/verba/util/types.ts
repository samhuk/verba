export type MutableRef<T extends any = any> = {
  current: T
}

/**
 * For creating types like:
 *
 * @example
 * enum Type { STRING, NUMBER }
 * type Map = {
 *   [Type.STRING]: { upperCase: string },
 *   [Type.NUMBER]: { isInteger: boolean },
 * }
 * type Field<T extends Type> = TypeDependantBaseIntersection<Type, Map, T, "dataType">
 * const field1: Field = {
 *   dataType: Type.STRING,
 *   upperCase: false
 * }
 */
export type TypeDependantBaseIntersection<
  TType extends string|number,
  TMap extends { [k in TType]: any },
  TSpecificEnumType extends string|number = TType,
  TTypePropertyName extends string = 'type',
> = {
  [K in TType]: { [k in TTypePropertyName]: K } & TMap[K]
}[TType] & { [k in TTypePropertyName]: TSpecificEnumType }
