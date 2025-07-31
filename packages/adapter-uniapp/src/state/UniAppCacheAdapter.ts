import type { ISyncCacheAdapter } from '@omni-dev/base'

/**
 * ### UniApp缓存适配器
 * @description 基于uni.storage的同步缓存实现
 */
export class UniAppCacheAdapter implements ISyncCacheAdapter {
  private prefix: string

  constructor(prefix: string = 'app_state_') {
    this.prefix = prefix
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`
  }

  get<T = any>(key: string): T | null {
    try {
      const value = uni.getStorageSync(this.getKey(key))
      if (value === undefined || value === '') {
        return null
      }

      // 检查TTL
      if (value && typeof value === 'object' && 'data' in value && 'expires' in value) {
        if (Date.now() > value.expires) {
          // 过期，删除并返回null
          this.remove(key)
          return null
        }
        return value.data as T
      }

      return value as T
    }
    catch (error) {
      console.error(`[UniAppCacheAdapter] Failed to get ${key}:`, error)
      return null
    }
  }

  set<T = any>(key: string, value: T, ttl?: number): void {
    try {
      const storageKey = this.getKey(key)

      if (ttl) {
        // 如果有TTL，包装数据
        const wrappedValue = {
          data: value,
          expires: Date.now() + ttl,
        }
        uni.setStorageSync(storageKey, wrappedValue)
      }
      else {
        uni.setStorageSync(storageKey, value)
      }
    }
    catch (error) {
      console.error(`[UniAppCacheAdapter] Failed to set ${key}:`, error)
    }
  }

  remove(key: string): void {
    try {
      uni.removeStorageSync(this.getKey(key))
    }
    catch (error) {
      console.error(`[UniAppCacheAdapter] Failed to remove ${key}:`, error)
    }
  }

  clear(): void {
    try {
      const info = uni.getStorageInfoSync()
      info.keys.forEach((key: string) => {
        if (key.startsWith(this.prefix)) {
          uni.removeStorageSync(key)
        }
      })
    }
    catch (error) {
      console.error('[UniAppCacheAdapter] Failed to clear:', error)
    }
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  keys(): string[] {
    try {
      const info = uni.getStorageInfoSync()
      return info.keys
        .filter((key: string) => key.startsWith(this.prefix))
        .map((key: string) => key.substring(this.prefix.length))
    }
    catch (error) {
      console.error('[UniAppCacheAdapter] Failed to get keys:', error)
      return []
    }
  }
}
