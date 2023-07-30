export type Result<T, E = unknown> = Result.Success<T> | Result.Failure<E>

export namespace Result {
  interface Base<T, E> {
    readonly value?: T
    readonly error?: E
    readonly isSuccess: boolean
    readonly isFailure: boolean

    getOrThrow(): T

    ifSuccess<T2>(f: (value: T) => T2): T2 | undefined
    ifFailure<E2>(f: (value: E) => E2): E2 | undefined

    match<T2, E2>(f: (value: T) => T2, g: (error: E) => E2): T2 | E2

    map<T2>(f: (value: T) => T2): Result<T2, E>
    mapError<E2>(f: (error: E) => E2): Result<T, E2>

    flatMap<T2, E2>(f: (value: T) => Success<T2>): Result<T2, E2>
    flatMap<T2, E2>(f: (value: T) => Failure<E2>): Failure<E> | Failure<E2>
    flatMap<T2, E2>(f: (value: T) => Result<T2, E2>): Result<T2, E | E2>
  }

  export class Success<T> implements Base<T, never> {
    constructor(readonly value: T) {}

    readonly error?: never

    readonly isSuccess = true
    readonly isFailure = false

    getOrThrow(): T {
      return this.value
    }

    ifSuccess<T2>(f: (value: T) => T2): T2 {
      return f(this.value)
    }
    ifFailure(f: (value: never) => unknown): undefined {
      return undefined
    }

    match<T2, E2>(f: (value: T) => T2, g: (error: never) => E2): T2 {
      return f(this.value)
    }

    map<T2>(f: (value: T) => T2): Success<T2> {
      return new Success(f(this.value))
    }
    mapError(f: (error: never) => unknown): Success<T> {
      return this
    }

    flatMap<T2, E2>(f: (value: T) => Success<T2>): Success<T2>
    flatMap<T2, E2>(f: (value: T) => Failure<E2>): Failure<E2>
    flatMap<T2, E2>(f: (value: T) => Result<T2, E2>): Result<T2, E2>
    flatMap<T2, E2>(f: (value: T) => Result<T2, E2>): Result<T2, E2> {
      return f(this.value)
    }
  }

  export class Failure<E> implements Base<never, E> {
    constructor(readonly error: E) {}

    readonly value?: never

    readonly isSuccess = false
    readonly isFailure = true

    getOrThrow(): never {
      throw this.error
    }

    ifSuccess(f: (value: never) => unknown): undefined {
      return undefined
    }
    ifFailure<E2>(f: (value: E) => E2): E2 {
      return f(this.error)
    }

    match<T2, E2>(f: (value: never) => T2, g: (error: E) => E2): E2 {
      return g(this.error)
    }

    map(f: (value: never) => unknown): Failure<E> {
      return this
    }
    mapError<E2>(f: (error: E) => E2): Failure<E2> {
      return new Failure(f(this.error))
    }

    flatMap<T2, E2>(f: (_: never) => Result<T2, E2>): Failure<E> {
      return this
    }
  }

  export function tryCatch<T>(f: () => T): Result<T> {
    try {
      return new Success(f())
    } catch (error) {
      return new Failure(error)
    }
  }

  export function success<T>(value: T): Success<T> {
    return new Success(value)
  }

  export function failure<E>(error: E): Failure<E> {
    return new Failure(error)
  }
}
