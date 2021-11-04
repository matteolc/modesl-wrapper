import { DateTime } from 'luxon';
/**
 * Extract datetime information from a microsecond Unix timestamp
 *
 * @param epoch
 * @returns
 */
export declare const getDateTimeFromStringUepoch: (epoch: string | null) => DateTime;
