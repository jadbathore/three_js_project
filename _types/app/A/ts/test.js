import { CompilerWatchSubject, ObserverWatch } from '../../oberserver/oberserver';
import Compiler from '../js/compiler';
const Subject = new CompilerWatchSubject();
const Observer = new ObserverWatch('/');
const compiler = new Compiler(Observer, Subject);
compiler.compile();
