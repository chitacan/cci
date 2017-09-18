const {Subscriber} = require('rxjs');
const _ = require('lodash');
const {spinner, resolveRepo$, spark, wrap} = require('../utils');
const req = require('../req');
const {getToken$} = require('../conf');

exports.run = ($) =>
  $
  .do(() => spinner.start())
  .combineLatest(resolveRepo$(), getToken$(), (opt, repo, token) => {
    return Object.assign(repo, {opt, token});
  })
  .mergeMap(({opt, user, repo, token, branch}) => {
    const path = opt.all ?
      `project/github/${user}/${repo}` :
      `project/github/${user}/${repo}/tree/${branch}`;
    return req.get(path, {
      params: {
        'circle-token': token,
      },
    });
  })
  .map((res) => res.data)
  .do((data) => {
    if (data.length === 0) {
      throw new Error('no builds');
    }
  })
  .map((builds) => {
    return _.chain(builds)
      .map(({build_time_millis, status}) => {
        return {value: build_time_millis || 0, status};
      })
      .reverse()
      .value();
  })
  .map((result) => spark(result))
  .do(() => spinner.stop(), () => spinner.stop());

exports.subscriber = Subscriber.create(({spark, min, max, mean, rate})=> {
  console.log(wrap(`  ${spark} ${min} ${max} ${mean} ${rate}`));
}, (e) => {
  console.log(wrap(`  ${e.message.red}`));
});
