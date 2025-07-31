interface ITextEncoder {
  readonly encoding: 'utf-8'
  encode: (input?: string) => Uint8Array
}

interface ITextDecoder {
  readonly encoding: 'utf-8'
  decode: (input?: Uint8Array | ArrayBuffer) => string
}

export class TextEncoder implements ITextEncoder {
  public readonly encoding = 'utf-8'

  /**
   * 将字符串编码为 UTF-8 字节。
   * @param str 要编码的字符串，默认为空字符串。
   * @returns {Uint8Array} 编码后的字节数组。
   */
  public encode(str: string = ''): Uint8Array {
    const bytes: number[] = []

    for (let i = 0; i < str.length; i++) {
      let code: number = str.charCodeAt(i)

      // --- 关键部分：正确处理 Unicode 代理对 (Surrogate Pairs) ---
      // 如果是高位代理项 (0xD800 到 0xDBFF)，代表这是一个增补字符
      if (code >= 0xD800 && code <= 0xDBFF) {
        // 检查是否有配对的低位代理项
        if (i + 1 < str.length) {
          const low: number = str.charCodeAt(i + 1)
          if (low >= 0xDC00 && low <= 0xDFFF) {
            // 计算真实的码点 (U+10000 及以上)
            code = 0x10000 + ((code - 0xD800) << 10) | (low - 0xDC00)
            i++ // 跳过已经处理的低位代理项
          }
        }
      }

      // --- 根据码点进行 UTF-8 编码 ---
      if (code < 0x80) {
        // 1 字节: 0xxxxxxx
        bytes.push(code)
      }
      else if (code < 0x800) {
        // 2 字节: 110xxxxx 10xxxxxx
        bytes.push(0xC0 | (code >> 6), 0x80 | (code & 0x3F))
      }
      else if (code < 0x10000) {
        // 3 字节: 1110xxxx 10xxxxxx 10xxxxxx
        bytes.push(0xE0 | (code >> 12), 0x80 | ((code >> 6) & 0x3F), 0x80 | (code & 0x3F))
      }
      else {
        // 4 字节: 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
        bytes.push(
          0xF0 | (code >> 18),
          0x80 | ((code >> 12) & 0x3F),
          0x80 | ((code >> 6) & 0x3F),
          0x80 | (code & 0x3F),
        )
      }
    }

    return new Uint8Array(bytes)
  }
}

export class TextDecoder implements ITextDecoder {
  public readonly encoding = 'utf-8'

  constructor(encoding: string = 'utf-8') {
    if (encoding.toLowerCase() !== 'utf-8') {
      // 这个实现只支持 UTF-8
      throw new TypeError(`Encoding not supported: ${encoding}. Only 'utf-8' is supported.`)
    }
  }

  /**
   * 将 UTF-8 字节流解码为字符串。
   * @param input 要解码的 Uint8Array 或 ArrayBuffer，默认为空。
   * @returns {string} 解码后的字符串。
   */
  public decode(input: Uint8Array | ArrayBuffer = new Uint8Array()): string {
    const bytes: Uint8Array = input instanceof Uint8Array ? input : new Uint8Array(input)
    const codePoints: number[] = []
    let i: number = 0

    while (i < bytes.length) {
      const byte1 = bytes[i]!
      let codePoint: number | null = null

      if (byte1 < 0x80) {
        // 1 字节 (0-127)
        codePoint = byte1
        i += 1
      }
      else if ((byte1 & 0xE0) === 0xC0) {
        // 2 字节
        const byte2 = bytes[i + 1]
        if (byte2 !== undefined && (byte2 & 0xC0) === 0x80) {
          codePoint = ((byte1 & 0x1F) << 6) | (byte2 & 0x3F)
          if (codePoint < 0x80)
            codePoint = null // 检查超长编码
          i += 2
        }
        else {
          i += 1 // 无效序列
        }
      }
      else if ((byte1 & 0xF0) === 0xE0) {
        // 3 字节
        const byte2 = bytes[i + 1]
        const byte3 = bytes[i + 2]
        if (byte2 !== undefined && (byte2 & 0xC0) === 0x80 && byte3 !== undefined && (byte3 & 0xC0) === 0x80) {
          codePoint = ((byte1 & 0x0F) << 12) | ((byte2 & 0x3F) << 6) | (byte3 & 0x3F)
          // 检查超长编码和无效的代理对码点
          if (codePoint < 0x800 || (codePoint >= 0xD800 && codePoint <= 0xDFFF)) {
            codePoint = null
          }
          i += 3
        }
        else {
          i += 1 // 无效序列
        }
      }
      else if ((byte1 & 0xF8) === 0xF0) {
        // 4 字节
        const byte2 = bytes[i + 1]
        const byte3 = bytes[i + 2]
        const byte4 = bytes[i + 3]
        if (byte2 !== undefined && (byte2 & 0xC0) === 0x80 && byte3 !== undefined && (byte3 & 0xC0) === 0x80 && byte4 !== undefined && (byte4 & 0xC0) === 0x80) {
          codePoint = ((byte1 & 0x07) << 18) | ((byte2 & 0x3F) << 12) | ((byte3 & 0x3F) << 6) | (byte4 & 0x3F)
          // 检查超长编码和超出 Unicode 范围
          if (codePoint < 0x10000 || codePoint > 0x10FFFF)
            codePoint = null
          i += 4
        }
        else {
          i += 1 // 无效序列
        }
      }
      else {
        // 无效的 UTF-8 起始字节
        i += 1
      }

      if (codePoint === null) {
        // 如果解码失败（无效序列），使用标准替换字符的码点
        codePoints.push(0xFFFD)
      }
      else {
        codePoints.push(codePoint)
      }
    }

    // 使用 String.fromCodePoint 一次性将所有码点转换为字符串，性能更优
    return String.fromCodePoint(...codePoints)
  }
}
