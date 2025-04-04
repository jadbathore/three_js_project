import { router } from '../../route/routeur';
import { Context, ServerStrategy } from '../../strategy/strategyServer';
const server = new Context(new ServerStrategy(router));
server.runServer();
