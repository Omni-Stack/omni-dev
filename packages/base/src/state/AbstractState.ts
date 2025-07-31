import type { AdapterReturnType, IAsyncCacheAdapter, ICacheAdapter, ISyncCacheAdapter } from './ICacheAdapter'

/**
 * ### 状态配置接口
 */
export interface IStateConfig<T extends ICacheAdapter = ICacheAdapter> {
  /**
   * ### 缓存适配器
   */
  adapter?: T
  /**
   * ### 状态前缀
   */
  prefix?: string
  /**
   * ### 默认TTL（毫秒）
   */
  defaultTTL?: number
}

/**
 * ### Handler函数类型
 */
export type StateHandler<T = any> = () => T | Promise<T>

/**
 * ### 抽象状态管理基类
 * @description 根据适配器类型自动推导同步/异步操作
 */
export abstract class AbstractState<T extends ICacheAdapter = ICacheAdapter> {
  /**
   * ### 全局缓存适配器
   */
  static adapter?: ICacheAdapter

  /**
   * ### 全局状态前缀
   */
  static prefix?: string

  /**
   * ### 全局默认TTL
   */
  static defaultTTL?: number

  /**
   * ### 实例级缓存适配器
   */
  adapter?: T

  /**
   * ### 实例级状态前缀
   */
  prefix?: string

  /**
   * ### 实例级默认TTL
   */
  defaultTTL?: number

  /**
   * ### Handler映射表
   */
  private handlers = new Map<string, StateHandler>()

  /**
   * ### 全局配置方法
   */
  static setup<A extends ICacheAdapter>(config: IStateConfig<A>): void {
    if (config.adapter !== undefined) {
      this.adapter = config.adapter
    }
    if (config.prefix !== undefined) {
      this.prefix = config.prefix
    }
    if (config.defaultTTL !== undefined) {
      this.defaultTTL = config.defaultTTL
    }
  }

  /**
   * ### 静态创建状态实例
   */
  static create<S extends AbstractState<A>, A extends ICacheAdapter>(
    this: new () => S,
    config?: IStateConfig<A>,
  ): S {
    const instance = new this()
    if (config?.adapter) {
      instance.adapter = config.adapter
    }
    if (config?.prefix) {
      instance.prefix = config.prefix
    }
    if (config?.defaultTTL) {
      instance.defaultTTL = config.defaultTTL
    }
    return instance
  }

  /**
   * ### 获取有效的缓存适配器
   */
  protected getAdapter(): T {
    const adapter = this.adapter ?? (this.constructor as typeof AbstractState).adapter
    if (!adapter) {
      throw new Error('No cache adapter configured. Please call setup() or provide adapter in create()')
    }
    return adapter as T
  }

  /**
   * ### 获取有效的前缀
   */
  protected getPrefix(): string {
    return this.prefix ?? (this.constructor as typeof AbstractState).prefix ?? ''
  }

  /**
   * ### 获取有效的TTL
   */
  protected getTTL(): number | undefined {
    return this.defaultTTL ?? (this.constructor as typeof AbstractState).defaultTTL
  }

  /**
   * ### 生成完整的状态键
   */
  protected getStateKey(key: string): string {
    const prefix = this.getPrefix()
    return prefix ? `${prefix}${key}` : key
  }

  /**
   * ### 设置状态Handler
   */
  protected setHandler<R>(key: string, handler: StateHandler<R>): this {
    this.handlers.set(key, handler)
    return this
  }

  /**
   * ### 获取状态Handler
   */
  protected getHandler<R>(key: string): StateHandler<R> | undefined {
    return this.handlers.get(key) as StateHandler<R> | undefined
  }

  /**
   * ### 获取状态值（根据适配器类型自动推导同步/异步）
   */
  get<R>(key: string, defaultValue?: R): AdapterReturnType<T, R | null> {
    try {
      const adapter = this.getAdapter()
      const stateKey = this.getStateKey(key)

      // 检查是否有Handler
      const handler = this.getHandler<R>(key)

      if (this.isSyncAdapter(adapter)) {
        // 同步操作
        if (handler) {
          const handlerResult = handler()
          if (handlerResult instanceof Promise) {
            throw new TypeError(`Handler for ${key} returns Promise but adapter is synchronous`)
          }
          if (handlerResult !== undefined && handlerResult !== null) {
            return handlerResult as AdapterReturnType<T, R | null>
          }
        }

        const value = adapter.get<R>(stateKey)
        return (value ?? defaultValue ?? null) as AdapterReturnType<T, R | null>
      }
      else {
        // 异步操作
        return (async () => {
          if (handler) {
            const handlerResult = await handler()
            if (handlerResult !== undefined && handlerResult !== null) {
              return handlerResult
            }
          }

          const value = await (adapter as IAsyncCacheAdapter).get<R>(stateKey)
          return value ?? defaultValue ?? null
        })() as AdapterReturnType<T, R | null>
      }
    }
    catch (error) {
      console.error(`[AbstractState] Failed to get state ${key}:`, error)
      if (this.isSyncAdapter(this.getAdapter())) {
        return (defaultValue ?? null) as AdapterReturnType<T, R | null>
      }
      else {
        return Promise.resolve(defaultValue ?? null) as AdapterReturnType<T, R | null>
      }
    }
  }

