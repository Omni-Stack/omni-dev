declare namespace OmniTypesNamespace {
  /**
   * ### 排除掉实例中的 func
   */
  export type NonMethodKeys<T> = {
    [K in keyof T]: T[K] extends (...args: any[]) => any ? never : K
  }[keyof T] & string

  /**
   * ### 仅保留对象中的字段
   */
  export type OnlyKeys<T, K extends keyof T> = {
    [P in K]: T[P]
  }

  /**
   * ### 排除掉实例中的 func
   */
  export type NoMethod<T> = {
    [K in NonMethodKeys<T>]: T[K]
  }

  export type SafeReturnType<T>
  = T extends (...args: any[]) => infer R ? R
    : T extends undefined ? undefined
      : never

  /** 选择性设置可选项 */
  export type SetOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
}
