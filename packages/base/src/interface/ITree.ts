import type { IEntity } from './IEntity'

/**
 * # 标准树结构
 */
export interface ITree<I extends number | string = number | string> extends IEntity<I> {
  /**
   * ### 树节点名称
   */
  name: string

  /**
   * ### 树的子节点
   * 为了成功的数据转换,请注意自行 `@Type`
   */
  children: this[]

  /**
   * ### 父节点 `ID`
   */
  parentId?: I
}
