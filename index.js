require('colors');
const {Observable} = require('rxjs');
const cmd = require('commander');
const {version, description} = require('./package');
const show = require('./lib/cmd/show');
const login = require('./lib/cmd/login');
const insight = require('./lib/cmd/insight');
const open = require('./lib/cmd/open');

cmd.version(version)
  .description(description);

cmd.command('open')
  .alias('o')
  .description('open circleci dashboard in default browser')
  .action(() => {
    Observable.of(null)
      .let(open.run)
      .subscribe(open.subscriber);
  });

cmd.command('login')
  .alias('l')
  .description('login')
  .action(() => {
    Observable.of(null)
      .let(login.run)
      .subscribe(login.subscriber);
  });

cmd.command('show [branch]')
  .alias('s')
  .option('-w --watch', 'watch recent circleci status')
  .description('output circleci status related branch')
  .action((branch, {watch}) => {
    Observable.of({branch, watch})
      .let(show.run)
      .subscribe(show.subscriber);
  });

cmd.command('insight')
  .alias('i')
  .option('-a --all', 'show recent 30 build results')
  .description('output recent build results')
  .action(({all}) => {
    Observable.of({all})
      .let(insight.run)
      .subscribe(insight.subscriber);
  });

cmd.command('*').action(() => cmd.help());

cmd.parse(process.argv);

if (!cmd.args.length) cmd.help();


