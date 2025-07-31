import type { IJson } from '@omni-dev/core'
import type { RootEntity } from '../model'
import type { AbstractCurdService } from '../service'
import type {
  ValidateRule,
  ValidatorCallback,
  ValidatorTarget,
  ValidatorTrigger,
  ValidatorType,
} from './type'
import { getFormConfigList } from '../decorator'
import { ValidateUtil } from '../helper'
import { BaseI18n } from '../i18n'

/**
 * ### 表单验证
 */
export class FormValidator {
  /**
   * ### 错误提醒
   * 请通过 `.show()` 传入
   */
  message!: string

  /**
   * ### 触发方式
   * 不建议直接设置哦~ (默认blur)
   */
  trigger: ValidatorTrigger = 'change'

  /**
   * ### 类型
   * 可通过 `toString` `toNumber` `toArray` 设置 (默认`string`)
   */
  type!: ValidatorType

  /**
   * ### 是否必填
   * 可以调用 `.ifEmpty()`
   */
  required = false

  /**
   * ### 自定义验证器
   * 请调用 `.setCustomValidator()`
   */
  validator!: (rule: ValidatorTarget, value: any, callback: ValidatorCallback) => void

  /**
   * ### 通过指定错误信息来创建一个验证器
   * @param message `可选` 验证失败的提示
   */
  static show(message?: string): FormValidator {
    return new FormValidator().show(message)
  }

  /**
   * ### 创建一个验证器
   * @param rule 验证规则
   */
  static create(rule: ValidateRule): ValidateRule {
    return rule
  }

  /**
   * ### 创建验证器
   * @param service 接口服务对象
   * @param rules `可选` 表单验证规则
   */
  static createRules<E extends RootEntity, S extends AbstractCurdService<E>>(
    service: S,
    rules: ValidateRule<E> = {},
  ) {
    const formRules: IJson = rules
    const formFieldList = getFormConfigList(service.entityClass)
    for (let i = 0; i < formFieldList.length; i += 1) {
      const config = formFieldList[i]!
      const fieldKey = config.key
      if (!formRules[fieldKey]) {
        formRules[fieldKey] = []
      }
      if (config.requiredString) {
        formRules[fieldKey].push(this.getValidator(config.requiredString).ifEmpty())
      }
      if (config.requiredNumber) {
        formRules[fieldKey].push(this.getValidator(config.requiredNumber).toNumber().ifEmpty())
      }
      if (config.requiredPayload) {
        formRules[fieldKey].push(this.getValidator(config.requiredPayload).ifPayloadEmpty())
      }
      if (config.minLength) {
        formRules[fieldKey].push(FormValidator.show().ifLengthLessThan(config.minLength))
      }
      if (config.number) {
        if (config.min) {
          formRules[fieldKey].push(FormValidator.show().ifLessThan(config.min))
        }
        if (config.max) {
          formRules[fieldKey].push(FormValidator.show().ifGreaterThan(config.max))
        }
      }
      if (config.chinese) {
        formRules[fieldKey].push(this.getValidator(config.chinese).ifNotChinese())
      }
      if (config.telPhone) {
        formRules[fieldKey].push(this.getValidator(config.telPhone).ifNotTelPhone())
      }
      if (config.mobilePhone) {
        formRules[fieldKey].push(this.getValidator(config.mobilePhone).ifNotMobilePhone())
      }
      if (config.phone) {
        formRules[fieldKey].push(this.getValidator(config.phone).ifNotPhone())
      }
      if (config.email) {
        formRules[fieldKey].push(this.getValidator(config.email).ifNotEmail())
      }
      if (config.regExp) {
        formRules[fieldKey].push(FormValidator.show('').ifNotTest(config.regExp))
      }
    }
    return formRules as ValidateRule<E>
  }

  /**
   * ### 获取一个验证器
   * @param configValue 验证器配置的值
   */
  private static getValidator(configValue: string | boolean): FormValidator {
    return FormValidator.show(typeof configValue === 'string' ? configValue : '')
  }

  /**
   * ### 转换验证数据为数组
   */
  toArray(): this {
    this.type = 'array'
    return this
  }

  /**
   * ### 转换验证数据为数字
   */
  toNumber(): this {
    this.type = 'number'
    return this
  }

  /**
   * ### 转换验证数据为字符串
   */
  toString(): this {
    this.type = 'string'
    return this
  }

  /**
   * ### 转换验证数据为日期
   */
  toDate(): this {
    this.type = 'date'
    return this
  }

  /**
   * ### 显示错误信息
   * @param message 验证失败提醒文案
   */
  show(message?: string): this {
    if (message) {
      this.message = message
    }
    return this
  }

  /**
   * ### 不允许的内容
   * @param str 内容
   */
  ifEquals(str: string): this {
    this.validator = (_: ValidatorTarget, value: string, callback: ValidatorCallback) => {
      if (value && value === str) {
        callback(this.message || `输入的内容不能是${str}`)
      }
      else {
        callback()
      }
    }
    return this
  }

