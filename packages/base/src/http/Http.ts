import type { IJson, ITransformerConstructor } from '@omni-dev/core'
import type { AxiosError, AxiosRequestConfig } from 'axios'
import type { HttpHeaderRecord } from './type'
import { Transformer } from '@omni-dev/core'
import axios from 'axios'
import { HttpResponse } from './HttpResponse'
import { HttpContentType, HttpHeader, HttpMethod, HttpStatus } from './type'

export interface IHttpConfig {
  /**
   * ### 请求超时时间
   */
  timeout?: number
  /**
   * ### 接口根地址
   * 以 `/` 结尾
   */
  apiPrefix?: string
  /**
   * ### axios 请求适配器
   */
  adapter?: AxiosRequestConfig['adapter']
}

export interface IHttpErrorResponse {
  code: number | number
  message: string
}

export interface IHttpErrorHandler {
  errorHandler?: (error: IHttpErrorResponse) => void
  shouldRejectResponse?: (response: IHttpErrorResponse) => boolean | undefined
}

export interface IHttpHandler extends IHttpErrorHandler {
  loadingHandler?: (loading: boolean) => void
}

/**
 * ### 网络请求类
 */
export class Http {
  /**
   * ### 配置
   */
  private config!: IHttpConfig

  /**
   * ### 请求方法
   */
  private method = HttpMethod.POST

  /**
   * ### URL
   */
  private url = ''

  /**
   * ### 是否携带 `Cookies`
   */
  private widthCookie = false

  /**
   * ### 请求头
   */
  private headers: HttpHeaderRecord = {}

  /**
   * ### 拒绝响应处理
   * @description 如果返回 `true` 则 `reject` 响应
   * @param response 响应
   * @returns 是否拒绝
   */
  private shouldRejectResponse?: IHttpHandler['shouldRejectResponse']

  /**
   * ### 错误回调
   */
  private errorHandler?: IHttpHandler['errorHandler']

  /**
   * ### 加载回调
   */
  private loadingHandler?: IHttpHandler['loadingHandler']

  /**
   * ### 是否直接抛出错误
   */
  private isThrowError = false

  /**
   * ### 创建一个客户端
   * @param url 请求地址
   * @param handlers 监听器
   * @param handlers.error 错误
   * @param handlers.loading 加载
   * @param handlers.rejectResponse 拒绝响应
   * @param headers 请求头
   * @param config 配置
   */
  static create(
    url: string,
    handlers: IHttpHandler = {},
    headers: Record<HttpHeader | string, unknown> = {},
    config: IHttpConfig = { timeout: 10000, apiPrefix: '' },
  ): Http {
    const http = new Http()
    http.config = config

    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) {
      http.url = url
    }
    else {
      http.url = http.config.apiPrefix + url
    }

