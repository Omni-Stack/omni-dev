import { describe, expect, it } from 'vitest'
import { joinPath } from './join'

describe('joinPath', () => {
  describe('default behavior', () => {
    it('should join basic path segments', () => {
      expect(joinPath('a', 'b', 'c')).toBe('a/b/c')
    })

    it('should handle and clean up extra slashes', () => {
      expect(joinPath('/a/', '/b/', '/c')).toBe('/a/b/c')
    })

    it('should handle various protocols correctly', () => {
      expect(joinPath('http://example.com', 'a')).toBe('http://example.com/a')
      expect(joinPath('https://example.com/', '/b')).toBe('https://example.com/b')
      expect(joinPath('//cdn.net', 'c')).toBe('//cdn.net/c')
    })

    it('should ignore null, undefined, and empty string parts', () => {
      // @ts-expect-error - 测试
      expect(joinPath('a', null, 'b', undefined, '', 'c')).toBe('a/b/c')
    })

    it('should remove the trailing slash by default', () => {
      expect(joinPath('a', 'b/')).toBe('a/b')
      expect(joinPath('a/b/')).toBe('a/b')
    })

    it('should handle edge cases', () => {
      expect(joinPath()).toBe('')
      expect(joinPath('/')).toBe('/')
      expect(joinPath('http://example.com')).toBe('http://example.com')
    })
  })

  describe('with keepTrailingSlash: true', () => {
    const options = { keepTrailingSlash: true }

    it('should keep trailing slash if the last part has one', () => {
      expect(joinPath('a', 'b/', options)).toBe('a/b/')
      expect(joinPath('/a/b/', options)).toBe('/a/b/')
      expect(joinPath('http://a.com/b/', options)).toBe('http://a.com/b/')
    })

    it('should not add trailing slash if the last part does not have one', () => {
      expect(joinPath('a', 'b', options)).toBe('a/b')
      expect(joinPath('/a/b', options)).toBe('/a/b')
    })

    it('should handle the root path correctly', () => {
      expect(joinPath('/', options)).toBe('/')
    })

    it('should work when options object is the only argument', () => {
      expect(joinPath(options)).toBe('')
    })
  })
})
