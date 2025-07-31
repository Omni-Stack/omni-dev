import type { EnumKey, IEnum } from '@omni-dev/enum'
import { Enum } from '@omni-dev/enum'

interface IBaseEnum<K extends EnumKey = number> extends IEnum<K> {
  /**
   * ### 标签
   */
  label?: string
  /**
   * ### 颜色
   */
  color?: string
}

export class BaseEnum<K extends EnumKey = number> extends Enum<K> implements IBaseEnum<K> {
  /**
   * ### 标签
   */
  readonly label?: string

  /**
   * ### 颜色
   */
  readonly color?: string

  constructor(key: K, label?: string, color?: string) {
    super(key)
    this.label = label
    this.color = color
  }
}
