/* eslint-disable ts/consistent-type-definitions */
import type { Emitter } from './type'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import mitt from './index'

// 为测试定义事件类型
type TestEvents = {
  'foo': string
  'bar': { a: number, b: boolean }
  'baz': void // 无负载事件
  'multi-arg': [string, number] // 多参数事件（用于测试参数转发）
}

describe('mitt', () => {
  let emitter: Emitter<TestEvents>

  // 在每个测试用例开始前，都创建一个新的 emitter 实例
  beforeEach(() => {
    emitter = mitt<TestEvents>()
  })

  describe('on & emit', () => {
    it('应该为一个事件注册并调用一个处理器', () => {
      const handler = vi.fn((e: string) => e) // 创建一个 mock 函数（spy）
      emitter.on('foo', handler)
      emitter.emit('foo', 'hello')

      expect(handler).toHaveBeenCalledOnce()
      expect(handler).toHaveBeenCalledWith('hello')
      expect(handler).toHaveReturnedWith('hello')
    })

    it('应该为一个事件注册并调用多个处理器', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      emitter.on('foo', handler1)
      emitter.on('foo', handler2)
      emitter.emit('foo', 'hello')

      expect(handler1).toHaveBeenCalledOnce()
      expect(handler2).toHaveBeenCalledOnce()
    })

    it('应该为无负载的事件调用处理器', () => {
      const handler = vi.fn()
      emitter.on('baz', handler)
      emitter.emit('baz')

      expect(handler).toHaveBeenCalledOnce()
      expect(handler).toHaveBeenCalledWith(undefined)
    })

    it('不应该为未注册的事件调用处理器', () => {
      const handler = vi.fn()
      emitter.on('foo', handler)
      emitter.emit('bar', { a: 1, b: true })

      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('off', () => {
    it('应该移除一个指定的处理器', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      emitter.on('foo', handler1)
      emitter.on('foo', handler2)

      emitter.off('foo', handler1)

      emitter.emit('foo', 'hello')

      expect(handler1).not.toHaveBeenCalled()
      expect(handler2).toHaveBeenCalledOnce()
    })

    it('当省略处理器时，应该移除一个类型的所有处理器', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      emitter.on('foo', handler1)
      emitter.on('foo', handler2)

      emitter.off('foo') // 省略 handler

      emitter.emit('foo', 'hello')

      expect(handler1).not.toHaveBeenCalled()
      expect(handler2).not.toHaveBeenCalled()
      expect(emitter.all.get('foo')).toEqual([])
    })
  })

  describe('wildcard (*)', () => {
    it('应该为任何事件调用通配符处理器', () => {
      const wildcardHandler = vi.fn()
      emitter.on('*', wildcardHandler)

      emitter.emit('foo', 'hello')
      expect(wildcardHandler).toHaveBeenCalledOnce()
      expect(wildcardHandler).toHaveBeenCalledWith('foo', 'hello')

      emitter.emit('bar', { a: 1, b: true })
      expect(wildcardHandler).toHaveBeenCalledTimes(2)
      expect(wildcardHandler).toHaveBeenCalledWith('bar', { a: 1, b: true })
    })

    it('应该在调用特定处理器后调用通配符处理器', () => {
      const logs: string[] = []
      const specificHandler = vi.fn(() => logs.push('specific'))
      const wildcardHandler = vi.fn(() => logs.push('wildcard'))

      emitter.on('foo', specificHandler)
      emitter.on('*', wildcardHandler)

      emitter.emit('foo', 'event')

      expect(specificHandler).toHaveBeenCalledOnce()
      expect(wildcardHandler).toHaveBeenCalledOnce()
      expect(logs).toEqual(['specific', 'wildcard'])
    })

    it('应该能移除通配符处理器', () => {
      const wildcardHandler = vi.fn()
      emitter.on('*', wildcardHandler)
      emitter.off('*', wildcardHandler)

      emitter.emit('foo', 'event')

      expect(wildcardHandler).not.toHaveBeenCalled()
    })
  })

  describe('once', () => {
    it('使用 emitter.once() 应该只调用处理器一次', () => {
      const handler = vi.fn()
      emitter.once('foo', handler)

      emitter.emit('foo', 'event1')
      emitter.emit('foo', 'event2')

      expect(handler).toHaveBeenCalledOnce()
      expect(handler).toHaveBeenCalledWith('event1')
    })

    it('使用 on(..., { once: true }) 应该只调用处理器一次', () => {
      const handler = vi.fn()
      emitter.on('foo', handler, { once: true })

      emitter.emit('foo', 'event1')
      emitter.emit('foo', 'event2')

      expect(handler).toHaveBeenCalledOnce()
      expect(handler).toHaveBeenCalledWith('event1')
    })

    it('once 处理器中的重入不应导致无限循环', () => {
      const handler = vi.fn(() => {
        // 在处理器内部再次触发同一事件
        emitter.emit('foo', 'inner event')
      })

      emitter.once('foo', handler)
      emitter.emit('foo', 'outer event')

      // 处理器应该只被外部的 emit 调用了一次
      expect(handler).toHaveBeenCalledOnce()
    })
  })

  describe('unsubscribe', () => {
    it('on() 返回的 unsubscribe 函数应该能移除监听器', () => {
      const handler = vi.fn()
      const unsubscribe = emitter.on('foo', handler)

      unsubscribe()

      emitter.emit('foo', 'event')
      expect(handler).not.toHaveBeenCalled()
    })

    it('once() 返回的 unsubscribe 函数应该能提前移除监听器', () => {
      const handler = vi.fn()
      const unsubscribe = emitter.once('foo', handler)

      unsubscribe() // 在事件触发前就取消

      emitter.emit('foo', 'event')
      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('abortSignal', () => {
    it('应该通过 AbortSignal 移除监听器', () => {
      const controller = new AbortController()
      const handler = vi.fn()
      emitter.on('foo', handler, { signal: controller.signal })

      controller.abort()

      emitter.emit('foo', 'event')
      expect(handler).not.toHaveBeenCalled()
    })

    it('一个 signal 应该能移除多个监听器', () => {
      const controller = new AbortController()
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      emitter.on('foo', handler1, { signal: controller.signal })
      emitter.on('bar', handler2, { signal: controller.signal })

      controller.abort()

      emitter.emit('foo', 'event')
      emitter.emit('bar', { a: 1, b: true })
      expect(handler1).not.toHaveBeenCalled()
      expect(handler2).not.toHaveBeenCalled()
    })

    it('不应该为已经中止的 signal 注册监听器', () => {
      const controller = new AbortController()
      controller.abort()

      const handler = vi.fn()
      emitter.on('foo', handler, { signal: controller.signal })

      emitter.emit('foo', 'event')
      expect(handler).not.toHaveBeenCalled()
    })

    it('once 和 signal 组合时，事件先触发，signal 不应再导致错误', () => {
      const controller = new AbortController()
      const handler = vi.fn()
      emitter.on('foo', handler, { once: true, signal: controller.signal })

      emitter.emit('foo', 'event')
      expect(handler).toHaveBeenCalledOnce()

      // 此时监听器已移除，abort 不应该做任何事或报错
      expect(() => controller.abort()).not.toThrow()
    })
  })

  describe('参数转发（当前实现的已知问题）', () => {
    it('emit 多个参数时，处理器应该只接收到第一个', () => {
      const handler = vi.fn()
      emitter.on('multi-arg', handler)

      // @ts-expect-error - 故意违反类型来测试 JS 行为
      emitter.emit('multi-arg', 'hello', 123)

      expect(handler).toHaveBeenCalledOnce()
      // 在你当前的代码中，这个断言会通过，证明了参数丢失的问题
      expect(handler).toHaveBeenCalledWith('hello')
      expect(handler).not.toHaveBeenCalledWith('hello', 123)
    })
  })
})
