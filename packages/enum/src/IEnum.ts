import type { EnumKey } from './type'

/**
 * # 标准枚举
 */
export interface IEnum<K extends EnumKey = number> {
  /**
   * ### 枚举值
   */
  key: K
}
