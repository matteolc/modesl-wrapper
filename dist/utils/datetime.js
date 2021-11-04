"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDateTimeFromStringUepoch = void 0;
const luxon_1 = require("luxon");
const lodash_1 = require("lodash");
/**
 * Extract datetime information from a microsecond Unix timestamp
 *
 * @param epoch
 * @returns
 */
const getDateTimeFromStringUepoch = (epoch) => {
    if ((0, lodash_1.isNil)(epoch))
        return null;
    return luxon_1.DateTime.fromMillis((0, lodash_1.ceil)(parseInt(epoch) / 1000));
};
exports.getDateTimeFromStringUepoch = getDateTimeFromStringUepoch;
