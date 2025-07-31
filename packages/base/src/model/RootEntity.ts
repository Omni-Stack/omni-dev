import type { IEntity } from '../interface'
import { Field } from '../decorator'
import { RootModel } from './RootModel'

/**
 * # 根实体模型
 *
 * 只提供基础的 `id` 字段
 */
export class RootEntity<I extends number | string = number | string> extends RootModel implements Partial<IEntity<I>> {
  @Field({
    label: 'ID',
  })
  id?: I

  /**
   * ### 实例化一个实体
   * @param id `可选` 主键 `ID`
   */
  constructor(id?: I) {
    super()
    id && (this.id = id)
  }
}
