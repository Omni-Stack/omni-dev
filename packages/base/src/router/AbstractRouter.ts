export interface RouteRecord {
  path: string
  /**
   * 路由名称
   * @description path 更适合作为路由的唯一标识，故 name 为可选
   */
  name?: string
  title?: string
  meta?: Record<string, unknown>
}

/**
 * 路由位置
 *
 * @description 用于描述路由的跳转位置
 * @example
 * ```ts
 * const location: RouteLocation = '/home'
 * const location: RouteLocation = {
 *   name: 'home',
 * }
 * const location: RouteLocation = {
 *   path: '/home',
 *   params: {
 *     id: 1,
 *   },
 *   query: {
 *     name: 'home',
 *   },
 * }
 * ```
 */
export type RouteLocation = string | {
  name: string
  params?: Record<string, unknown>
  query?: Record<string, unknown>
} | {
  path: string
  params?: Record<string, unknown>
  query?: Record<string, unknown>
}

/**
 * ### 抽象路由管理基类
 * @template T 页面配置类型
 */
export abstract class AbstractRouter<T = any> {
  // 为 name->record 的映射创建一个 Map，以提高性能
  protected nameMap: Map<string, RouteRecord> = new Map()
  protected routes: Map<string, RouteRecord> = new Map()

  constructor(pagesConfig?: T) {
    this.initializeRoutes(pagesConfig)
  }

  /** 获取底层框架的当前路由信息 */
  abstract get currentRoute(): any // 类型设为 any，由子类具体定义

  /** 底层的 push 方法 */
  abstract push(location: RouteLocation): Promise<any>

  /** 底层的 replace 方法 */
  abstract replace(location: RouteLocation): Promise<any>

  /** 底层的 go 方法 */
  abstract go(delta: number): void

  /**
   * 初始化路由表。子类可以重写此方法来加载路由。
   * @param pagesConfig 页面配置对象
   */
  protected initializeRoutes(pagesConfig?: T): void {
    if (pagesConfig) {
      this.loadRoutesFromConfig(pagesConfig)
    }
  }

  /**
   * 从配置中加载路由，子类可以重写此方法来自定义路由加载逻辑
   * @param pagesConfig 页面配置对象
   */
  protected loadRoutesFromConfig(pagesConfig: T): void {
    // TODO: 默认实现为空，由子类具体实现路由加载逻辑
  }

  /**
   * 添加一条路由记录到内部路由表
   */
  public addRoute(record: RouteRecord): void {
    if (this.routes.has(record.path)) {
      console.warn(`路由路径冲突: "${record.path}" 已被注册。`)
    }
    this.routes.set(record.path, record)

    // 同时更新 nameMap
    if (record.name) {
      if (this.nameMap.has(record.name)) {
        console.warn(`路由名称冲突: "${record.name}" 已被注册。`)
      }
      this.nameMap.set(record.name, record)
    }
  }

  /**
   * 添加多条路由记录到内部路由表
   */
  public addRoutes(records: RouteRecord[]): void {
    records.forEach(record => this.addRoute(record))
  }

  /**
   * 根据路径获取路由记录
   */
  public getRouteByPath(path: string): RouteRecord | undefined {
    return this.routes.get(path)
  }

  /**
   * 根据名称获取路由记录
   * @description 遍历路由表以查找匹配的名称。
   */
  public getRouteByName(name: string): RouteRecord | undefined {
    for (const record of this.routes.values()) {
      if (record.name === name) {
        return record
      }
    }
  }

  /**
   * 返回上一页
   */
  public back(): void {
    this.go(-1)
  }

  /**
   * 将路由位置对象解析为完整的 URL 字符串
   * @param location - 要解析的路由位置
   * @returns 解析后的 URL 字符串
   */
  public resolveLocationToUrl(location: RouteLocation): string {
    // 1. 如果 location 本身就是字符串，直接返回
    if (typeof location === 'string') {
      return location
    }

    let basePath: string | undefined
    const locationObject = location // any a bit easier here

    // 2. 确定基础路径 (basePath)
    if ('path' in locationObject) {
      basePath = locationObject.path
    }
    else if ('name' in locationObject) {
      const record = this.getRouteByName(locationObject.name)
      if (record) {
        basePath = record.path
      }
      else {
        console.error(`路由解析失败：未找到名称为 "${locationObject.name}" 的路由。`)
        return '/' // 返回一个安全的默认值
      }
    }
    else {
      console.error('路由解析失败：位置对象中缺少 "path" 或 "name"。', location)
      return '/'
    }

    let resolvedPath = basePath

    // 3. 替换路径参数 (params)，例如 /users/:id
    const params = locationObject.params || {}
    for (const key in params) {
      const value = String(params[key]) // 确保值为字符串
      const placeholder = `:${key}`
      if (resolvedPath.includes(placeholder)) {
        // 使用 encodeURIComponent 确保参数安全
        resolvedPath = resolvedPath.replace(placeholder, encodeURIComponent(value))
      }
      else {
        console.warn(`路径 "${basePath}" 中未找到参数 ":${key}" 的占位符。`)
      }
    }

    // 4. 拼接查询参数 (query)
    const query = locationObject.query || {}
    const queryKeys = Object.keys(query)
    if (queryKeys.length > 0) {
      const queryString = queryKeys
        .map((key) => {
          const value = query[key]
          if (value === null || value === undefined) {
            return '' // 忽略 null 或 undefined 的值
          }
          // 对键和值都进行编码
          return `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
        })
        .filter(Boolean) // 过滤掉空字符串
        .join('&')

      if (queryString) {
        resolvedPath += `?${queryString}`
      }
    }

    return resolvedPath
  }

  // 以下方法由子类实现（个别平台无法实现）

  // /**
  //  * 返回首页
  //  * @param replaceMode 是否使用 replace 模式，默认为 true
  //  */
  // public backToHome(replaceMode: boolean = true): void {
  //   const homeRoute = this.getRouteByName('home') // 假设首页的 name 是 'home'
  //   const path = homeRoute?.path || '/'
  //   if (replaceMode) {
  //     this.replace(path)
  //   }
  //   else {
  //     this.push(path)
  //   }
  // }

  // /**
  //  * 向当前 URL 添加或更新查询参数，并执行跳转。
  //  * @param query - 要添加的查询参数对象
  //  * @param replaceMode - 是否使用 replace 模式，默认为 false
  //  */
  // public addQuery(query: Record<string, unknown>, replaceMode: boolean = false): void {
  //   const newLocation = {
  //     path: this.currentRoute.path,
  //     query: { ...this.currentRoute.query, ...query },
  //   }

  //   if (replaceMode) {
  //     this.replace(newLocation)
  //   }
  //   else {
  //     this.push(newLocation)
  //   }
  // }

  // /**
  //  * 重新加载当前页面。
  //  * 注意：这可能导致整个应用重载，对于SPA可能不是最佳选择。
  //  * 更优的方案可能需要结合状态管理。
  //  */
  // public reload(): void {
  //   // 简单实现
  //   window.location.reload()
  //   // 更复杂的 SPA 友好实现可能像这样：
  //   // const current = this.currentRoute;
  //   // this.replace('/redirect-dummy-page').then(() => this.replace(current));
  // }
}
