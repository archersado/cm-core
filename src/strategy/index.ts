import Base, { ILifeCycle } from '../core/base';
import Context from '../context';
import { IModel } from 'egg';
import { errorFactory,  CmError } from '../utils/error';
import { ISearch } from '../core/base';

export interface IStrategy {
  id?: number;
}

export default abstract class Strategy<T> extends Base implements ILifeCycle<T>, ISearch<T> {
  protected persistence: IModel;
  constructor(ctx: Context, model: IModel) {
    super(ctx, model);
    return this;
  };
  
  public async getById(id: number, options?): Promise<IModel|T> {
    return await this.persistence.findByPk(id, options || {});
  }

  public async getAll(searchOptions?): Promise<IModel[]|T[]> {
    return await this.persistence.findAll(searchOptions || {});
  }

  public async destroy(id: number, options?): Promise<boolean> {
    const exists: any = await this.getById(id);

    await exists.destroy(options);  
    return true
  }

  public async create(instance: T, options?): Promise<IModel|T> {
    return await this.persistence.create(instance, options);    
  }

  public async update(instance: T, options?): Promise<IModel|T> {
    const { id } = instance as any;
    if (!id) throw errorFactory(`更新必须带有id!`, CmError.VALIDATE_FAIL);
    const exists: any = await this.getById(id);
    if (!exists) throw errorFactory(`实体不存在!`, CmError.NOT_FOUND);

    return await exists.update(instance, options);
  }
}

