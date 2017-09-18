const {EOL} = require('os');
const {Observable} = require('rxjs');
const {basename, resolve} = require('path');
const ora = require('ora');
const _ = require('lodash');
const moment = require('moment');
const {origin$, branch$} = require('./git');

const CWD = process.cwd();

exports.format = (format) = (millis) => moment.utc(millis).format('mm[m]ss[s]');

exports.formatDate = (date) => moment(date).format('YY/M/D,k:mm');

exports.elapsed = (st) => {
  return moment.utc(moment().diff(st)).format('mm[m]ss[s]');
};

exports.spinner = ora('Loading...');

exports.resolveRepo$ = (user, repo, branch) => {
  return Observable.of({user, repo, branch})
    .do(({user, repo, branch}) => {
      if (!user || !repo || !branch) {
        throw new Error('no initial args');
      }
    })
    .catch(() => {
      return Observable.zip(
        origin$(),
        branch$(),
        (d, branch) => Object.assign({}, d, {branch})
      );
    })
    .catch((e) => {
      const user = basename(resolve(CWD, '..', '..'));
      const repo = basename(resolve(CWD, '..'));
      const branch = basename(CWD);
      return [{user, repo, branch}];
    })
    .catch(() => Observable.throw({
      message: 'Cannot resolve user, repo, branch.',
    }));
};

exports.spark = (data) => {
  const ticks = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
  const finites = data.filter(({value}) => _.isFinite(value));
  const min = _.minBy(finites, 'value').value;
  const max = _.maxBy(finites, 'value').value;
  const mean = _.meanBy(finites, 'value');
  const rate = _.chain(data)
    .map(({status}) => (status === 'success' || status === 'fixed') ? 1 : 0)
    .mean()
    .value() * 100;

  const spark = data
    .map(({value, status}) => {
      if (!_.isFinite(value)) {
        return {tick: ' ', status};
      }

      let index = Math.ceil((value / max) * ticks.length) - 1;

      if (max === 0 || index < 0) {
        index = 0;
      }

      return {tick: ticks[index], status};
    })
    .map(({tick, status}) => {
      switch (status) {
        case 'failed':
        case 'infrastructure_fail':
          return tick.red;
        case 'retried':
        case 'timeout':
        case 'canceled':
        case 'not_run':
        case 'not_running':
        case 'no_tests':
          return tick.grey;
        case 'queued':
        case 'scheduled':
          return tick.magenta;
        case 'fixed':
          return tick.yellow;
        case 'success':
          return tick.green;
        default:
          return tick.black;
      }
    })
    .join('');
    return {
      spark,
      min: `▼${format(min)}`.grey,
      max: `▲${format(max)}`.grey,
      mean: `x̅${format(mean)}`.grey,
      rate: `${rate.toFixed(0)}%`.grey,
    };
};

exports.wrap = (output) => {
  return _.isArray(output) ?
    ['', ...output, ''].join(EOL) :
    ['', output, ''].join(EOL);
};
