import config from '@/config';
import { log } from '@/utils';
import qs from 'qs';
import axios from 'axios';
// eslint-disable-next-line
const router = new VueRouter();

// 加载最小时间
const MINI_TIME = 300;
// 超时时间
// 环境value
// eslint-disable-next-line
let _isDev = process.env.NODE_ENV === 'development';
// 请求接口host
let _apiHost = config.api;
// 请求组（判断当前请求数）
let _requests = [];

axios.defaults.baseURL = _apiHost;

console.log(axios.defaults);
// 创建一个请求实例
/**
 * 添加请求，显示loading
 * @param {请求配置} config
 */
function pushRequest(config) {
  log(`${config.url}--begin`);
  _requests.push(config);
}

/**
 * 移除请求，无请求时关闭loading
 * @param {请求配置} config
 */
function popRequest(config) {
  log(`${config.url}--end`);
  let _index = _requests.findIndex(r => {
    return r === config;
  });
  if (_index > -1) {
    _requests.splice(_index, 1);
  }
}
/**
 * 错误的处理
 * @param {*} code
 * @param {string} [message='请求错误']
 */
function handlerErr(code, message = '请求错误') {
  switch (code) {
    case 404:
      message = '404,错误请求';
      router.push('/404');
      break;
    case 401:
      if (!_isDev) {
        window.location.href = config.api + '/gic-web/#/';
      }
      message = '登录失效';
      break;
    case 403:
      message = '禁止访问';
      router.push('/403');
      break;
    case 408:
      message = '请求超时';
      break;
    case 500:
      message = '服务器内部错误';
      // router.push('/500')
      break;
    case 501:
      message = '功能未实现';
      break;
    case 503:
      message = '服务不可用';
      break;
    case 504:
      message = '网关错误';
      break;
  }
  // eslint-disable-next-line
  Vue.prototype.$tips({ type: 'warning', message: message });
}

/**
 * 请求地址，请求数据，是否静默，请求方法
 */
const requests = (url, data = {}, contentTypeIsJSON = false, isSilence = false, method = 'POST') => {
  let _opts = { method, url };
  const _query = {};
  let _timer = null;
  if (method.toLocaleUpperCase() === 'POST') {
    if (contentTypeIsJSON) {
      _opts.data = data;
      _opts.headers = { 'Content-Type': 'application/json' };
      _opts.url += '?requestProject=marketing';
    } else {
      _opts.data = qs.stringify(Object.assign({ requestProject: 'gic-web' }, data));
    }
  } else {
    _opts.params = _query;
  }

  return new Promise((resolve, reject) => {
    let _random = { stamp: Date.now(), url: `${_apiHost + url}` };
    if (!isSilence) {
      _timer = setTimeout(() => {
        pushRequest(_random);
      }, MINI_TIME);
    }
    _opts.headers = Object.assign({}, _opts.headers || {}, { sign: localStorage.getItem('sign') }); // 加入自定义请求头
    axios(_opts)
      .then(res => {
        clearTimeout(_timer);
        popRequest(_random);
        if (res.data.errorCode !== 0) {
          reject(res);
          handlerErr(res.data.errorCode, res.data.message);
        } else {
          resolve(res.data);
        }
      })
      .catch(res => {
        clearTimeout(_timer);
        popRequest(_random);
        if (res) {
          handlerErr(res.response.status, '接口异常');
        }
        reject(res);
      });
  });
};

export { axios, requests };
