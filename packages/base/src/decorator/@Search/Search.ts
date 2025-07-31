import type { TransformerField, TransformerTarget } from '@omni-dev/core'
import type { RootModel } from '../../model'
import type { FieldConfigOptionalKey } from '../@Field/type'
import type { ISearchField } from './ISearchField'
import { DecoratorUtil } from '@omni-dev/core'

/**
 * ### KEY
 */
const KEY = '[Search]'

/**
 * ### 标记该字段可用于表单配置
 * @param config 配置项
 */
export function Search<
  M extends RootModel,
>(
  config: FieldConfigOptionalKey<ISearchField> = {},
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
 * ### 获取对象某个字段标记的搜索配置项
 * @param target 目标类/实例
 * @param field 属性名
 */
export function getSearchConfig<
  M extends RootModel,
>(
  target: TransformerTarget<M>,
  field: TransformerField<M>,
): ISearchField {
  return DecoratorUtil.getFieldConfig(target, field, KEY, true) || {}
}

/**
 * ### 获取指定类的搜索字段配置项列表
 * @param Target 目标类/实例
 */
export function getSearchConfigList<
  M extends RootModel,
>(
  Target: TransformerTarget<M>,
): ISearchField[] {
  if (typeof Target !== 'object') {
    Target = new Target()
  }

  const fieldList = Object.keys(Target)
  const list = fieldList.map(field => getSearchConfig(Target, field)).filter(item => !!item.key)
  return list.filter(item => !item.hide)
    .sort((a, b) => (b.order || 0) - (a.order || 0))
}
