<p align="center">
<b style="font-size: 32px;line-height: 32px;">A Cloud Message Architecture Based on Nodejs</b>
<br />
<br />
<br />
<em>make it easy to build a cloud message system.</em>
<br />
<br />



# install

```shell
npm i @hset/cm-core
```

# How to use 

``` typescript
import { Manager, StrategyManager, IMessageDto, Message, Context,
  ChannelManager, ContentTemplate } from '@hset/cm-core';

// 
const hcmMiddleware = {
};
// 注入上下文
const ctx = {
}

const cmManager = new Manager(new Context(ctx));
// 消息内容模板注册
cmManager.registerCore<ContentTemplate>('contentTemplate', ContentTemplate);
// 消息策略容器注册
const strategyManager = cmManager.registerManager<StrategyManager>('strategy', StrategyManager);
// 消息信道容器注册
const channelMananger = cmManager.registerManager<ChannelManager>('channel', ChannelManager);
// register your strategy
// strategyManager.register('fatigue', Fatigue, NoticeFatigueStrategy);


// register your channel
// /channelMananger.register(code, impl);

// send your message
// const messageDto: IMessageDto = {
//   sceneName,
//   app: appInfo,
//   title,
//   sender: sceneSender || sender,
//   receiver,
//   context,
//   contentTemplate,
//   template,
//   strategies: strategyList,
//   channels,
// };

// await cmManager.run(messageDto);

```

