import { IModel, IService } from 'egg';
import { Factory } from './factory';
import Base from './base';
import { errorFactory,  CmError } from '../utils/error';

export default class Manager<T> extends Base {
  static title: string;
  static code: string;
  protected entity: Map<string, T>;

  constructor(ctx, model?) {  
    super(ctx, model)
    this.entity = new Map();
  };

  private getClass() {
    return this.constructor as any
  }

  register(type: string, cls: Factory<T>, model?: IModel|IService|string) {
    if (this.entity.has(type)) {
      const klass = this.getClass();
      throw errorFactory(`${klass.title}:${type}已被注册!不能重复注册!`, CmError.VALIDATE_FAIL);
    }
    const instance: T = new cls(this.ctx, model);
    this.entity.set(type, instance);
  }

  get(type: string): T {
    const klass = this.getClass();
    if (!this.entity.has(type)) {
      throw errorFactory(`${klass.title}:${type}不存在`, CmError.VALIDATE_FAIL);
    }

    const instance: T | undefined = this.entity.get(type);
    if (!instance) throw errorFactory(`${klass.title}:${type}不存在`, CmError.VALIDATE_FAIL);

    return instance;
  }

  get keys() {
    return [ ...this.entity.keys() ];
  }

  get cls() {
    return [ ...this.entity.values() ];
  }
}
