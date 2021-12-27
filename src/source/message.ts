import * as _ from 'lodash';
import renderTpl from '../utils/nunjuckEnv';
import ContentTemplate from './contentTemplate';
import { IStrategyProtocol } from '../strategy/manager';
import { uuid } from '../utils';

export interface Sender {
  name: string;
  openAccountId: string;
  workNumber?: number;
  groupCompanyUserId?: string;
  merchantCode?: string;
}

export default class Message {
  // 消息所属应用
  public app: any;
  // 消息实例id
  public id: string;
  // 消息发送者
  public sender: Sender;
  // 消息标题
  public title: string;
  // 消息创建时间
  public gmtCreate: Date;
  // 消息接收者
  public receivers: string[];
  // 原始消息模板
  public template: string;
  // 消息所用内容模板
  public contentTemplate: ContentTemplate;
  // 消息内容
  public content: any;
  // 消息策略
  public strategy: IStrategyProtocol[];
  // 业务上下文
  public context: { [key: string]: any };


  constructor (context) {
    this.id = uuid();
    this.gmtCreate = new Date();
    this.context = context;
    
    return this;
  }

  from(sender: string) {
    const { sender: contextSender = {} } = this.context;
    const { name, openaccountId, openAccountId, merchantCode, workNumber, groupCompanyUserId } = contextSender;
    this.sender = {
      name,
      openAccountId: sender || openaccountId || openAccountId,
      merchantCode,
      workNumber,
      groupCompanyUserId,
    };

    return this;
  }

  receiver(receivers: string[]) {
    this.receivers = receivers;

    return this;
  }
  

  source (title: string, contentTemplate: ContentTemplate, template: string) {
    this.title = renderTpl(title, this.context);
    this.content = contentTemplate.parse(template, this.context);
    this.contentTemplate = contentTemplate;
    return this;
  }

}
