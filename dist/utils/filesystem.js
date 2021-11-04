"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeFileToDateTimePath = void 0;
const fs_1 = require("fs");
const writeFileToDateTimePath = async (fname, basePath, content, ts) => {
    const fpath = [basePath, ts.year, ts.month, ts.day, ts.hour].join('/');
    if (!(0, fs_1.existsSync)(fpath)) {
        (0, fs_1.mkdirSync)(fpath, {
            recursive: true,
        });
    }
    (0, fs_1.writeFile)(`${fpath}/${fname}.json`, content, 'utf8', () => {
        return;
    });
};
exports.writeFileToDateTimePath = writeFileToDateTimePath;
