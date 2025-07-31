/**
 * ### 请求头KEY类型
 */
export type HttpHeaderKey = HttpHeader | string

/**
 * ### 请求头记录
 */
export type HttpHeaderRecord = Record<HttpHeaderKey, unknown>

/**
 * ### 状态码类型
 */
export type HttpStatusNumber = HttpStatus | number

// ------------------------------------------------------------

/**
 * ### 请求方法
 */
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}

/**
 * ### 常见请求头
 */
export enum HttpHeader {
  /**
   * ### 请求内容类型
   */
  CONTENT_TYPE = 'Content-Type',

  /**
   * ### 请求认证
   */
  AUTHORIZATION = 'Authorization',
}

/**
 * ### HTTP 状态码
 */
export enum HttpStatus {
  /**
   * ### 200 OK
   */
  OK = 200,

  /**
   * ### 400 Bad Request
   */
  BAD_REQUEST = 400,

  /**
   * ### 401 Unauthorized
   */
  UNAUTHORIZED = 401,

  /**
   * ### 403 Forbidden
   */
  FORBIDDEN = 403,

  /**
   * ### 404 Not Found
   */
  NOT_FOUND = 404,

  /**
   * ### 500 Internal Server Error
   */
  INTERNAL_SERVER_ERROR = 500,
}

/**
 * ### ContentType
 */
export enum HttpContentType {
  /**
   * ### JSON
   */
  JSON = 'application/json',

  /**
   * ### 表单
   */
  FORM_URLENCODED = 'application/x-www-form-urlencoded',

  /**
   * ### 文件上传
   */
  MULTIPART_FORM_DATA = 'multipart/form-data',

  /**
   * ### XML
   */
  XML = 'application/xml',

  /**
   * ### 纯文本
   */
  PLAIN = 'text/plain',
}
