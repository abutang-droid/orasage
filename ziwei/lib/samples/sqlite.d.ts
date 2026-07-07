declare module 'node:sqlite' {
  export class DatabaseSync {
    constructor(path: string, options?: { readOnly?: boolean });
    prepare(sql: string): {
      get(...args: unknown[]): unknown;
      run(...args: unknown[]): unknown;
    };
    exec(sql: string): void;
    transaction<T extends (...args: never[]) => void>(fn: T): T;
  }
}
