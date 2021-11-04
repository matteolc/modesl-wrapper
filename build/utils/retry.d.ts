/**
 * Wrap a promise API with a function that will attempt the promise over and over again
 * with exponential backoff until it resolves or reaches the maximum number of retries.
 *   - First retry: 500 ms + <random> ms
 *   - Second retry: 1000 ms + <random> ms
 *   - Third retry: 2000 ms + <random> ms
 * and so forth until maximum retries are met, or the promise resolves.
 */
export declare const withRetries: ({ attempt, maxRetries }: {
    attempt: Function;
    maxRetries: number;
}) => (...args: any) => Promise<any>;
