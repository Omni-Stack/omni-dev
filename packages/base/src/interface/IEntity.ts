/**
 * # 实体接口
 */
export interface IEntity<I extends number | string = number | string> {
  /**
   * ### 主键 `ID`
   */
  id: I
}
