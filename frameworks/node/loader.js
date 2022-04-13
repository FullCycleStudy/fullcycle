import server from './config/server.js'
import logger from './config/logger.js'
import openedRouter from './config/openedRouter.js'

logger(server);
openedRouter(server);