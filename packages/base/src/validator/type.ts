import type { RootEntity } from '../model/RootEntity'
import type { FormValidator } from './FormValidator'

/**
 * ### 验证器数据类型
 */
export type ValidatorType = 'string' | 'number' | 'date' | 'array'

/**
 * ### 验证器触发类型
 */
export type ValidatorTrigger = 'blur' | 'change'

/**
 * ### 验证器规则类型
 */
export type ValidatorTarget = any

/**
 * ### 验证器回调函数类型
 */
export type ValidatorCallback = (error?: string) => void

/**
 * ### 表单验证规则
 */
export type ValidateRule<E extends RootEntity = RootEntity> = {
  /**
   * ### 字段名:[验证器]
   */
  [K in keyof E]?: FormValidator[]
}
