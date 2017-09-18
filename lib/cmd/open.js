const {Subscriber} = require('rxjs');
const opn = require('opn');
const {resolveRepo$, wrap} = require('../utils');

exports.run = ($) => $.mergeMap(() => resolveRepo$());

exports.subscriber = Subscriber.create(({user, repo, branch})=> {
  branch ?
    opn(`https://circleci.com/gh/${user}/${repo}/tree/${branch}`) :
    opn(`https://circleci.com/gh/${user}/${repo}`);
  process.exit(0);
}, (e) => {
  console.log(wrap(`  ${e.message.red}`));
});
