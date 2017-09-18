const Conf = require('conf');
const {Observable} = require('rxjs');

exports.conf = conf = new Conf();

exports.getToken$ = () => {
  return Observable.create((subs) => {
    const token = conf.get('token');
    if (token) {
      subs.next(token);
      subs.complete();
    } else {
      subs.error({message: 'no token. try "cci login" first.'});
    }
  });
};
