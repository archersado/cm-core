// TODO: Node v14支持了原生模块crypto 若升级alinode v6 可以切换为原生模块
// 社区模块已经不再维护
import { createHash } from 'crypto';
import uuidv4 = require('uuid/v4');
export const uuid = () => {
  const md5 = createHash('md5');

  return md5.update(uuidv4()).digest('hex');
};
