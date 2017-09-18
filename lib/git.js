const {Observable} = require('rxjs');
const {exec} = require('child_process');
const {EOL} = require('os');
const {parse} = require('url');

const exec$ = Observable.bindNodeCallback(exec);

exports.origin$ = () => {
  return exec$('git remote get-url origin')
    .map(([stdout]) => stdout.split(EOL).join(''))
    .map((url) => url.replace(/\.git$/g, ''))
    .map((url) => parse(url).pathname)
    .map((pathname) => pathname.replace(/^\//, ''))
    .map((pathname) => {
      const [user, repo] = pathname.split('/');
      return {user, repo};
    });
};

exports.branch$ = () => {
  return exec$('git rev-parse --abbrev-ref HEAD')
    .map(([stdout]) => stdout.split(EOL).join(''));
};
