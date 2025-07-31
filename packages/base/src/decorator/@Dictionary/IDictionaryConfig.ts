import type { EnumKey, IEnum } from '@omni-dev/enum'
import type { IBaseField } from '../common'

/**
 * # 字典配置
 */
export interface IDictionaryConfig<E extends IEnum<EnumKey> = IEnum<EnumKey>> extends IBaseField {
  /**
   * ### 字典列表
   */
  value?: E[]
}