  /**
   * ### 字符长度少于多少时报错
   * @param min 最小值
   */
  ifLengthLessThan(min: number): this {
    this.validator = (_: ValidatorTarget, value: string, callback: ValidatorCallback) => {
      if (value && value.length < min) {
        callback(this.message || `最少请输入${min}个字符`)
      }
      else {
        callback()
      }
    }
    return this
  }

  /**
   * ### 字符长度超过多少时报错
   * @param max 最大值
   */
  ifLengthGreaterThan(max: number): this {
    this.validator = (_: ValidatorTarget, value: string, callback: ValidatorCallback) => {
      if (value && value.length > max) {
        callback(this.message || `最多允许输入${max}个字符`)
      }
      else {
        callback()
      }
    }
    return this
  }

  /**
   * ### 不小于多少时报错 即必须大于
   * @param min 最小值
   */
  ifNotLessThan(min: number): this {
    this.toNumber()
    this.validator = (_: ValidatorTarget, value: number, callback: ValidatorCallback) => {
      if (value <= min) {
        callback(this.message || `数字必须大于${min}`)
      }
      else {
        callback()
      }
    }
    return this
  }

  /** ********************************************* 数学相关 */

  /**
   * ### 不大于多少时报错 即必须小于
   * @param max 最大值
   */
  ifNotGreaterThan(max: number): this {
    this.toNumber()
    this.validator = (_: ValidatorTarget, value: number, callback: ValidatorCallback) => {
      if (value >= max) {
        callback(this.message || `数字必须小于${max}`)
      }
      else {
        callback()
      }
    }
    return this
  }

  /**
   * ### 小于多少时报错
   * @param min 最小值
   */
  ifLessThan(min: number): this {
    this.toNumber()
    this.validator = (_: ValidatorTarget, value: number, callback: ValidatorCallback) => {
      if (value < min) {
        callback(this.message || `数字最小允许输入${min}`)
      }
      else {
        callback()
      }
    }
    return this
  }

  /**
   * ### 大于多少时报错
   * @param max 最大值
   */
  ifGreaterThan(max: number): this {
    this.toNumber()
    this.validator = (_: ValidatorTarget, value: number, callback: ValidatorCallback) => {
      if (value > max) {
        callback(this.message || `数字最大允许输入${max}`)
      }
      else {
        callback()
      }
    }
    return this
  }

  /**
   * ### 为空时报错
   */
  ifEmpty(): this {
    this.required = true
    if (!this.message) {
      this.message = BaseI18n.get().ConfirmToComplete
    }
    return this
  }

  /**
   * ### 失去焦点时验证
   */
  whenBlur(): this {
    this.trigger = 'blur'
    return this
  }

  /**
   * ### 设置自定义验证器
   * @param validator 验证方法
   */

  setCustomValidator(validator: (_: ValidatorTarget, value: unknown, callback: ValidatorCallback) => void): this {
    this.validator = validator
    return this
  }

  /**
   * ### 当不包含某些字符串时报错
   * @param whats 字符串数组
   */
  ifNotContain(...whats: string[]): this {
    let error = false
    this.validator = (_: ValidatorTarget, value: string, callback: ValidatorCallback) => {
      error = false
      for (const what of whats) {
        if (!value || !value.includes(what)) {
          error = true
          break
        }
      }
      if (error) {
        callback(this.message || `输入中必须包含 ${whats.join(',')}`)
      }
      else {
        callback()
      }
    }
    return this
  }

  /**
   * ### 当包含某些字符串时报错
   * @param whats 字符串数组
   */
  ifContain(...whats: string[]): this {
    let error = ''
    this.validator = (_: ValidatorTarget, value: string, callback: ValidatorCallback) => {
      if (!value) {
        callback()
        return
      }
      for (const what of whats) {
        error = ''
        if (value.includes(what)) {
          error = what
          break
        }
      }
      if (error) {
        callback(this.message || `${BaseI18n.get().InvalidContain} ${error} `)
      }
      else {
        callback()
      }
    }
    return this
  }

  /**
   * ### 满足指定正则表达式后报错
   * @param regx 正则
   */
  ifTest(regx: RegExp): this {
    this.validator = (_: ValidatorTarget, value: string, callback: ValidatorCallback) => {
      if (value && regx.test(value)) {
        callback(this.message || BaseI18n.get().TestError)
      }
      else {
        callback()
      }
    }
    return this
  }

  /**
   * ### 不满足指定正则表达式后报错
   * @param regx 正则
   */
  ifNotTest(regx: RegExp): this {
    this.validator = (_: ValidatorTarget, value: string, callback: ValidatorCallback) => {
      if (value && !regx.test(value)) {
        callback(this.message || BaseI18n.get().TestError)
      }
      else {
        callback()
      }
    }
    return this
  }

  /**
   * ### 如果不是邮箱时报错
   */
  ifNotEmail(): this {
    this.validator = (_: ValidatorTarget, value: string, callback: ValidatorCallback) => {
      if (!value || ValidateUtil.isEmail(value)) {
        callback()
      }
      else {
        callback(this.message || BaseI18n.get().InvalidEmail)
      }
    }
    return this
  }

