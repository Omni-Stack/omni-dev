/**
 * ### Http请求的响应
 */
export class HttpResponse {
  /**
   * ### 业务状态码
   */
  code!: number

  /**
   * ### 返回的数据
   */
  data!: unknown

  /**
   * ### 错误信息
   */
  message!: string

  /**
   * ### 错误详情
   */
  error_detail?: string
}
