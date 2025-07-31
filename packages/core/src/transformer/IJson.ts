/**
 * # 标准的 `JSON` 数据
 */
export interface IJson<V = any> {
  /**
   * ### `JSON` 的键
   */
  [x: string]: V
}
