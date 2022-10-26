import { esl } from './esl';
import { FSEvent } from '../src';
import { logger } from './logger';

function doSomething(event: any) {
    logger.debug(JSON.stringify(event));
}

esl.listen(
    [
        {
            event: FSEvent.Channel.HEARTBEAT,
            apply: doSomething,
        },
    ],
    [],
    [FSEvent.Channel.HEARTBEAT],
);
