import type { IEnum } from './IEnum'
import type { EnumKey } from './type'

/**
 * ### 枚举类构造器
 */
export type EnumClassConstructor<K extends EnumKey = number, E extends Enum<K> = Enum<K>> = {
  new (key: K): E
} & typeof Enum<K>

/**
 * # 枚举基类
 */
export class Enum<K extends EnumKey = number> implements IEnum<K> {
  readonly key: K

  /**
   * ### 实例化创建一个枚举项目
   */
  constructor(key: K) { this.key = key }

  /**
   * ### 创建一个枚举
   * @param key `Key`
   */
  static key<K extends EnumKey = number, E extends Enum<K> = Enum<K>>(this: EnumClassConstructor<K, E>, key: K) {
    return new this(key)
  }

  /**
   * ### 查找一个枚举选项
   * @param key `Key`
   */
  static get<K extends EnumKey = number, E extends Enum<K> = Enum<K>>(this: EnumClassConstructor<K, E>, key: K): E | null {
    return this.toArray().find(item => item.key === key) || null
  }

  /**
   * ### 将枚举转为数组
   * @returns 枚举数组
   */
  static toArray<K extends EnumKey = number, E extends Enum<K> = Enum<K>>(this: EnumClassConstructor<K, E>): E[] {
    return Object.values(this).filter((item): item is E => item instanceof this)
  }

  /**
   * ### 判断 `Key` 是否相等
   * @param key `Key`
   */
  equalsKey(key: K): boolean
  equalsKey(key: EnumKey): boolean
  equalsKey(key: K | EnumKey): boolean {
    return this.key === key
  }
}
