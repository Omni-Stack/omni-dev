/* eslint-disable ts/method-signature-style */
// MIT License
// https://github.com/developit/mitt/blob/main/src/index.ts

export type EventType = string | symbol

// An event handler can take an optional event argument
// and should not return a value
export type Handler<V = unknown> = (event: V) => void
export type WildcardHandler<T = Record<string, unknown>> = (
  type: keyof T,
  event: T[keyof T]
) => void
export type GenericEventHandler<Events extends Record<EventType, unknown>>
  = | Handler<Events[keyof Events]>
    | WildcardHandler<Events>

// An array of all currently registered event handlers for a type
export type EventHandlerList<K = unknown> = Array<Handler<K>>
export type WildCardEventHandlerList<T = Record<string, unknown>> = Array<
  WildcardHandler<T>
>

// A map of event types and their corresponding event handlers.
export type EventHandlerMap<Events extends Record<EventType, unknown>>
  = Map<'*', WildCardEventHandlerList<Events>>
    & Map<keyof Events, EventHandlerList<Events[keyof Events]>>

export interface Emitter<Events extends Record<EventType, unknown>> {
  all: EventHandlerMap<Events>

  on(type: '*', handler: WildcardHandler<Events>, options?: { signal?: AbortSignal, once?: boolean }): () => void
  on<Key extends keyof Events>(type: Key, handler: Handler<Events[Key]>, options?: { signal?: AbortSignal, once?: boolean }): () => void
  on<Key extends keyof Events | '*'>(type: Key, handler: GenericEventHandler<Events>, options?: { signal?: AbortSignal, once?: boolean }): () => void

  off(type: '*', handler: WildcardHandler<Events>): void
  off<Key extends keyof Events>(type: Key, handler?: Handler<Events[Key]>): void
  off<Key extends keyof Events | '*'>(type: Key, handler?: GenericEventHandler<Events>): void

  once(type: '*', handler: WildcardHandler<Events>): () => void
  once<Key extends keyof Events>(type: Key, handler: Handler<Events[Key]>): () => void
  once<Key extends keyof Events | '*'>(type: Key, handler: GenericEventHandler<Events>): () => void

  emit<Key extends keyof Events>(type: Key, event: Events[Key]): void
  emit(type: undefined extends Events[keyof Events] ? keyof Events : never): void
}
