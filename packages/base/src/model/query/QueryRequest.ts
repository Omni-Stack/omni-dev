import type { ITransformerConstructor } from '@omni-dev/core'
import type { RootEntity } from '../RootEntity'
import { Transformer, Type } from '@omni-dev/core'
import { QuerySort } from './QuerySort'

/**
 * ### 请求类
 */
export class QueryRequest<E extends RootEntity = RootEntity> extends Transformer {
  /**
   * ### 查询信息
   */
  filter!: E

  /**
   * ### 排序信息
   */
  @Type(QuerySort)
  sort?: QuerySort

  /**
   * ### 初始化一个请求类
   * @param FilterClass 如传入 `filter` 的类 将自动初始化一个空 `filter`
   */
  constructor(FilterClass: ITransformerConstructor<E>) {
    super()
    try {
      this.filter = new FilterClass()
    }
    catch (e) {}
  }

  /**
   * ### 设置排序对象
   * @param sort 排序对象
   */
  setSort(sort: QuerySort): this {
    this.sort = sort
    return this
  }
}
