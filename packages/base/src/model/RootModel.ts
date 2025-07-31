import type { EnumKey, IEnum } from '@omni-dev/enum'
import type { IDictionaryConfig, IFieldConfig, IPayloadConfig, IRouteConfig } from '../decorator'
import type { NonMethodKeys, SafeReturnType } from '../types'
import { Transformer } from '@omni-dev/core'
import {
  getDictionary,
  getDictionaryConfig,
  getFieldConfig,
  getFieldLabel,
  getModelConfig,
  getModelName,
  getPayloadConfig,
  getRouteConfig,
  getRoutePath,
} from '../decorator'

/**
 * ### 基础模型
 */
export class RootModel<GE extends IEnum<EnumKey> = IEnum<EnumKey>> extends Transformer {
  getModelConfig(this: this) {
    return getModelConfig(this)
  }

  getModelName(this: this) {
    return getModelName(this)
  }

  getFieldConfig<M extends RootModel<E> = this, E extends IEnum<EnumKey> = GE>(this: M, field: Exclude<NonMethodKeys<M>, keyof RootModel>): IFieldConfig<E>
  getFieldConfig<M extends RootModel<E> = this, E extends IEnum<EnumKey> = GE>(this: M, field: string): IFieldConfig<E>
  getFieldConfig(field: any) {
    return getFieldConfig(this, field)
  }

  getDictionary<M extends RootModel<E> = this, E extends IEnum<EnumKey> = GE>(this: M, field: Exclude<NonMethodKeys<M>, keyof RootModel>): E | undefined
  getDictionary<M extends RootModel<E> = this, E extends IEnum<EnumKey> = GE>(this: M, field: string): E | undefined
  getDictionary(field: any) {
    return getDictionary(this, field)
  }

  getFieldLabel<M extends RootModel<E> = this, E extends IEnum<EnumKey> = GE>(this: M, field: Exclude<NonMethodKeys<M>, keyof RootModel>): string
  getFieldLabel<M extends RootModel<E> = this, E extends IEnum<EnumKey> = GE>(this: M, field: string): string
  getFieldLabel(field: any) {
    return getFieldLabel(this, field)
  }

  getRouteConfig<M extends RootModel<E> = this, E extends IEnum<EnumKey> = GE>(this: M, field: Exclude<NonMethodKeys<M>, keyof RootModel>): IRouteConfig
  getRouteConfig<M extends RootModel<E> = this, E extends IEnum<EnumKey> = GE>(this: M, field: string): IRouteConfig
  getRouteConfig(field: any) {
    return getRouteConfig(this, field)
  }

  getRoutePath<M extends RootModel<E> = this, E extends IEnum<EnumKey> = GE>(this: M, field: Exclude<NonMethodKeys<M>, keyof RootModel>): string | undefined
  getRoutePath<M extends RootModel<E> = this, E extends IEnum<EnumKey> = GE>(this: M, field: string): string | undefined
  getRoutePath(field: any) {
    return getRoutePath(this, field)
  }

  getPayload<M extends RootModel<E> = this, E extends IEnum<EnumKey> = GE, K extends Exclude<NonMethodKeys<M>, keyof RootModel> = Exclude<NonMethodKeys<M>, keyof RootModel>>(this: M, field: K): SafeReturnType<IPayloadConfig<M, E, K>> | undefined
  getPayload<M extends RootModel<E> = this, E extends IEnum<EnumKey> = GE, K extends Exclude<NonMethodKeys<M>, keyof RootModel> = Exclude<NonMethodKeys<M>, keyof RootModel>>(this: M, field: string): SafeReturnType<IPayloadConfig<M, E, K>> | undefined
  getPayload(field: any) {
    const config = getPayloadConfig(this, field)
    const value = (this as any)[field]
    return typeof config === 'function' ? config?.call({ field, instance: this, value }) ?? value : value
  }

  getDictionaryConfig<M extends RootModel<E> = this, E extends IEnum<EnumKey> = IEnum<EnumKey>>(this: M, field: Exclude<NonMethodKeys<M>, keyof RootModel>): IDictionaryConfig<E>
  getDictionaryConfig<M extends RootModel<E> = this, E extends IEnum<EnumKey> = IEnum<EnumKey>>(this: M, field: string): IDictionaryConfig<E>
  getDictionaryConfig(field: any) {
    return getDictionaryConfig(this, field)
  }

  toArray<M extends RootModel<E> = this, E extends IEnum<EnumKey> = GE>(this: M) {
    const fieldList = Object.keys(this).filter(key => typeof (this as any)[key] !== 'function')

    return fieldList.map((field) => {
      return {
        key: this.getFieldConfig(field).key,
        label: this.getFieldLabel(field),
        value: (this as any)[field] as M[Exclude<NonMethodKeys<M>, keyof RootModel>] | undefined,
        payload: this.getPayload(field),
        route: this.getRouteConfig(field),
        dictionary: this.getDictionary(field),
        dictionarys: this.getDictionaryConfig(field).value,
        detail: undefined as string | undefined,
      }
    })
  }
}
