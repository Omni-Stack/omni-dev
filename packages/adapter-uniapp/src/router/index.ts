import type { RouteLocation } from '@omni-dev/base'
import type { PagesJson } from './type'
import { AbstractRouter } from '@omni-dev/base'

/**
 * UniApp路由器类
 * @template T 页面配置类型，默认为PagesJson
 */
export class Router<T extends PagesJson = PagesJson> extends AbstractRouter<T> {
  /**
   * 创建Router实例的静态工厂方法
   * @param pagesConfig 页面配置对象
   */
  static create<T extends PagesJson = PagesJson>(pagesConfig: T): Router<T> {
    return new Router<T>(pagesConfig)
  }

  constructor(pagesConfig?: T) {
    super(pagesConfig)
  }

  protected loadRoutesFromConfig(pagesConfig: T): void {
    // 处理主包页面
    if (pagesConfig.pages) {
      for (const page of pagesConfig.pages) {
        this.addRoute({
          path: `/${page.path}`,
          name: page.path.replace(/\//g, '-'),
          title: page.style?.navigationBarTitleText || pagesConfig.globalStyle?.navigationBarTitleText || '页面',
          meta: {
            isTabBarPage: this.isTabBarPage(page.path, pagesConfig),
            originalConfig: page,
          },
        })
      }
    }

    // 处理分包页面
    if (pagesConfig.subPackages) {
      for (const subPackage of pagesConfig.subPackages) {
        if (subPackage.pages) {
          for (const page of subPackage.pages) {
            const fullPath = `/${subPackage.root}/${page.path}`
            this.addRoute({
              path: fullPath,
              name: `${subPackage.root}-${page.path}`.replace(/\//g, '-'),
              title: page.style?.navigationBarTitleText || pagesConfig.globalStyle?.navigationBarTitleText || '页面',
              meta: {
                isTabBarPage: false,
                isSubPackage: true,
                subPackageRoot: subPackage.root,
                originalConfig: page,
              },
            })
          }
        }
      }
    }
  }

  private isTabBarPage(pagePath: string, pagesConfig: T): boolean {
    return !!(pagesConfig.tabBar?.list?.find(item => item?.pagePath === pagePath))
  }

  get currentRoute() {
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    return currentPage || null
  }

  push(location: RouteLocation): Promise<any> {
    const url = typeof location === 'string' ? location : this.resolveLocationToUrl(location)
    return new Promise((resolve, reject) => {
      uni.navigateTo({
        url,
        success: resolve,
        fail: reject,
      })
    })
  }

  replace(location: RouteLocation): Promise<any> {
    const url = typeof location === 'string' ? location : this.resolveLocationToUrl(location)
    return new Promise((resolve, reject) => {
      uni.redirectTo({
        url,
        success: resolve,
        fail: reject,
      })
    })
  }

  go(delta: number): void {
    if (delta < 0) {
      uni.navigateBack({
        delta: Math.abs(delta),
      })
    }
    else if (delta > 0) {
      console.warn('UniApp does not support forward navigation')
    }
    // delta === 0 时不做任何操作
  }

  navigateTo(url: string): void {
    uni.navigateTo({
      url,
    })
  }
}

export * from './type'
