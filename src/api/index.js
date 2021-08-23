import request from 'request';
import { SLACK_API_URL } from '../helper/constants';

const { Promise } = require('core-js');
const baseUrl = SLACK_API_URL;
// TODO :: create request interceptor to avoid passing baseUrl on every request

const get = async (uri, token) => new Promise((resolve, reject) => {
  request.get(`${baseUrl}${uri}`, {
    qs: { token }
  }, (_, response) => {
    const res = JSON.parse(response.body);
    handleResponse(res, resolve, reject);
  });
});

const post = (uri, data) => new Promise((resolve, reject) => {
  request.post(`${baseUrl}${uri}`, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${data.token}`
    },
    body: JSON.stringify(data.body)
  },
  (_, response) => {
    const res = JSON.parse(response.body);
    handleResponse(res, resolve, reject);
  });
});

const handleResponse = (res, resolve, reject) => {
  if (res.hasOwnProperty('error')) {
    reject(res);
  } else {
    resolve(res);
  }
}

export {
  get, post
};
