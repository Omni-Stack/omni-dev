/**
 * ### 装饰器存储的数据类型
 */
export type DecoratorData = any

/**
 * ### 装饰器的类属性
 */
export type TransformerField<T> = keyof T | string
