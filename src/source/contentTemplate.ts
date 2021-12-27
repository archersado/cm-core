import { errorFactory, CmError } from '../utils/error';
import { NodeVM, VMScript } from 'vm2';
import mjml2html = require('mjml');
import * as _ from 'lodash';
import renderTpl from '../utils/nunjuckEnv';

export interface IContentTypeRunTime {
  parse(tpl: string, context: {[key:string]: any}): any
}

export interface IContentTemplate {
  name: string;
  code: string;
  templateSchema: string;
  parser?: string;
}

export default class ContentTemplate implements IContentTemplate, IContentTypeRunTime {
  name: string;
  code: string;
  templateSchema: string;
  parser?: string;

  constructor(contentTemplate: IContentTemplate) {
    const { name, code, templateSchema, parser } = contentTemplate;
    this.name = name;
    this.code = code;
    this.templateSchema = templateSchema;
    this.parser = parser;

    return this;
  }
  parse(tpl: string, context: {[key:string]: any}): any {
    try { 
      if (this.parser) {
        const sandbox = {
          utils: _,
          renderTpl,
          mjml2html
        };
        const vm = new NodeVM({
          sandbox,
        });
        const script = new VMScript(this.parser, 'sandbox.js');
        const functionInSandbox = vm.run(script);
    
        return functionInSandbox(tpl, context);
      }

      try {
        return JSON.parse(tpl);
      } catch (e) {
        return tpl as any;
      };
    } catch (e) {
      throw errorFactory(`生成消息内容失败，内容类型为: ${this.name}, 内容模板为: ${tpl} 请检查消息模板! 
        detail: ${e.message || e}`, CmError.PRODUCE_MSG_CONTENT_FAIL);
    }
  }
}