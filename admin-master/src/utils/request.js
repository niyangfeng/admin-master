// 因接口跨域，故无法拿到错误状态码
// const codeMessage = {
//   200: '服务器成功返回请求的数据。',
//   201: '新建或修改数据成功。',
//   202: '一个请求已经进入后台排队（异步任务）。',
//   204: '删除数据成功。',
//   400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
//   401: '用户没有权限（令牌、用户名、密码错误）。',
//   403: '用户得到授权，但是访问是被禁止的。',
//   404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
//   406: '请求的格式不可得。',
//   410: '请求的资源被永久删除，且不会再得到的。',
//   422: '当创建一个对象时，发生一个验证错误。',
//   500: '服务器发生错误，请检查服务器。',
//   502: '网关错误。',
//   503: '服务不可用，服务器暂时过载或维护。',
//   504: '网关超时。',
// };
import md5 from 'js-md5';
import { Base64 } from 'js-base64';
import router from 'umi/router';
import { notification } from 'antd';
import axios from 'axios';
import { createBody } from './params';

// const isTest = APP_ENV !== 'prod'; // eslint-disable-line no-undef
// const baseUrl = BASE_API; // eslint-disable-line no-undef
const isTest = true; // eslint-disable-line no-undef
// eslint-disable-next-line no-undef
const baseUrl = BASE_API;
const salt = '';

class HttpRequest {
  constructor() {
    this.options = {
      method: 'post',
      url: '',
      data: {},
      errToast: true,
    };
    this.token = localStorage.getItem('token') || '';
    this.checkToken();
  }

  checkToken() {
    // 如果没有token、中断请求并跳转到login
    const pathname = ['/login'];
    const thisPathname = window.location.pathname;
    if (this.token === '' && !pathname.includes(thisPathname)) {
      return new Promise((resolve, reject) => {
        reject(
          router.replace({
            pathname: '/login',
            query: {
              redirect: thisPathname,
            },
          }),
        );
      });
    }
    return '';
  }

  // 签名
  sign(body, timestamp) {
    const str = Object.keys(body)
      .sort()
      .reduce((sum, next) => sum + next + body[next], '')
      .replace(/\s/g, '');
    const sign = md5(Base64.encode(String(timestamp)) + this.token + salt + str);
    return sign;
  }

  consoleErr(res) {
    if (!isTest) return;
    // 控制台打印报错信息
    const body = {
      ...this.options.body,
      timestamp: this.options.timestamp,
    };
    console.error('请求URL: ', baseUrl + this.options.url);
    console.error('请求参数：');
    console.error(JSON.stringify(body, null, 2));
    console.error('接口返回：');
    console.error(JSON.stringify(res, null, 2));
  }

  handleResponse(res) {
    // token失效
    if (res.code === 10004) {
      notification.error({
        message: '登录已过期，请重新登录',
      });
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      router.replace({
        pathname: '/login',
        query: {
          redirect: window.location.pathname,
        },
      });
      return false;
    }
    if (res.code !== 0) {
      if (res && this.options.errToast) {
        window.setTimeout(
          notification.error({
            message: res.message,
            description: res.exception,
          }),
          0,
        );
        // this.consoleErr(res, this.options);
      }
      return Promise.resolve(res);
    }
    return Promise.resolve(res);
  }

  // 请求拦截
  interceptors(instance) {
    // 添加响应拦截器
    instance.interceptors.response.use(
      res => {
        if (res.headers['content-type'] && res.headers['content-type'].match('excel')) {
          return Promise.resolve(res);
        }
        const { data } = res;
        return this.handleResponse(data);
      },
      // error => Promise.reject(error),
      err => {
        console.log('接口超时');
        const response = {'data': {'code': -1}}
        return response
      }
    );
  }

  // 创建实例
  create() {
    const timestamp = ~~(+new Date() / 1000); // eslint-disable-line no-bitwise
    const conf = {
      baseURL: baseUrl,
      timeout: 30000,
      ...this.options.data.config,
      headers: {
        timestamp,
        signature: this.sign(this.options.data, timestamp),
        token: this.token,
        ...createBody(),
      },
    };
    // 上传 multipart/form-data 类型数据
    if (this.options.type === 'form-data') {
      conf.headers['Content-Type'] = 'multipart/form-data';
    }
    return axios.create(conf);
  }

  // 请求实例
  request(options) {
    // 合并请求参数
    this.options = {
      ...this.options,
      ...options,
      data: {
        ...this.options.data,
        ...options.body,
      },
    };

    // FormData类型不支持解构
    if (options.type === 'form-data') {
      this.options.data = options.body;
    }

    // 不需要解构
    if (options.type === 'normal') {
      this.options.data = options.body;
    }

    const instance = this.create();
    this.interceptors(instance, options.url);
    return instance(this.options);
  }
}

function http(obj) {
  return new HttpRequest().request(obj);
}

export default http;
