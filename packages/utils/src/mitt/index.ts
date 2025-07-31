import type {
  Emitter,
  EventHandlerList,
  EventHandlerMap,
  EventType,
  GenericEventHandler,
} from './type'

/**
 * Mitt: functional event emitter / pubsub.
 * @name mitt
 * @link https://github.com/developit/mitt
 */
export default function mitt<Events extends Record<EventType, unknown>>(
  all?: EventHandlerMap<Events>,
): Emitter<Events> {
  type HandlerType = GenericEventHandler<Events>

  all = all || new Map()

  const emitter: Emitter<Events> = {
    /**
     * A Map of event names to registered handler functions.
     */
    all,

    /**
     * Register an event handler for the given type.
     * @param {string|symbol} type Type of event to listen for, or `'*'` for all events
     * @param {Function} handler Function to call in response to given event
     * @memberOf mitt
     */
    on<Key extends keyof Events | '*'>(type: Key, handler: HandlerType, options?: { signal?: AbortSignal, once?: boolean }) {
      let unsubscribe = () => {}

      if (options?.signal?.aborted) {
        return unsubscribe
      }

      let finalHandler = handler
      if (options?.once) {
        finalHandler = (...args: unknown[]) => {
          unsubscribe()
          // @ts-expect-error - 获取所有参数
          handler(...args)
        }
      }

      const handlers: Array<HandlerType> | undefined = all.get(type)
      if (handlers) {
        handlers.push(finalHandler)
      }
      else {
        all.set(type, [finalHandler] as EventHandlerList<Events[keyof Events]>)
      }

      unsubscribe = () => {
        emitter.off(type, finalHandler)
        options?.signal?.removeEventListener('abort', unsubscribe)
      }

      options?.signal?.addEventListener('abort', unsubscribe, { once: true })

      return unsubscribe
    },

    once<Key extends keyof Events | '*'>(type: Key, handler: HandlerType) {
      return emitter.on(type, handler, { once: true })
    },

    /**
     * Remove an event handler for the given type.
     * If `handler` is omitted, all handlers of the given type are removed.
     * @param {string|symbol} type Type of event to unregister `handler` from (`'*'` to remove a wildcard handler)
     * @param {Function} [handler] Handler function to remove
     * @memberOf mitt
     */
    off<Key extends keyof Events | '*'>(type: Key, handler?: HandlerType) {
      const handlers: Array<HandlerType> | undefined = all.get(type)
      if (handlers) {
        if (handler) {
          handlers.splice(handlers.indexOf(handler) >>> 0, 1)
        }
        else {
          all.set(type, [])
        }
      }
    },

    /**
     * Invoke all handlers for the given type.
     * If present, `'*'` handlers are invoked after type-matched handlers.
     *
     * Note: Manually firing '*' handlers is not supported.
     *
     * @param {string|symbol} type The event type to invoke
     * @param {Any} [evt] Any value (object is recommended and powerful), passed to each handler
     * @memberOf mitt
     */
    emit<Key extends keyof Events | '*'>(type: Key, evt?: Events[Key]) {
      all.get(type)?.slice().forEach((handler) => {
        handler(evt!)
      })

      all.get('*')?.slice().forEach((handler) => {
        handler(type, evt!)
      })
    },
  }

  return emitter
}
