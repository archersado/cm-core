import { Context as AppContext, IModel, IService, Application } from 'egg';
import { errorFactory, CmError } from '../utils/error';

export default class Context {
  app: Application;
  Middleware: { [keys: string]: any };
  model: { [keys: string]: IModel };
  logger: any;
  service: IService;
  curl: any;
  runInBackground: any;

  protected get middlewareDep() {
    return [];
  }

  constructor(ctx: AppContext) {  
    const Middleware = ctx.Middleware || ctx.app.Middleware;

    // TODO： 中间件的使用也应该依赖倒置 依赖缓存和定时调度能力
    this.checkDep(Middleware, this.middlewareDep);
    this.logger = {
      info: v => ctx.logger.info(`[ CORE INFO] ${v}`),
      error: v => ctx.logger.info(`[ CORE ERROR] ${v}`),
    };
    // 遍历所有
    for (const property in ctx) { 
      this[property] = ctx[property];
    };

    this.Middleware = Middleware;

    return this;
  };

  // TODO： 中间件的使用也应该依赖倒置
  private checkDep(middleware, depList: string[]) {
    if (!middleware) throw errorFactory(` Base Model 依赖中间件注入, 必须注入Middleware`, CmError.DEPENDENCY_NOT_FOUND);
    for (const dep of depList) {
      if (!middleware[dep]) throw errorFactory(` Base Model 依赖中间件${dep}`, CmError.DEPENDENCY_NOT_FOUND);
    }
  }
}

