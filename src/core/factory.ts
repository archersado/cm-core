import Context from '../context';
import { IModel, IService } from 'egg';
import { errorFactory, CmError } from '../utils/error'
import { IReceiver } from '../sink/manager';
import { IContentTemplate } from '../source/contentTemplate';
import StrategyManager, { IStrategyProtocol } from '../strategy/manager';
import { IChannel } from '../channel/manager';
import Message from '../source/message';
export type Factory<T> = { new(...any): T };

export interface IMessageDto {
  title: string;
  sender: any;
  receiver: IReceiver<any>;
  context: { [key: string]: any};
  contentTemplate: IContentTemplate;
  template: string;
  strategies: IStrategyProtocol[];
  channels: IChannel[];
  // 应用信息
  app: any;
}

export default class Manager {
  ctx: Context;
  manager: Map<string, any>;
  core: Map<string, any>;
  constructor(ctx: Context) {
    this.ctx = ctx;
    this.core = new Map();
    this.manager = new Map();
  }

  registerManager<T>(type: string, managerCls: Factory<T>, model?: IModel | IService | string ): T {
    if (this.manager.has(type)) {
      throw errorFactory(` Manager:${type}已被注册!不能重复注册!`, CmError.VALIDATE_FAIL);
    }
    const instance: T = new managerCls(this.ctx, model);
    this.manager.set(type, instance);

    return instance;
  }

  registerCore<T>(type: string, cls: Factory<T>): Factory<T> {
    if (this.core.has(type)) {
      throw errorFactory(` Core:${type}已被注册!不能重复注册!`, CmError.VALIDATE_FAIL);
    }
    this.core.set(type, cls);

    return cls;
  }

  getManager (type: string) {
    if (!this.manager.has(type)) {
      throw errorFactory(` Manager:${type}不存在`, CmError.VALIDATE_FAIL);
    }

    return this.manager.get(type);
  }

  getCore (type: string) {
    if (!this.core.has(type)) {
      throw errorFactory(` Core:${type}不存在`, CmError.VALIDATE_FAIL);
    }

    return this.core.get(type);
  }

  async run(messageDto: IMessageDto) {
    const { context, title, sender, receiver, contentTemplate: contentTemplateDto, template, strategies, channels } = messageDto
    const { type, receivers } = receiver;
    const receiverManager = this.getManager('receiver') as any;
    const receiverImpl = receiverManager.get(type)
    const finalReceivers = receiverImpl.parse(receivers);
    const contentTemplateImpl = this.getCore('contentTemplate');
    const contentTemplate = new contentTemplateImpl(contentTemplateDto);
    const strategyManager = this.getManager('strategy') as StrategyManager;
    const message = new Message(context)
      .from(sender)
      .receiver(finalReceivers) 
      .source(title, contentTemplate, template)

    const transformedMessage = strategyManager.run(strategies, message);
    const channelManager = this.getManager('channel');

    for (const channel of channels) {
      await channelManager.run(channel, transformedMessage);
    }

    return message.id;
  }
}