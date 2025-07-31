import type { ITree } from './ITree'

/**
 * # 标准菜单结构
 */
export interface IMenu<I extends number | string = number | string> extends ITree<I> {
  /**
   * ### 菜单 `URL`
   */
  path: string

  /**
   * ### 菜单图标
   */
  icon: string

  /**
   * ### 菜单绑定组件路径
   */
  component: string

  /**
   * ### 菜单是否禁用
   */
  isDisabled: boolean
}
