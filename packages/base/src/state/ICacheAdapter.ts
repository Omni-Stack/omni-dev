/**
 * ### 同步缓存适配器接口
 */
export interface ISyncCacheAdapter {
  get: <T = any>(key: string) => T | null
  set: <T = any>(key: string, value: T, ttl?: number) => void
  remove: (key: string) => void
  clear: () => void
  has: (key: string) => boolean
  keys: () => string[]
}

/**
 * ### 异步缓存适配器接口
 */
export interface IAsyncCacheAdapter {
  get: <T = any>(key: string) => Promise<T | null>
  set: <T = any>(key: string, value: T, ttl?: number) => Promise<void>
  remove: (key: string) => Promise<void>
  clear: () => Promise<void>
  has: (key: string) => Promise<boolean>
  keys: () => Promise<string[]>
}

/**
 * ### 缓存适配器联合类型
 */
export type ICacheAdapter = ISyncCacheAdapter | IAsyncCacheAdapter

/**
 * ### 适配器类型推导
 */
export type AdapterType<T> = T extends ISyncCacheAdapter ? 'sync' : 'async'

/**
 * ### 根据适配器类型推导返回类型
 */
export type AdapterReturnType<T, R> = T extends ISyncCacheAdapter ? R : Promise<R>
