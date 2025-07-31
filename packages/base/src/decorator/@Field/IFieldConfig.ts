import type { EnumKey, IEnum } from '@omni-dev/enum'
import type { IBaseField } from '../common'

/**
 * # 字段配置
 */
export interface IFieldConfig<E extends IEnum<EnumKey> = IEnum<EnumKey>> extends IBaseField {
  /**
   * ### 字段标题
   */
  label?: string

  /**
   * ### 配置字典
   */
  dictionary?: E
}
