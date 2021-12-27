import Manager from '../core/manager';
import Strategy from './index';
import { IBatchLifeCycle, IRuntime } from '../core/base';

export enum StrategyType {
  PRIORITY = 'priority',
  FATIGUE = 'fatigue',
  FREQUENCY = 'frequency',
}
export interface IStrategyProtocol {
  type: StrategyType;
  protocol: any, 
}

export default class StrategyManager extends Manager<Strategy<any>> implements IBatchLifeCycle<IStrategyProtocol>, IRuntime<IStrategyProtocol[]> {
  static title = '策略';
  static code = 'strategy';

  public async create(strategy: IStrategyProtocol[], options = {}): Promise<IStrategyProtocol[]> {
    const ret: IStrategyProtocol[] = [];
    for (const item of strategy) {
      const{ type, protocol } = item;
      const strategyImpl = this.get(type);
      const record = await (strategyImpl as any).create(protocol, options);
      const parsed = { protocol: record.dataValues, type };
      ret.push(parsed);
    }

    return ret;
  }

  public async update(strategy: IStrategyProtocol[], options = {}): Promise<IStrategyProtocol[]> {
    const ret: IStrategyProtocol[] = [];
    for (const item of strategy) {
      const{ type, protocol } = item;
      const strategyImpl = this.get(type);
      const record = await (strategyImpl as any).update(protocol, options);
      const parsed = { protocol: record.dataValues, type };
      ret.push(parsed);
    }
    return ret;
  }

  public async destroy(strategy: IStrategyProtocol[], options = {}): Promise<boolean> {
    for (const item of strategy) {
      const{ type, protocol } = item;
      const strategyImpl = this.get(type);
      const { id } = protocol;
      await (strategyImpl as any).destroy(id, options);
    }
    return true;
  }

  public async getByType(type, searchParam, options): Promise<IStrategyProtocol|IStrategyProtocol[]> {
    const strategyImpl = this.get(type);
    const { id } = searchParam;
    if (id) {
      const target: IStrategyProtocol = await (strategyImpl as any).getById(id, options);
      return {
        type,
        protocol: target,
      };

    } else {
      const list: IStrategyProtocol[] = await (strategyImpl as any).getAll(searchParam, options);

      return list.map(el => ({
        type,
        protocol: el,
      }));
    }
  }

  public async getMeta(searchParam, options): Promise<IStrategyProtocol[]> {
    let ret: IStrategyProtocol[] = [];
    for (const [ type, cls ] of this.entity) {
      const { id } = searchParam;
      let item;
      if (id) {
        item = await (cls as any).getById(id, options);
      } else {
        item = await (cls as any).getAll(searchParam, options);
      }
      const normalized = item.map(el => ({
        type,
        protocol: el,
      }));

      ret = [ ...ret, ...normalized ];
    }

    return ret;
  }

  // TODO: 增加runtime策略处理优先级定义 考虑职责链
  public async run(strategy: IStrategyProtocol[], messageVo): Promise<any> {
    try {
      let message = messageVo;
      const filtered = strategy
        .filter(el => {
          const impl = this.get(el.type);

          return !!(impl as any).run;
        })
      for (const item of filtered) {
        const{ type, protocol } = item;
        // FIXME: fix type
        const strategyImpl = this.get(type) as any;
        message = await strategyImpl.run(protocol, message);
      }
      return message;
    } catch (e) {
      this.ctx.logger.error(`StrategyManager run strategy error, detail: ${e.message || e}`);
      throw e;
    }
  }
}
