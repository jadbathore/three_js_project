import { router } from "../../route/routeur.js";
import { Context, ServerStrategy } from '../../strategy/strategyServer.js';
import { rollupWatchConfig } from "../../CompilerSetUp/Compiler.js";
rollupWatchConfig();
const context = new Context(new ServerStrategy(router));
context.runServer();
