import { Transformer } from '@omni-dev/core'

/**
 * ### 分页类
 */
export class QueryPage extends Transformer {
  /**
   * ### 分页页数
   */
  pageNum = 1

  /**
   * ### 每页数量
   */
  pageSize = 20
}