  /**
   * ### 设置状态值（根据适配器类型自动推导同步/异步）
   */
  set<R>(key: string, value: R, ttl?: number): AdapterReturnType<T, this> {
    try {
      const adapter = this.getAdapter()
      const stateKey = this.getStateKey(key)
      const effectiveTTL = ttl ?? this.getTTL()

      if (this.isSyncAdapter(adapter)) {
        // 同步操作
        adapter.set(stateKey, value, effectiveTTL)
        return this as AdapterReturnType<T, this>
      }
      else {
        // 异步操作
        return (async () => {
          await (adapter as IAsyncCacheAdapter).set(stateKey, value, effectiveTTL)
          return this
        })() as unknown as AdapterReturnType<T, this>
      }
    }
    catch (error) {
      console.error(`[AbstractState] Failed to set state ${key}:`, error)
      if (this.isSyncAdapter(this.getAdapter())) {
        return this as AdapterReturnType<T, this>
      }
      else {
        return Promise.resolve(this) as unknown as AdapterReturnType<T, this>
      }
    }
  }

  /**
   * ### 删除状态（根据适配器类型自动推导同步/异步）
   */
  remove(key: string): AdapterReturnType<T, this> {
    try {
      const adapter = this.getAdapter()
      const stateKey = this.getStateKey(key)

      if (this.isSyncAdapter(adapter)) {
        // 同步操作
        adapter.remove(stateKey)
        this.handlers.delete(key)
        return this as AdapterReturnType<T, this>
      }
      else {
        // 异步操作
        return (async () => {
          await (adapter as IAsyncCacheAdapter).remove(stateKey)
          this.handlers.delete(key)
          return this
        })() as unknown as AdapterReturnType<T, this>
      }
    }
    catch (error) {
      console.error(`[AbstractState] Failed to remove state ${key}:`, error)
      if (this.isSyncAdapter(this.getAdapter())) {
        return this as AdapterReturnType<T, this>
      }
      else {
        return Promise.resolve(this) as unknown as AdapterReturnType<T, this>
      }
    }
  }

  /**
   * ### 清空所有状态（根据适配器类型自动推导同步/异步）
   */
  clear(): AdapterReturnType<T, this> {
    try {
      const adapter = this.getAdapter()

      if (this.isSyncAdapter(adapter)) {
        // 同步操作
        adapter.clear()
        this.handlers.clear()
        return this as AdapterReturnType<T, this>
      }
      else {
        // 异步操作
        return (async () => {
          await (adapter as IAsyncCacheAdapter).clear()
          this.handlers.clear()
          return this
        })() as unknown as AdapterReturnType<T, this>
      }
    }
    catch (error) {
      console.error('[AbstractState] Failed to clear states:', error)
      if (this.isSyncAdapter(this.getAdapter())) {
        return this as AdapterReturnType<T, this>
      }
      else {
        return Promise.resolve(this) as unknown as AdapterReturnType<T, this>
      }
    }
  }

  /**
   * ### 检查状态是否存在（根据适配器类型自动推导同步/异步）
   */
  has(key: string): AdapterReturnType<T, boolean> {
    try {
      const adapter = this.getAdapter()
      const stateKey = this.getStateKey(key)

      if (this.isSyncAdapter(adapter)) {
        // 同步操作
        return adapter.has(stateKey) as AdapterReturnType<T, boolean>
      }
      else {
        // 异步操作
        return (adapter as IAsyncCacheAdapter).has(stateKey) as AdapterReturnType<T, boolean>
      }
    }
    catch (error) {
      console.error(`[AbstractState] Failed to check state ${key}:`, error)
      if (this.isSyncAdapter(this.getAdapter())) {
        return false as AdapterReturnType<T, boolean>
      }
      else {
        return Promise.resolve(false) as AdapterReturnType<T, boolean>
      }
    }
  }

  /**
   * ### 判断是否为同步适配器
   */
  private isSyncAdapter(adapter: ICacheAdapter): adapter is ISyncCacheAdapter {
    // 通过检查方法返回值类型来判断
    const result = adapter.has('__type_check__')
    return typeof result !== 'object' || !('then' in result)
  }
}
