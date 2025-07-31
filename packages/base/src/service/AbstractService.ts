import type { ITransformerConstructor } from '@omni-dev/core'
import type { Ref } from 'vue'
import type { IHttpConfig, IHttpErrorHandler } from '../http'
import { Transformer } from '@omni-dev/core'
import { path } from '@omni-dev/utils'
import { Http } from '../http'

export type IServiceConfig = {
  headers?: Record<string, unknown>
} & IHttpConfig

export type IServiceSetupConfig = IServiceConfig & {
  /**
   * ### 请求根地址
   * - 将会拼接在 `apiPrefix` 之前
   */
  baseUrl?: string
} & IHttpErrorHandler & IToastHandler

export interface IToastHandler {
  toastSuccess?: (message?: string) => void
  toastError?: (message?: string) => void
}

/**
 * ### `API` 服务超类
 */
export abstract class AbstractService extends Transformer {
  /**
   * ### `API` 根地址
   * 可选，用于绝对 `ip` 路径的请求
   */
  static baseUrl?: string

  /**
   * ### `API` 目录地址
   * 一般对应后端的 `分组/控制器/目录` 等
   */
  abstract baseUrl: string

  /**
   * ### 请求超时时间
   */
  static timeout?: number

  /**
   * ### 请求超时时间
   * @description 局部超时时间，优先级更高
   */
  timeout?: number

  /**
   * ### 接口根地址
   */
  static apiPrefix?: string

  /**
   * ### 接口根地址
   * @description 局部接口根地址，优先级更高
   */
  apiPrefix?: string

  setApiPrefix(apiPrefix?: string): this {
    this.apiPrefix = apiPrefix
    return this
  }

  /**
   * ### 是否直接抛出错误
   */
  private isThrowError = false

  /**
   * ### 是否直接抛出错误
   * @param isThrowError 是否回调错误
   */
  throwError(isThrowError = true): this {
    this.isThrowError = isThrowError
    return this
  }

  /**
   * ### 请求适配器
   */
  static adapter?: IHttpConfig['adapter']

  /**
   * ### 请求适配器
   * @description 局部适配器，优先级更高
   */
  adapter?: IHttpConfig['adapter']

  /**
   * ### 请求头
   */
  static headers?: Record<string, unknown>

  /**
   * ### 请求头
   * @description 局部请求头，优先级更高
   */
  headers?: Record<string, unknown>

  /**
   * ### 成功提示
   */
  static toastSuccess?: IToastHandler['toastSuccess']

  /**
   * ### 错误提示
   */
  static toastError?: IToastHandler['toastError']

  /**
   * ### 处理 API 错误
   */
  static errorHandler?: IHttpErrorHandler['errorHandler']

  /**
   * ### 处理 API 拒绝响应
   */
  static shouldRejectResponse?: IHttpErrorHandler['shouldRejectResponse']

  /**
   * ### `Loading`
   * 你可以将这个传入的对象绑定到你需要 `Loading` 的 `DOM` 上
   */
  loading!: Ref<boolean>

  static setup(config: IServiceSetupConfig) {
    // 定义安全的属性映射表，避免使用Object.assign可能破坏类结构
    const safePropertyMappings: Array<{
      configKey: keyof IServiceSetupConfig
      staticKey: keyof typeof AbstractService
    }> = [
      { configKey: 'timeout', staticKey: 'timeout' },
      { configKey: 'baseUrl', staticKey: 'baseUrl' },
      { configKey: 'apiPrefix', staticKey: 'apiPrefix' },
      { configKey: 'adapter', staticKey: 'adapter' },
      { configKey: 'headers', staticKey: 'headers' },
      { configKey: 'toastSuccess', staticKey: 'toastSuccess' },
      { configKey: 'toastError', staticKey: 'toastError' },
      { configKey: 'errorHandler', staticKey: 'errorHandler' },
      { configKey: 'shouldRejectResponse', staticKey: 'shouldRejectResponse' },
    ]

    // 安全地逐个赋值，避免Object.assign可能的副作用
    safePropertyMappings.forEach(({ configKey, staticKey }) => {
      if (config[configKey] !== undefined) {
        // 使用类型安全的属性赋值
        ;(this as any)[staticKey] = config[configKey]
      }
    })
  }

  /**
   * ### 静态创建一个 `API` 服务实例
   * @param loading `可选` Loading
   */
  static create<S extends AbstractService>(
    this: ITransformerConstructor<S>,
    loading?: Ref<boolean>,
    config?: IServiceConfig,
  ): S {
    const service = Object.assign(new this()) as S
    if (loading) {
      service.loading = loading
    }
    if (config?.timeout) {
      service.timeout = config.timeout
    }
    if (config?.apiPrefix) {
      service.apiPrefix = config.apiPrefix
    }
    if (config?.adapter) {
      service.adapter = config.adapter
    }
    if (config?.headers) {
      service.headers = config.headers
    }
    return service
  }

  /**
   * ### 创建一个 `HTTP` 实例
   * @param url 请求的接口地址
   * @param baseUrl `可选` 请求的接口目录
   */
  protected api(url: string, baseUrl?: string, rootUrl?: string): Http {
    // 拿到当前的 this 类（子类）
    const currentClass = this.constructor as typeof AbstractService
    baseUrl = baseUrl ?? this.baseUrl ?? ''
    rootUrl = rootUrl ?? currentClass.baseUrl ?? ''
    const apiPrefix = this.apiPrefix ?? currentClass.apiPrefix ?? ''

    return Http.create(
      path.joinPath(rootUrl, apiPrefix, baseUrl, url),
      {
        loadingHandler: (isLoading: boolean) => {
          if (this.loading) {
            this.loading.value = isLoading
          }
        },
        errorHandler: currentClass.errorHandler,
        shouldRejectResponse: currentClass.shouldRejectResponse,
      },
      this.headers ?? currentClass.headers,
      {
        timeout: this.timeout ?? currentClass.timeout,
        apiPrefix: '',
        adapter: this.adapter ?? currentClass.adapter,
      },
    ).throwError(this.isThrowError)
  }
}
