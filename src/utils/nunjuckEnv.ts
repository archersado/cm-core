import nunjucks = require('nunjucks');
import nunjucksDate = require('nunjucks-date');
const env = new nunjucks.Environment();
nunjucksDate.setDefaultFormat('YYYY-MM-DD HH:mm:ss');
nunjucksDate.install(env);

export default (tpl: string, context: {[key: string]: any}) => {
  return env.renderString(tpl, context);
};
