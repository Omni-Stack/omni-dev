import type { RootEntity } from '../model'

/**
 * # 标准的负载接口
 */
export interface IPayload extends RootEntity {
  /**
   * ### 获取负载显示的文本
   */
  getPayloadLabel: () => string
}
