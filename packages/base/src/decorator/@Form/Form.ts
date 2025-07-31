import type { TransformerField, TransformerTarget } from '@omni-dev/core'
import type { RootModel } from '../../model'
import type { FieldConfigOptionalKey } from '../@Field/type'
import type { IFormField } from './IFormField'
import { DecoratorUtil } from '@omni-dev/core'

/**
 * ### KEY
 */
const KEY = '[Form]'

/**
 * ### 标记该字段可用于表单配置
 * @param config 配置项
 */
export function Form<
  M extends RootModel,
>(
  config: FieldConfigOptionalKey<IFormField> = {},
) {
  return (
    instance: M,
    key: keyof M,
  ) => {
    config.key = key.toString()
    DecoratorUtil.setFieldConfig(instance, key, KEY, config)
  }
}

/**
 * ### 获取对象某个字段标记的表单配置项
 * @param target 目标类/实例
 * @param field 属性名
 */
export function getFormConfig<
  M extends RootModel,
>(
  target: TransformerTarget<M>,
  field: TransformerField<M>,
): IFormField {
  return DecoratorUtil.getFieldConfig(target, field.toString(), KEY, true) || {}
}

/**
 * ### 获取指定类的表单字段配置项列表
 * @param Target 目标类/实例
 */
export function getFormConfigList<
  M extends RootModel,
>(
  Target: TransformerTarget<M>,
): IFormField[] {
  if (typeof Target !== 'object') {
    Target = new Target()
  }

  const fieldList = Object.keys(Target)
  const list = fieldList.map(field => getFormConfig(Target, field)).filter(item => !!item.key)
  return list.filter(item => !item.hide)
    .sort((a, b) => (b.order || 0) - (a.order || 0))
}
