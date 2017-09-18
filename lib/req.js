const axios = require('axios');
module.exports = axios.create({
  baseURL: 'https://circleci.com/api/v1.1',
  headers: {
    Accept: 'application/json',
  },
});

