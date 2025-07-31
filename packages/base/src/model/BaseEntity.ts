import { RootEntity } from './RootEntity'

/**
 * # 数据库实体基类
 *
 * 继承于 实体超类（含 id）
 *
 * 该类下实现了 更新/创建-时间/人
 */
export class BaseEntity<I extends number | string = number> extends RootEntity<I> {
  /** 创建人 */
  createBy?: string
  /** 创建时间 | 订单时间 */
  createTime?: number
  /** 更新人 */
  updateBy?: string
  /** 更新时间 */
  updateTime?: number
}
