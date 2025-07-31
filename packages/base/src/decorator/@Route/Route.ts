import type { TransformerField, TransformerTarget } from '@omni-dev/core'
import type { EnumKey, IEnum } from '@omni-dev/enum'
import type { RootModel } from '../../model'
import type { FieldConfigOptionalKey } from '../@Field'
import type { IRouteConfig } from './IRouteConfig'
import { DecoratorUtil } from '@omni-dev/core'

type RouteConfig = FieldConfigOptionalKey<IRouteConfig>

/**
 * ### KEY
 */
const KEY = '[Route]'

export function Route<M extends RootModel>(path?: string): (instance: M, field: keyof M) => void
export function Route<M extends RootModel>(config?: RouteConfig): (instance: M, field: keyof M) => void
/**
 * ### 为属性标记路由配置
 * @param config 配置项
 */
export function Route<M extends RootModel>(config: any = {}) {
  return (instance: M, field: keyof M) => {
    if (typeof config === 'string') {
      config = { path: config }
    }

    config.key = field.toString()
    DecoratorUtil.setFieldConfig(instance, field, KEY, config)
  }
}

/**
 * ### 获取对象某个字段标记的路由配置项
 * @param target 目标类/实例
 * @param field 属性名
 */
export function getRouteConfig<
  M extends RootModel<E>,
  E extends IEnum<EnumKey> = IEnum<EnumKey>,
>(
  target: TransformerTarget<M>,
  field: TransformerField<M>,
): IRouteConfig {
  return DecoratorUtil.getFieldConfig(target, field, KEY, true) || {}
}

/**
 * ### 获取路由路径
 * @param target 目标类/实例
 * @param field 属性名
 */
export function getRoutePath<
  M extends RootModel<E>,
  E extends IEnum<EnumKey> = IEnum<EnumKey>,
>(
  target: TransformerTarget<M>,
  field: TransformerField<M>,
) {
  return getRouteConfig<M, E>(target, field).path
}
