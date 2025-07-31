interface JoinPathOptions {
  /**
   * 是否保留结尾的斜杠。
   * 如果为 true，并且原始的最后一个片段有斜杠，则结果会保留斜杠。
   * @default false
   */
  keepTrailingSlash?: boolean
}

type JoinPathArg = string | JoinPathOptions

/**
 * 拼接URL或路径片段。
 * @param args - 任意数量的字符串片段，最后一个参数可以是配置对象。
 */
export function joinPath(...args: JoinPathArg[]): string {
  const lastArg = args[args.length - 1]
  const hasOptions
      = typeof lastArg === 'object' && lastArg !== null && !Array.isArray(lastArg)
  const options: JoinPathOptions = hasOptions
    ? (lastArg as JoinPathOptions)
    : {}

  const parts = (hasOptions ? args.slice(0, -1) : args) as string[]

  const validParts = parts.map(p => String(p || '')).filter(Boolean)
  if (validParts.length === 0) {
    return ''
  }

  let joined = validParts.reduce((acc, part) => {
    const cleanAcc = acc.replace(/\/+$/, '')
    const cleanPart = part.replace(/^\/+/, '')
    return `${cleanAcc}/${cleanPart}`
  })

  const keepSlash = options.keepTrailingSlash ?? false
  const lastPart = validParts[validParts.length - 1] || ''

  if (joined !== '/') {
    joined = joined.replace(/\/+$/, '')
  }

  if (keepSlash && lastPart.endsWith('/') && joined !== '/') {
    joined += '/'
  }

  return joined
}
