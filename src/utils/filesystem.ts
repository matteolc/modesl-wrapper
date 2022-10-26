import { writeFile, existsSync, mkdirSync } from 'fs';
import { DateTime } from 'luxon';

export const writeFileToDateTimePath = async (fname: string, basePath: string, content: string, ts: DateTime) => {
    const fpath = [basePath, ts.year, ts.month, ts.day, ts.hour].join('/');
    if (!existsSync(fpath)) {
        mkdirSync(fpath, {
            recursive: true,
        });
    }
    writeFile(`${fpath}/${fname}.json`, content, 'utf8', () => {
        return;
    });
};
