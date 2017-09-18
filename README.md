# cci

useful **c**ircle**ci** rest [api](https://circleci.com/docs/api/v1-reference/) shortcuts.

## install

```
$ npm install -g cci
```

## commands

### login

add [api token](https://circleci.com/docs/api/v1-reference/#getting-started) for this app.

### logout

delete api token.

### show

output circleci status related branch. without branch, `cci` will resolve it with **current working directory** or **branch**.

```shell
$ cci show working-1
# cci will print recent build result in 'working-1' branch
```

```shell
$ pwd
.../working-2
$ cci show
# cci will print recent build result in 'working-2' branch
```

```shell
$ git branch
* working-3
$ cci show
# cci will print recent build result in 'working-3' branch
```

### insight

output recent build results.

### open

open circleci dashboard in default browser.

## see how it works

![demo](https://raw.githubusercontent.com/chitacan/cci/master/img/demo.gif)

## License

MIT © Kyungyeol Kim
