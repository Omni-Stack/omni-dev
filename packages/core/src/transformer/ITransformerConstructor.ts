import type { Transformer } from './Transformer'

/**
 * # 类构造接口
 */
export interface ITransformerConstructor<T extends Transformer = Transformer> {
  new(): T
}

export type TransformerTarget<T extends Transformer = Transformer> = ITransformerConstructor<T> | T
