
import Context from '../context';
import Base from '../core/base';
export interface IReceiverRuntim<T> {
  parse(receivers: T[]): Promise<string[]>;
}

export default abstract class Receiver extends Base {
  static code;
  static title;
  constructor(ctx: Context) {
    super(ctx);
  };
}

