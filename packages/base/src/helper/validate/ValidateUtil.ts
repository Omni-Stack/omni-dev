/* eslint-disable regexp/no-super-linear-backtracking */
/* eslint-disable regexp/no-unused-capturing-group */
/**
 * ### 验证工具类
 */
export class ValidateUtil {
  /**
   * ### 十进制
   */
  private static readonly DECIMALISM = 10

  /**
   * ### 验证是否手机号或座机号
   * @param phoneNumber 号码
   */
  static isTelephoneOrMobilePhone(phoneNumber: string): boolean {
    return this.isMobilePhone(phoneNumber) || this.isTelephone(phoneNumber)
  }

  /**
   * ### 验证是否邮箱
   * @param email
   */
  static isEmail(email: string): boolean {
    return /^[a-z0-9]+(\.([a-z0-9]+))*@[a-z0-9]+(\.([a-z0-9]+))+$/i.test(email)
  }

  /**
   * ### 验证是否手机号里
   * @param num 号码
   */
  static isMobilePhone(num: string): boolean {
    return /^(\+(\d{1,4}))?1[3-9](\d{9})$/.test(num)
  }

  /**
   * ### 验证是否座机号
   * @param num 号码
   */
  static isTelephone(num: string): boolean {
    return /^(((0\d{2,3})-)?((\d{7,8})|(400\d{7})|(800\d{7}))(-(\d{1,4}))?)$/.test(num)
  }

  /**
   * ### 是否是纯汉字
   *
   * @param str 字符串
   */
  static isChinese(str: string): boolean {
    return /^[\u4E00-\u9FA5]+$/.test(str)
  }

  /**
   * ### 字符串是否只包含了字母
   * @param str 字符串
   */
  static isOnlyLetter(str: string): boolean {
    return /^[a-z]+$/i.test(str)
  }

  /**
   * ### 字符串是否只包含了数字
   * @param str 字符串
   */
  static isOnlyNumberAndLetter(str: string): boolean {
    return /^[a-z0-9]+$/i.test(str)
  }

  /**
   * ### 字符串是否是数字 正负整数小数和0
   * @param str 字符串
   */
  static isNumber(str: string): boolean {
    return /^(-)?\d+((.)\d+)?$/.test(str)
  }

  /**
   * ### 字符串是否是整数
   * @param str 字符串
   */
  static isInteger(str: string): boolean {
    return /^(-)?\d+$/.test(str)
  }

  /**
   * ### 字符串是否是自然整数小数
   * @param str 字符串
   */
  static isNaturalNumber(str: string): boolean {
    return /^\d+((.)\d+)?$/.test(str)
  }

  /**
   * ### 字符串是否是自然整数数
   * @param str 字符串
   */
  static isNaturalInteger(str: string): boolean {
    return /^\d+$/.test(str)
  }

  /**
   * ### 字符串是否是合法身份证
   * @param str 字符串
   */
  static isChineseIdCard(str: string): boolean {
    if (str.length !== 18 && str.length !== 15) {
      return false
    }

    const validArray = [
      [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2],
      [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2],
    ] as const

    if (str.length === 15) {
      // 15位身份证校验
      // eslint-disable-next-line regexp/no-dupe-disjunctions
      return /^[1-9]\d{5}((\d{2}(((0[13578]|1[02])(0[1-9]|[12]\d|3[01]))|((0[13-9]|1[012])(0[1-9]|[12]\d|30))|(02(0[1-9]|1\d|2[0-8]))))|(((0[48]|[2468][048]|[13579][26])|(00))0229))\d{2}[0-9X]$/i.test(
        str,
      )
    }
    if (str.length !== 18) {
      return false
    }

    const year = Number.parseInt(str.substring(6), this.DECIMALISM)
    if (year > new Date().getFullYear() || year < 1900) {
      return false
    }
    const month = Number.parseInt(str.substring(10, 12), this.DECIMALISM)
    if (month > 12 || month < 1) {
      return false
    }
    const day = Number.parseInt(str.substring(12, 14), this.DECIMALISM)
    if (day > 31 || month < 1) {
      return false
    }
    let sum = 0
    for (let i = 0; i < 17; i += 1) {
      sum += Number.parseInt(str[i]!, this.DECIMALISM) * (validArray[0][i] as number)
    }

    return validArray[1][sum % 11]?.toString() === str[17]!.toString()
  }
}