  /**
   * ### 如果不是手机号时报错
   */
  ifNotMobilePhone(): this {
    this.validator = (_: ValidatorTarget, value: string, callback: ValidatorCallback) => {
      if (!value || ValidateUtil.isMobilePhone(value)) {
        callback()
      }
      else {
        callback(this.message || BaseI18n.get().InvalidMobilePhone)
      }
    }
    return this
  }

  /**
   * ### 如果不是座机号时报错
   */
  ifNotTelPhone(): this {
    this.validator = (_: ValidatorTarget, value: string, callback: ValidatorCallback) => {
      if (!value || ValidateUtil.isTelephone(value)) {
        callback()
      }
      else {
        callback(this.message || BaseI18n.get().InvalidTelPhone)
      }
    }
    return this
  }

  /**
   * ### 如果不是联系电话时报错
   */
  ifNotPhone(): this {
    this.validator = (_: ValidatorTarget, value: string, callback: ValidatorCallback) => {
      if (!value || ValidateUtil.isTelephoneOrMobilePhone(value)) {
        callback()
      }
      else {
        callback(this.message || BaseI18n.get().InvalidPhone)
      }
    }
    return this
  }

  /**
   * ### 如果不是纯字母时报错
   */
  ifNotOnlyLetter(): this {
    this.validator = (_: ValidatorTarget, value: string, callback: ValidatorCallback) => {
      if (!value || ValidateUtil.isOnlyLetter(value)) {
        callback()
      }
      else {
        callback(this.message || BaseI18n.get().InvalidLetter)
      }
    }
    return this
  }

  /**
   * ### 如果不是字母和数字报错
   */
  ifNotOnlyNumberAndLetter(): this {
    this.validator = (_: ValidatorTarget, value: string, callback: ValidatorCallback) => {
      if (!value || ValidateUtil.isOnlyNumberAndLetter(value)) {
        callback()
      }
      else {
        callback(this.message || BaseI18n.get().InvalidNumberAndLetter)
      }
    }
    return this
  }

  /**
   * ### 如果不是自然整数(含0)时报错
   */
  ifNotNaturalInteger(): this {
    this.toNumber()
    this.validator = (_: ValidatorTarget, value: string, callback: ValidatorCallback) => {
      if (!value || ValidateUtil.isNaturalInteger(value)) {
        callback()
      }
      else {
        callback(this.message || BaseI18n.get().InvalidNaturalIntegerNumber || '只允许输入非负整数')
      }
    }
    return this
  }

  /**
   * ### 如果不是自然整数(含0)时报错
   */
  ifNotNaturalNumber(): this {
    this.toNumber()
    this.validator = (_: ValidatorTarget, value: string, callback: ValidatorCallback) => {
      if (!value || ValidateUtil.isNaturalNumber(value)) {
        callback()
      }
      else {
        callback(this.message || BaseI18n.get().InvalidNaturalNumber || '只允许输入非负数字')
      }
    }
    return this
  }

  /**
   * ### 如果不是整数时报错
   */
  ifNotInteger(): this {
    this.toNumber()
    this.validator = (_: ValidatorTarget, value: string, callback: ValidatorCallback) => {
      if (!value || ValidateUtil.isInteger(value)) {
        callback()
      }
      else {
        callback(this.message || BaseI18n.get().InvalidIntegerNumber)
      }
    }
    return this
  }

  /**
   * ### 如果不是数字(含小数)时报错
   */
  ifNotNumber(): this {
    this.toNumber()
    this.validator = (_: ValidatorTarget, value: string, callback: ValidatorCallback) => {
      if (!value || ValidateUtil.isNumber(value)) {
        callback()
      }
      else {
        callback(this.message || BaseI18n.get().InvalidNumber)
      }
    }
    return this
  }

  /**
   * ### 如果不是有效身份证时报错
   */
  ifNotChineseIdCard(): this {
    this.validator = (_: ValidatorTarget, value: string, callback: ValidatorCallback) => {
      if (!value || ValidateUtil.isChineseIdCard(value)) {
        callback()
      }
      else {
        callback(this.message || BaseI18n.get().InvalidChineseIdCard)
      }
    }
    return this
  }

  /**
   * ### 如果不是纯汉字
   */
  ifNotChinese(): this {
    this.validator = (_: ValidatorTarget, value: string, callback: ValidatorCallback) => {
      if (!value || ValidateUtil.isChinese(value)) {
        callback()
      }
      else {
        callback(this.message || BaseI18n.get().IfNotChinese)
      }
    }
    return this
  }

  /**
   * ### 如果输入内容不在以下范围内报错
   */
  ifPayloadEmpty(): this {
    this.required = true
    this.trigger = 'change'
    this.validator = (_: ValidatorTarget, value: object, callback: ValidatorCallback) => {
      if (value) {
        callback()
      }
      else {
        callback(this.message || BaseI18n.get().SelectPlease)
      }
    }
    return this
  }
}
