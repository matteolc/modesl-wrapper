import { DateTime } from 'luxon';
import { isNil, ceil } from 'lodash';

/**
 * Extract datetime information from a microsecond Unix timestamp
 *
 * @param epoch
 * @returns
 */
export const getDateTimeFromStringUepoch = (epoch: string | null) => {
    if (isNil(epoch)) return null;
    return DateTime.fromMillis(ceil(parseInt(epoch) / 1000));
};
