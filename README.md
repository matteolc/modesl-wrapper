# FreeSWITCH Mod-ESL Wrapper

The `modesl-wrapper` library provides you with a type-safe wrapper around [modesl](https://github.com/englercj/node-esl) that allows you to listen on ESL events and log, save to JSON file, and apply your callbacks to selected events. It also provides with few pre-cooked FreeSWITCH background API commands like `reloadxml`, `uuid_kill` and others.

## Installation

Install it with `npm` or `yarn` from Github:

```
yarn add https://github.com/matteolc/modesl-wrapper.git
```

## Usage

Import and create a new ESL wrapper instance:

```
import { ESLWrapper, FSEvent, createESLWrapper } from 'modesl-wrapper';

const esl = createESLWrapper(ESLWrapper, {
    logger,
    conninfo: {
        host,
        port,
        secret,
    },
    cblist,
    savelist,
    loglist,
});

esl.listen();
```

The ESL wrapper accepts the following options:

-   `logger` **required** A logger function that has at least `info`, `debug` and `error` methods
-   `conninfo` **required** ESL connection information
-   `cblist` **optional** A list of callbacks for selected events. Each object in `cblist` must have an `event` and `apply` key. The `event` key indicates which event you would like to apply the function defined in the `apply` key. For instance:

```
import { FSEvent } from 'modesl-wrapper';

function doSomething(event: any) {
    logger.debug(JSON.stringify(event));
}

cblist = [
    {
        event: FSEvent.Channel.HEARTBEAT,
        apply: doSomething,
    },
]

```

-   `savelist` **optional** A list of events that you would like to save as JSON to file. Files will be saved in the `data/esl` folder of your project root, divided by year, month, day and hour. For instance:

```
savelist = [FSEvent.Channel.HANGUP_COMPLETE]
```

-   `loglist` **optional** A list of events that you would like to log with the `logger` provided. For instance:

```
loglist = [FSEvent.Channel.HANGUP_COMPLETE]
```

## Available Commands

-   `ReloadXML`
-   `UUIDGetVar`
-   `UUIDKill`
-   `UUIDTransfer`
-   `UUIDSetvarMulti`
-   `UUIDSetvar`

## License

This library is distributed under the [MIT](https://opensource.org/licenses/MIT) license.
