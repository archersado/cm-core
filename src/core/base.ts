import { IModel, IService } from 'egg';
import Message from '../source/message';
import * as is from 'is-type-of';
import * as sequelize from 'sequelize';
import Context from '../context';

declare module 'egg' {
  interface IModel extends sequelize.Sequelize, PlainObject {}
  export interface Application {
    [key: string]: any;
  }
}

export interface ISearch<T> {
  getById(id: number, options?): Promise<T|IModel>;
  getAll(searchOptions?): Promise<T[]|IModel[]>;
}

export interface ILifeCycle<T> {
  create(instance: T, options?): Promise<T|IModel>;
  update(instance: T, options?): Promise<T|IModel>;
  destroy(id: number): Promise<boolean>;
}

export interface IBatchLifeCycle<T> {
  create(instances: T[], options?): Promise<T[]|IModel[]>;
  update(instances: T[], options?): Promise<T[]|IModel[]>;
  destroy(instances: T[]): Promise<boolean>;
}

export interface IRuntime<T> {
  run(entity: T, messageVo: Message, options?): Promise<any>;
}

export default abstract class Base {
  protected ctx: Context;
  protected persistence: IModel | IService | string | undefined;

  constructor(ctx: Context, model?: IModel | IService | string) {
    this.ctx = ctx;

    if (is.string(model)) {
      this.persistence = ctx.model[model as string];
    } else {
      this.persistence = model;
    }

    return this;
  };
}

