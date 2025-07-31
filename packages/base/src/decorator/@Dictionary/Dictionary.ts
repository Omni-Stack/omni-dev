import type { TransformerField, TransformerTarget } from '@omni-dev/core'
import type { EnumKey, IEnum } from '@omni-dev/enum'
import type { RootModel } from '../../model'
import type { IDictionaryConfig } from './IDictionaryConfig'
import { DecoratorUtil } from '@omni-dev/core'

/**
 * ### KEY
 */
const KEY = '[Dictionary]'

class DictionaryBuilder<
  GM extends RootModel<GE>,
  GE extends IEnum<EnumKey> = IEnum<EnumKey>,
> {
  private values: GE[] = []

  constructor(initialValue: GE | GE[]) {
    this.values.push(...Array.isArray(initialValue) ? initialValue : [initialValue])
  }

  add(value: GE | GE[]): this {
    this.values.push(...Array.isArray(value) ? value : [value])
    return this
  }

  $<
    M extends RootModel<GE> = GM,
    GE extends IEnum<EnumKey> = IEnum<EnumKey>,
  >() {
    return (instance: M, field: keyof M) => {
      DecoratorUtil.setFieldConfig(instance, field, KEY, { key: field.toString(), value: this.values })
    }
  }
}

/**
 * ### 字典
 * @param initial 初始值
 */
export function Dictionary<
  GM extends RootModel<GE>,
  GE extends IEnum<EnumKey> = IEnum<EnumKey>,
>(initial: GE | GE[]): DictionaryBuilder<GM, GE> {
  return new DictionaryBuilder<GM, GE>(initial)
}

/**
 * ### 获取字典配置
 * @param target 目标类/实例
 * @param field 属性名
 */
export function getDictionaryConfig<
  M extends RootModel<E>,
  E extends IEnum<EnumKey> = IEnum<EnumKey>,
>(
  target: TransformerTarget<M>,
  field: TransformerField<M>,
): IDictionaryConfig<E> {
  return DecoratorUtil.getFieldConfig(target, field, KEY, true) || {}
}
