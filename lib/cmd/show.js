const {Observable, Subscriber} = require('rxjs');
const _ = require('lodash');
const {spinner, resolveRepo$, wrap} = require('../utils');
const Build = require('../build');
const req = require('../req');
const {getToken$} = require('../conf');

const clear = () => {
  process.stdout.moveCursor(0, -1);
  process.stdout.clearLine();
  process.stdout.moveCursor(0, -1);
  process.stdout.clearLine();
  process.stdout.moveCursor(0, -1);
  process.stdout.clearLine();
};

const build$ = Observable.of(new Build());

exports.run = ($) =>
  $.do(() => spinner.start())
    .combineLatest(
      resolveRepo$(),
      getToken$(),
      ({branch, watch}, repo, token) => _.defaults({branch, token, watch}, repo)
    )
    .mergeMap(({user, repo, branch, token, watch}) => {
      const start$ = watch ?
        Observable.timer(0, 10 * 1000) :
        Observable.of(null);
      return start$
        .mergeMap(() =>
          req.get(`project/github/${user}/${repo}/tree/${branch}`, {
            params: {
              'circle-token': token,
              'limit': 1,
              'offet': 0,
            },
          })
        )
        .map((res) => res.data)
        .catch((err) => {
          if (!err.response) {
            throw err;
          }
          switch (err.response.status) {
            case 404:
              throw new Error(
                `Cannot find build ${user}/${repo}/tree/${branch}`
              );
          }
        });
    })
    .do((data) => {
      if (data.length === 0) {
        throw new Error('no builds');
      }
    })
    .map(([build]) => build)
    .combineLatest(build$, (props, build) => build.update(props))
    .do(() => spinner.stop(), () => spinner.stop());

exports.subscriber = Subscriber.create((build) => {
  if (build.count() > 1) {
    clear();
  }
  console.log(wrap(`  ${build.oneLiner()}`));
}, (e) => {
  console.log(wrap(`  ${e.message.red}`));
});
