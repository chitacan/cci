const {Observable, Subscriber} = require('rxjs');
const {prompt} = require('inquirer');
const {spinner, wrap} = require('../utils');
const {conf} = require('../conf');
const req = require('../req');

exports.run = ($) =>
  $
  .switchMap(() => {
    const save$ = Observable.defer(() => prompt([
      {type: 'token', name: 'token', message: 'enter circleci token'},
    ]))
    .switchMap(({token}) => check$(token));

    const check$ = (token) => {
      return Observable.of(token)
        .do(() => spinner.start())
        .switchMap((token) => {
          return Observable
            .fromPromise(req.get('me', {params: {'circle-token': token}}))
            .map((res) => res.data.name)
            .do((name) => {
              if (!name) {
                throw new Error({message: `Cannot login with token: ${token}`});
              }
            });
        }, (token, name) => ({token, name}))
        .do(({token}) => {
          conf.set('token', token);
          spinner.stop();
        }, () => {
          conf.delete('token', token);
          spinner.stop();
        });
    };

    const token = conf.get('token');
    return token ? check$(token) : save$;
  });

exports.subscriber = Subscriber.create(({name}) => {
  console.log(wrap(` Logged in as ${name.green}`));
}, (e) => {
  console.log(wrap(`  ${e.message.red}`));
});
