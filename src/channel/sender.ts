import Base from '../core/base';
import Message from '../source/message';

export interface IChannelRuntime {
  // 将消息vo转换成ChannelVo
  transformer: (messageVo: Message) => any | Promise<any>;
  // 消息推送服务
  send: (channelVo: any, token: any) => Promise<any>;
}

export default abstract class ChannelSender extends Base implements IChannelRuntime {
  public channelVo: {[key: string]: any};
  constructor(ctx) {
    super(ctx)

    return this;
  }

  // 消息vo 2 推送vo的转换器
  public transformer (messageVo: Message): any {
    return messageVo;
  }

    // 推送服务
  public async send(_pushVo: any, _token?: any): Promise<any> {
    return true;
  }
}








