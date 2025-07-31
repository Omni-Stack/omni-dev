import type { EnumKey, IEnum } from '@omni-dev/enum'
import type { SetOptional } from '../../types'
import type { IFieldConfig } from './IFieldConfig'

/**
 * # 字段配置 `Key` 变为可选
 *
 * config 的 key 不是外来传递的
 *
 * 装饰器内部会自动将当前的字段名称设置为 config 上的 key
 *
 * 所以即使 config 中传递了 key，也不会生效
 */
export type FieldConfigOptionalKey<T extends IFieldConfig<E>, E extends IEnum<EnumKey> = IEnum<EnumKey>> = SetOptional<T, 'key'>
