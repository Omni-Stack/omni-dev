import type { TransformerTarget } from '@omni-dev/core'
import type { RootModel } from '../../model'
import type { IModelConfig } from './IModelConfig'
import { DecoratorUtil } from '@omni-dev/core'

const KEY = '[MODEL]'

/**
 * ### 为模型类标记配置项
 * @param config 配置项
 */
export function Model<
  M extends RootModel,
  T extends IModelConfig = IModelConfig,
>(
  config: T = {} as T,
) {
  return (Class: TransformerTarget<M>) => DecoratorUtil.setClassConfig(Class, KEY, config)
}

/**
 * ### 获取模型类配置项
 * @param target 目标类/实例
 */
export function getModelConfig<
  M extends RootModel,
  T extends IModelConfig = IModelConfig,
>(
  target: TransformerTarget<M>,
): T {
  return DecoratorUtil.getClassConfig(target, KEY, true) || {} as T
}

/**
 * ### 获取模型类名称
 * @param target 目标类/实例
 */
export function getModelName<
  M extends RootModel,
>(
  target: TransformerTarget<M>,
): string {
  if (typeof target !== 'object') {
    target = target.prototype
  }

  return getModelConfig(target).label || target.constructor.name
}
