/* eslint-disable style/max-statements-per-line */
import type { TransformerTarget } from '@omni-dev/core'
import type { EnumKey, IEnum } from '@omni-dev/enum'
import type { RootModel } from '../../model'
import type { NonMethodKeys } from '../../types'
import type { IPayloadAction, IPayloadConfig } from './IPayloadConfig'
import { DecoratorUtil } from '@omni-dev/core'

/**
 * ### KEY
 */
const KEY = '[Payload]'

/**
 * ### 为属性标记负载配置
 * @param config 配置项
 */
export function Payload<
  M extends RootModel<E>,
  E extends IEnum<EnumKey> = IEnum<EnumKey>,
>(config?: IPayloadAction<M, E>) {
  return (instance: M, field: keyof M) => {
    if (!config) {
      config = function () { return this.instance[this.field] }
    }
    (config as any).key = field.toString()
    DecoratorUtil.setFieldConfig(instance, field, KEY, config)
  }
}

/**
 * ### 获取对象某个字段标记的负载配置项
 * @param target 目标类/实例
 * @param field 属性名
 */
export function getPayloadConfig<
  M extends RootModel<E>,
  E extends IEnum<EnumKey> = IEnum<EnumKey>,
  K extends Exclude<NonMethodKeys<M>, keyof RootModel> = Exclude<NonMethodKeys<M>, keyof RootModel>,
>(
  target: TransformerTarget<M>,
  field: K,
): IPayloadConfig<M, E, K> {
  return DecoratorUtil.getFieldConfig(target, field, KEY, false) || function () { return this.instance[this.field] }
}
