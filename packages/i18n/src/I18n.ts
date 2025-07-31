import type { I18nClassConstructor } from './type'
import { Language } from './Language'

/**
 * # 语言国际化
 *
 * 一个基于静态方法的类型安全的 i18n 实现。
 *
 * - #### 1. 声明语言包实现类
 *
 * 实现一个继承 `I18n` 的类。这个类将作为默认语言包，并作为所有 i18n 操作的入口。
 *
 * ```ts
 * export class Strings extends I18n {
 *   language = Language.ChineseSimplified // 可选，默认为 '简体中文'
 *   Hello_World = '你好，世界！'
 * }
 * ```
 *
 * - #### 2.【重要】初始化系统
 *
 * 在进行任何操作之前，必须先调用 `init()` 方法来初始化 i18n 系统。
 *
 * ```ts
 * Strings.init()
 * ```
 *
 * - #### 3. 声明并添加新的语言包
 *
 * ```ts
 * const English: Strings = {
 *   language: Language.English,
 *   Hello_World: 'Hello World!'
 * }
 *
 * // 添加一个或多个语言包
 * Strings.addLanguage(English)
 * ```
 *
 * - #### 4. 设置当前语言
 *
 * ```ts
 * Strings.setCurrentLanguage(Language.English)
 * ```
 *
 * - #### 5. 使用多语言
 *
 * `get()` 方法会返回当前设置的语言包对象，并且是类型安全的。
 * ```ts
 * console.log(Strings.get().Hello_World)
 * // 输出: "Hello World!"
 * ```
 */
export class I18n {
  /**
   * ### 默认语言包实例（基准）
   * @private
   */
  private static defaultLanguage: I18n

  /**
   * ### 当前使用的语言包
   * @private
   */
  private static currentLanguage: I18n

  /**
   * ### 语言列表
   *
   * @description 使用 Map 优化查找性能
   * @private
   */
  private static languages: Map<string, I18n> = new Map()

  /**
   * ### 语言名称
   * @default Language.ChineseSimplified
   */
  language: string = Language.ChineseSimplified

  /**
   * ### 初始化 i18n 系统
   * 必须在使用其他方法前调用。该方法会设置默认语言，并准备好 i18n 环境。
   * @param this 继承 I18n 的类，例如 `Strings`。
   */
  static init<T extends I18n>(this: I18nClassConstructor<T>): void {
    if (this.defaultLanguage) {
      // 防止重复初始化
      return
    }
    const defaultInstance = new this()
    this.defaultLanguage = defaultInstance
    this.languages.set(defaultInstance.language, defaultInstance)
    this.currentLanguage = defaultInstance
  }

  /**
   * 检查 i18n 系统是否已初始化。
   * @private
   */
  private static checkInitialized(): void {
    if (!this.defaultLanguage) {
      throw new Error('I18n has not been initialized. Please call .init() on your implementation class first.')
    }
  }

  /**
   * ### 获取当前使用的语言代码
   * @returns 当前使用的语言代码 (例如 'en-US')。
   */
  static getCurrentLanguage(): string {
    this.checkInitialized()
    return this.currentLanguage.language
  }

  /**
   * ### 获取支持的语言列表
   * @returns 包含所有已添加语言代码的数组。
   */
  static getLanguages(): string[] {
    this.checkInitialized()
    return Array.from(this.languages.keys())
  }

  /**
   * ### 获取当前语言的翻译对象
   * @returns 包含所有翻译字符串的当前语言对象，具有完整的类型提示。
   */
  static get<T extends I18n>(this: I18nClassConstructor<T>): T {
    this.checkInitialized()
    return this.currentLanguage as T
  }

  /**
   * ### 添加一个或多个国际化语言包
   * @param languages 要添加的语言包实例列表。
   */
  static addLanguage<T extends I18n>(this: I18nClassConstructor<T>, ...languages: T[]): void {
    this.checkInitialized()
    if (languages.length === 0) {
      console.warn('addLanguage called with no languages.')
      return
    }

    languages.forEach((item) => {
      this.languages.set(item.language, item)
    })
  }

  /**
   * ### 设置当前使用的语言
   * 如果找不到指定的语言，将自动回退到 `init()` 时设置的默认语言。
   * @param language 要设置的语言代码 (例如 'en-US')。
   */
  static setCurrentLanguage(language: Language | string): void {
    this.checkInitialized()
    const foundLanguage = this.languages.get(language) || this.defaultLanguage
    this.currentLanguage = foundLanguage
  }
}
