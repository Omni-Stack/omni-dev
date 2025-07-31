import type { RootEntity } from '../RootEntity'
import { Type } from '@omni-dev/core'
import { QueryPage } from './QueryPage'
import { QueryRequest } from './QueryRequest'

/**
 * ### 请求分页类
 */
export class QueryRequestPage<E extends RootEntity> extends QueryRequest<E> {
  /**
   * ### 分页信息
   */
  @Type(QueryPage)
  page = new QueryPage()
}
