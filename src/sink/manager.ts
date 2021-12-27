
import Manager from '../core/manager';
import Context from '../context';

export interface IReceiver<T> {
  type: string;
  receivers: T[];
}
export default class ReceiverManager extends Manager<IReceiver<any>> {
  constructor(ctx: Context) {  
    super(ctx)
    return this;
  };
}
