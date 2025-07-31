import type { TransformerField, TransformerTarget } from '@omni-dev/core'
import type { EnumKey, IEnum } from '@omni-dev/enum'
import type { RootModel } from '../../model'
import type { IFieldConfig } from './IFieldConfig'
import type { FieldConfigOptionalKey } from './type'
import { DecoratorUtil } from '@omni-dev/core'

/**
 * ### KEY
 */
const KEY = '[Field]'

/**
 * ### 为属性标记配置
 * @param config 配置项
 */
export function Field<
  M extends RootModel<E>,
  E extends IEnum<EnumKey> = IEnum<EnumKey>,
>(
  config: FieldConfigOptionalKey<IFieldConfig<E>> = {},
) {
  return (
    instance: M,
    field: keyof M,
  ) => {
    config.key = field.toString()
    DecoratorUtil.setFieldConfig(instance, field, KEY, config)
  }
}

/**
 * ### 获取属性的配置
 * @returns 配置对象
 * @param target 目标类/实例
 * @param field 属性名
 */
export function getFieldConfig<
  M extends RootModel<E>,
  E extends IEnum<EnumKey> = IEnum<EnumKey>,
>(
  target: TransformerTarget<M>,
  field: TransformerField<M>,
): IFieldConfig<E> {
  return DecoratorUtil.getFieldConfig(target, field.toString(), KEY, true) || {}
}

/**
 * ### 获取属性的枚举字典
 * @param target 目标类/实例
 * @param field 属性名
 */
export function getDictionary<
  M extends RootModel<E>,
  E extends IEnum<EnumKey> = IEnum<EnumKey>,
>(
  target: TransformerTarget<M>,
  field: TransformerField<M>,
): E | undefined {
  return getFieldConfig<M, E>(target, field)?.dictionary
}

/**
 * ### 获取属性的标题 - 如果没有配置标题，则返回属性名
 * @param target 目标类/实例
 * @param field 属性名
 */
export function getFieldLabel<
  M extends RootModel<E>,
  E extends IEnum<EnumKey> = IEnum<EnumKey>,
>(
  target: TransformerTarget<M>,
  field: TransformerField<M>,
): string {
  return getFieldConfig<M, E>(target, field)?.label || field.toString()
}
