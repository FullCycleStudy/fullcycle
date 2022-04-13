import debug from 'debug';
import enviromentLibrary from '../packages/enviromentLibrary.js';

const log = debug('api:main');

debug.log = console.info.bind(console);
console.log(`DEBUG: ${process.env.DEBUG_ENABLE}`);

export default (server) => {
    console.log(process.env.DEBUG_ENABLE);
    if (process.env.DEBUG_ENABLE == "true") {
        server.use((req, res, next) => {
            log(enviromentLibrary.requestDetail(req));
            next();
        });
    } else {
        debug.disable();
    }
};