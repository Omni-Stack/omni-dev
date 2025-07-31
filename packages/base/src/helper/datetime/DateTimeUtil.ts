import { DateTimeFormatter } from './DateTimeFormatter'

/**
 * # 时间日期时间戳格式化类
 */
export class DateTimeUtil {
  /**
   * ### 时间进制
   */
  static readonly SECOND_PER_MINUTE = 60

  /**
   * ### 每小时的秒数
   */
  static readonly SECOND_PER_HOUR = this.SECOND_PER_MINUTE ** 2

  /**
   * ### 每秒的毫秒数
   */
  static readonly MILLISECONDS_PER_SECOND = 1000

  /**
   * ### 每天小时
   */
  static readonly HOUR_PER_DAY = 24

  /**
   * ### 每月天数
   */
  static readonly DAY_PER_MONTH = 30

  /**
   * ### 每年月份
   */
  static readonly MONTH_PER_YEAR = 12

  /**
   * ### 每年天数
   */
  static readonly DAY_PER_YEAR = 365

  /**
   * ### 每天秒数
   */
  static readonly SECOND_PER_DAY = this.SECOND_PER_HOUR * this.HOUR_PER_DAY

  /**
   * ### 每周天数
   */
  static readonly DAY_PER_WEEK = 7

  /**
   * ### 每年平均周
   */
  static readonly WEEK_PER_YEAR = 52

  /**
   * ### 每月平均周
   */
  static readonly WEEK_PER_MONTH = 4

  /**
   * ### 每天秒数
   */
  static readonly SECONDS_PER_DAY = this.HOUR_PER_DAY * this.SECOND_PER_HOUR

  /**
   * ### 睡会再起来干活
   * 不要忘了`await`，否则没睡醒就起来干活了 :)
   * @param milliSeconds 毫秒数
   */
  static async sleep(milliSeconds: number): Promise<void> {
    return new Promise((success) => {
      setTimeout(() => {
        success()
      }, milliSeconds)
    })
  }

  /**
   * ### 格式化到`Unix`秒时间戳
   * @param date `可选` Date对象/时间字符串 (默认当前时间)
   */
  static getUnixTimeStamps(date?: Date | string): number {
    return Math.round(this.getMilliTimeStamps(date) / this.MILLISECONDS_PER_SECOND)
  }

  /**
   * ### 格式化到毫秒时间戳
   * @param date `可选` Date对象/时间字符串 (默认当前时间)
   */
  static getMilliTimeStamps(date?: Date | string): number {
    if (!date) {
      return new Date().valueOf()
    }
    if (typeof date === 'object') {
      return date.valueOf()
    }
    return new Date(date).valueOf()
  }

  /**
   * ### 从秒时间戳格式化时间
   * @param second 秒时间戳
   * @param formatString 格式化模板
   */
  static formatFromSecond(second: number, formatString: string): string {
    return this.formatFromDate(new Date(second * this.MILLISECONDS_PER_SECOND), formatString)
  }

  /**
   * ### 从毫秒时间戳格式化时间
   * @param milliSecond 毫秒时间戳
   * @param formatString 格式化模板
   */
  static formatFromMilliSecond(milliSecond: number, formatString: string): string {
    return this.formatFromDate(new Date(milliSecond), formatString)
  }

  /**
   * ### 从字符串或对象格式化时间
   * @param date Date对象或字符串
   * @param formatString 格式化模板
   */
  static formatFromDate(date: Date | string, formatString: string): string {
    if (typeof date !== 'object') {
      date = new Date(date)
    }
    if (formatString === DateTimeFormatter.TIMESTAMP.key) {
      return date.valueOf().toString()
    }
    const dict: Record<string, string | number> = {
      YYYY: date.getFullYear(),
      M: date.getMonth() + 1,
      D: date.getDate(),
      H: date.getHours(),
      m: date.getMinutes(),
      s: date.getSeconds(),
      MM: `${date.getMonth() + 101}`.substring(1),
      DD: `${date.getDate() + 100}`.substring(1),
      HH: `${date.getHours() + 100}`.substring(1),
      mm: `${date.getMinutes() + 100}`.substring(1),
      ss: `${date.getSeconds() + 100}`.substring(1),
    }
    return formatString.replace(/(YYYY|MM|DD|HH|ss|mm)/g, arg => dict[arg]!.toString())
  }

  /**
   * ### 格式化到友好字符串显示
   * @param date Date对象或时间字符串
   */
  static getFriendlyDateTime(date: Date | string | number): string {
    const currentTimestamp: number = this.getUnixTimeStamps(new Date())
    let timestamp: number
    if (typeof date === 'number') {
      timestamp = Number.parseInt((date / this.MILLISECONDS_PER_SECOND).toString(), 10)
    }
    else {
      timestamp = this.getUnixTimeStamps(date)
    }
    const diff = Math.abs(currentTimestamp - timestamp)

    const suffix = timestamp > currentTimestamp ? '后' : '前'

    const steps: Array<{ key: number, label: string }> = [
      {
        key: 0,
        label: '秒',
      },
      {
        key: this.SECOND_PER_MINUTE,
        label: '分钟',
      },
      {
        key: this.SECOND_PER_MINUTE ** 2,
        label: '小时',
      },
      {
        key: this.SECONDS_PER_DAY,
        label: '天',
      },
      {
        key: this.SECONDS_PER_DAY * this.DAY_PER_WEEK,
        label: '周',
      },
      {
        key: this.SECONDS_PER_DAY * this.DAY_PER_MONTH,
        label: '月',
      },
      {
        key: this.SECONDS_PER_DAY * this.DAY_PER_YEAR,
        label: '年',
      },
    ]
    for (let i = steps.length - 1; i >= 0; i -= 1) {
      const step = steps[i]!
      if (timestamp <= currentTimestamp && diff < this.SECOND_PER_MINUTE) {
        // 过去时间，且小于60s
        return '刚刚'
      }
      if (diff > step.key) {
        if (step.key === 0) {
          return `${Math.floor(diff)}${step.label}${suffix}`
        }
        return `${Math.floor(diff / step.key)}${step.label}${suffix}`
      }
    }
    return 'Unknown'
  }
}
