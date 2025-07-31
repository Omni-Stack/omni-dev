import type { SortType } from './type'
import { Transformer } from '@omni-dev/core'

/**
 * ### 排序类
 *
 * 用于构建查询请求中的排序信息
 */
export class QuerySort extends Transformer {
  /**
   * ### 排序字段 默认 `id`
   */
  field = 'id'

  /**
   * ### 排序方式 默认 `desc`
   */
  direction: SortType = 'desc'

  /**
   * ### 设置排序字段名
   * @param field 字段名
   */
  setField(field: string): this {
    this.field = field
    return this
  }

  /**
   * ### 设置排序方向
   * @param direction 方向
   */
  setDirection(direction: SortType): this {
    this.direction = direction
    return this
  }
}
