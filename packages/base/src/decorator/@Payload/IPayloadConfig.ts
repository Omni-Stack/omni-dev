import type { EnumKey, IEnum } from '@omni-dev/enum'
import type { RootModel } from '../../model'
import type { NonMethodKeys } from '../../types'
import type { IBaseField } from '../common'

/**
 * # 负载配置
 */
export type IPayloadConfig<
  M extends RootModel<E>,
  E extends IEnum<EnumKey> = IEnum<EnumKey>,
  K extends Exclude<NonMethodKeys<M>, keyof RootModel> = Exclude<NonMethodKeys<M>, keyof RootModel>,
> = IBaseField & IPayloadAction<M, E, K>

/**
 * # 负载操作
 */
export interface IPayloadAction<
  M extends RootModel<E>,
  E extends IEnum<EnumKey> = IEnum<EnumKey>,
  K extends Exclude<NonMethodKeys<M>, keyof RootModel> = Exclude<NonMethodKeys<M>, keyof RootModel>,
> {
  (this: { field: K, instance: M, value: M[K] }): any | M[K] // 负载的结果不必与原值类型相同
}