    http.headers[HttpHeader.CONTENT_TYPE] = HttpContentType.JSON
    Object.entries(headers).forEach(([key, value]) => {
      if (value) {
        /**
         * 特殊结构的方法
         * (() => any) & { value: string }
         * 否则使用 key 作为请求头的键
         */
        if (typeof value === 'function') {
          if ('value' in value && typeof value.value === 'string') {
            key = value.value
          }
          value = value()
        }
        http.addHttpHeader(key, value)
      }
    })
    http.errorHandler = handlers.errorHandler
    http.loadingHandler = handlers.loadingHandler
    http.shouldRejectResponse = handlers.shouldRejectResponse
    return http
  }

  /**
   * ### 设置请求超时时间
   * @param timeout 超时毫秒数
   */
  setTimeout(timeout: number) {
    this.config.timeout = timeout
    return this
  }

  /**
   * ### 设置请求适配器
   * @param adapter 请求适配器
   */
  setAdapter(adapter: IHttpConfig['adapter']): this {
    this.config.adapter = adapter
    return this
  }

  /**
   * ### 允许携带 `Cookies`
   */
  withCredentials(): this {
    this.widthCookie = true
    return this
  }

  /**
   * ### 设置请求头
   * @param header 请求头
   */
  setHttpHeader(header: Record<HttpHeader | string, unknown>): this {
    this.headers = header
    return this
  }

  /**
   * ### 添加一个请求头
   * @param key 请求头 `key`
   * @param value 请求头 `value`
   */
  addHttpHeader(key: HttpHeader | string, value: unknown): this {
    this.headers[key] = value
    return this
  }

  /**
   * ### 设置请求方法
   * @param method 请求方法
   */
  setMethod(method: HttpMethod): this {
    this.method = method
    return this
  }

  /**
   * ### 设置请求`content-shared`
   * @param contentType `content-shared`
   */
  setContentType(contentType: HttpContentType): this {
    return this.addHttpHeader(HttpHeader.CONTENT_TYPE, contentType)
  }

  /**
   * ### 发送请求并获取转换后的模型
   * @param postData 请求的数据
   * @param parseClass 返回的模型
   */
  async post<REQ extends Transformer, RES extends Transformer>(
    postData: REQ | REQ[] | undefined,
    parseClass: ITransformerConstructor<RES>,
  ): Promise<RES> {
    const result = await this.request(postData)
    return Transformer.parse(result, parseClass)
  }

  /**
   * ### 发送请求并获取转换后的模型数组
   * @param postData 请求的数据
   * @param parseClass 返回的模型数组
   */
  async postArray<REQ extends Transformer, RES extends Transformer>(
    postData: REQ | REQ[] | undefined,
    parseClass: ITransformerConstructor<RES>,
  ): Promise<RES[]> {
    const result = await this.request(postData)
    return (result as IJson[]).map(item => Transformer.parse(item, parseClass))
  }

  /**
   * ### 是否直接抛出错误
   * @param isThrowError 是否回调错误
   */
  throwError(isThrowError = true): this {
    this.isThrowError = isThrowError
    return this
  }

  /**
   * ### POST 发送模型/模型数组并
   * @param postData 发送的数据模型(数组)
   */
  async request<T extends Transformer>(postData?: T | T[]): Promise<IJson | IJson[]> {
    let body = {}
    if (postData) {
      if (Array.isArray(postData)) {
        body = postData.map(item => item.toJson())
      }
      else {
        body = postData.toJson()
      }
    }
    this.setMethod(HttpMethod.POST)
    return new Promise((resolve, reject) => {
      if (this.loadingHandler) {
        this.loadingHandler(true)
      }
      this.send(body).then((response) => {
        if (this.shouldRejectResponse?.(response)) {
          if (this.isThrowError || !this.errorHandler) {
            reject(response)
            return
          }
          this.errorHandler(response)
          return
        }
        resolve(response.data as any)
      }).catch((e) => {
        const error = new HttpResponse()
        error.message = e.message
        error.code = HttpStatus.INTERNAL_SERVER_ERROR
        if (this.isThrowError || !this.errorHandler) {
          reject(error)
          return
        }
        this.errorHandler(error)
      }).finally(() => {
        if (this.loadingHandler) {
          this.loadingHandler(false)
        }
      })
    })
  }

  /**
   * ### 发送请求
   *
   * @param body `可选` 请求体
   * @see request() 直接发送 `POST`
   * @see get() 直接发送 `GET`
   */
  private async send(body?: unknown): Promise<HttpResponse> {
    const axiosConfig: AxiosRequestConfig = {}
    axiosConfig.url = this.url
    axiosConfig.headers = this.headers as IJson
    axiosConfig.timeout = this.config.timeout
    axiosConfig.method = this.method
    axiosConfig.data = body
    axiosConfig.withCredentials = this.widthCookie
    axiosConfig.adapter = this.config.adapter
    const response = new HttpResponse()
    try {
      const res = await axios.request(axiosConfig)
      if (res.status !== HttpStatus.OK) {
        response.code = res.status
        response.message = res.statusText
        response.data = res
        return response
      }
      response.code = res.data.code
      response.message = res.data.message
      response.error_detail = res.data.error_detail
      response.data = res.data.data
      return response
    }
    catch (e) {
      const error = e as AxiosError
      response.code = error.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR
      response.message = error.message
      response.data = error.response?.data || error.response || error
      return response
    }
  }
}
