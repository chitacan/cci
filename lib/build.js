const {format, formatDate} = require('./utils');

module.exports = class Build {
  constructor() {
    this._count = 0;
  }

  update(props) {
    this._status = props.status;
    this._authorName = props.author_name;
    this._buildNum = props.build_num;
    this._subject = props.subject;
    this._lifeCycle = props.lifecycle;
    this._buildTime = props.build_time_millis;
    this._startTime = props.start_time;
    this._sha1 = props.vcs_revision;
    this._sha1Short = props.vcs_revision.slice(0, 6);
    return this;
  }

  status() {
    switch (this._status) {
      case 'retried':
        return this._status.black.bgMagenta;
      case 'failed':
      case 'infrastructure_fail':
        return this._status.black.bgRed;
      case 'timeout':
      case 'canceled':
      case 'not_run':
      case 'not_running':
      case 'no_tests':
        return this._status.grey;
      case 'queued':
      case 'scheduled':
        return this._status.black.bgMagenta;
      case 'fixed':
        return this._status.black.bgYellow;
      case 'success':
        return this._status.black.bgGreen;
      case 'running':
        return this._status.black.bgCyan;
    }
  }

  lifeCycle() {
    switch (this._lifeCycle) {
      case 'queued':
      case 'scheduled':
        return this._lifeCycle.black.bgMagenta;
      case 'not_run':
      case 'not_running':
        return this._lifeCycle.grey;
      case 'running':
        return this._lifeCycle.black.bgCyan;
      case 'finished':
        return this._lifeCycle.grey;
    }
  }

  count() {
    this._count = this._count + 1;
    return this._count;
  }

  buildNum() {
    return `#${this._buildNum}`.grey;
  }

  buildTime() {
    if (this._buildTime === null) {
      return '-'.grey;
    }
    return format(this._buildTime).grey;
  }

  startTime() {
    return formatDate(this._startTime).grey;
  }

  /* eslint max-len: 0 */
  oneLiner() {
    return `${this.buildNum()} ${this.status()} ${this._sha1Short} ${this.buildTime()} ${this.startTime()}`;
  }
};
