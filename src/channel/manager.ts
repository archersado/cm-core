import Manager from '../core/manager';
import Message from '../source/message';
import retry = require('async-retry');
import { IModel, IService } from 'egg';
import { errorFactory, CmError } from '../utils/error';
import { IRuntime, ILifeCycle, ISearch } from '../core/base';
import ChannelSender from './sender'
import * as is from 'is-type-of';

const DEFAULT_CONFIG = { 
  retries: 3,
  minTimeout: 100,
  maxTimeout: 500,
}
export interface IChannel {
  name: string;
  code: string;
  description: string;
}

export default class ChannelManager extends Manager<ChannelSender> implements ILifeCycle<IChannel>, ISearch<IChannel>, IRuntime<IChannel> {
  static title = '信道';
  protected persistence: IModel | IService;
  static code = 'channel';

  constructor(ctx, model: IModel | IService) {
    super(ctx, model);
  }

  private async getToken(channelCode: string, appId: string) {
    if (!this.persistence) throw errorFactory(`信道服务必须注册获取授权的方法!`, CmError.VALIDATE_FAIL)
    return await (this.persistence as any).getAuthority(channelCode, appId);
  }

  public async getById(id: number, options?): Promise<IModel|IChannel> {
    return await this.persistence.findByPk(id, options || {});
  }

  public async getAll(searchOptions?): Promise<IModel[]|IChannel[]> {
    return await this.persistence.findAll(searchOptions || {});
  }

  public async destroy(id: number, options?): Promise<boolean> {
    const exists: any = await this.getById(id);

    await exists.destroy(options);  
    return true
  }

  public async create(instance: IChannel, options?): Promise<IModel|IChannel> {
    return await this.persistence.create(instance, options);    
  }

  public async update(instance: IChannel, options?): Promise<IModel|IChannel> {
    const { id } = instance as any;
    if (!id) throw errorFactory(`更新必须带有id!`, CmError.VALIDATE_FAIL);
    const exists: any = await this.get(id);
    if (!exists) throw errorFactory(`实体不存在!`, CmError.NOT_FOUND);

    return await exists.update(instance, options);
  }

  public async run (channel: IChannel, messageVo: Message, options?) {
    const { code, name } = channel;
    const { id, app } = messageVo;
    const { ctx } = this;
    const sendConfig = options || DEFAULT_CONFIG;
    const channelImpl = this.get(code);
    try {
      if (is.asyncFunction(channelImpl.transformer)) {
        channelImpl.channelVo = await channelImpl.transformer(messageVo);
      } else {
        channelImpl.channelVo = channelImpl.transformer(messageVo);
        ctx.logger.info(`消息Channel Vo生成成功, messageId: ${id} 输入messageVo: ${JSON.stringify(messageVo)}, 
          输出channelVo: ${JSON.stringify(channelImpl.channelVo)}`);
      }
    } catch (e) {
      throw errorFactory(`生成消息Channel Vo失败, detail: ${e.message || e}`, `${CmError.PRODUCE_CHANNEL_VO_FAIL}`);
    }
    const token = await this.getToken(code, app.code);
    const result = await retry(async _bail => {
      try {
        const ret = await channelImpl.send(channelImpl.channelVo, token);

        ctx.logger.info(`推送${name}结果, messageId: ${id}, 输入: ${JSON.stringify(channelImpl.channelVo)}, 
          输出${JSON.stringify(ret)}`);

        return ret;
      } catch (e) {
        throw errorFactory(`推送${name}失败, detail: ${e.message || e}`, `ERR_SEND_${code.toUpperCase()}`);
      }
    }, {
      ...sendConfig,
      onRetry: (err, num) => {
        ctx.logger.error(`发送失败 重试第${num}次, error detail: ${err}`);
      },
    });

    return { ...result, id } ;
  }
}
