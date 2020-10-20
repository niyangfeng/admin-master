import { parse } from 'querystring';
import pathRegexp from 'path-to-regexp';
import { notification } from 'antd';
import { Column } from '@/types/common';
// eslint-disable-next-line import/no-unresolved
// @ts-ignore
import Clipboard from 'clipboard';

/* eslint no-useless-escape:0 import/prefer-default-export:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

export const isUrl = (path: string): boolean => reg.test(path);
export const isAntDesignPro = (): boolean => false;
// export const isAntDesignPro = (): boolean => {
//   if (ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION === 'site') {
//     return true;
//   }
//   return window.location.hostname === 'preview.pro.ant.design';
// };

// 给官方演示站点用，用于关闭真实开发环境不需要使用的特性
export const isAntDesignProOrDev = (): boolean => {
  const { NODE_ENV } = process.env;
  if (NODE_ENV === 'development') {
    return true;
  }
  return isAntDesignPro();
};

export const getPageQuery = () => parse(window.location.href.split('?')[1]);

/**
 * props.route.routes
 * @param router [{}]
 * @param pathname string
 */
export const getAuthorityFromRouter = <T extends { path: string }>(
  router: T[] = [],
  pathname: string,
): T | undefined => {
  const authority = router.find(({ path }) => path && pathRegexp(path).exec(pathname));
  if (authority) return authority;
  return undefined;
};

// 记录登录得token和用户信息
export function setLoginInfo(userInfo: any) {
  localStorage.setItem('token', userInfo.token);
  localStorage.setItem('userInfo', JSON.stringify(userInfo));
  localStorage.setItem('type', '1');
  localStorage.setItem('saleId', userInfo.id);
  localStorage.setItem('departmentId', userInfo.departmentId);
}

// 清除登录用户token和用户信息
export function clearLoginInfo() {
  localStorage.removeItem('token');
  localStorage.removeItem('userInfo');
  localStorage.removeItem('teacherId');
  localStorage.removeItem('teacherName');
  localStorage.removeItem('switchAccount');
}

// 成功弹窗
const success = function(text = '操作成功') {
  notification.success({
    message: text,
  });
};

// 警告弹窗
const warning = function(text = '服务器异常') {
  notification.warning({
    message: text,
  });
};

// 失败弹窗
const error = function(text = '服务器异常') {
  notification.error({
    message: text,
  });
};

// 为每个元素增加空占位符 '-'
const columnFilter = (column: Column[], text: string) => {
  let newColumn = [];
  newColumn = column.map(item => {
    if (!item.render) {
      item.render = (val: any) => {
        if (typeof val === 'string') {
          return val && val.replace(/\s/g, '') ? val : '-';
        }
        if (val === null || val === undefined) {
          return '-';
        }
        return val;
      };
    }
    return item;
  });
  if (text !== 'none') {
    newColumn.unshift({
      title: text || '#',
      key: 'indexOrder',
      className: 'indexOrder',
      render: (a: any, b: any, c: any) => c + 1,
    });
  }
return newColumn;
};

/**
 * 去掉字符传前后的空格(为number类型添加位数设置)
 * @param str（any）
 * @param type (string/可选)
 * @param num (number/可选)
 */
function trim(str: any, type: string, num: number) {
  const r = str.replace(/(^\s*)|(\s*$)/g, '');
  // eslint-disable-next-line eqeqeq
  if (type == 'number') {
    const newStr = r;
    if (newStr.length > num) {
      return newStr.slice(0, num);
    }
    return newStr;
  }
  return r;
}

/**
 * 判断是否是数据类型
 * @param str（any）
 * @param type (string/可选)
 * @param num (number/可选)
 */
function isArray(arr: any) {
  let flag = false
  if (arr.constructor === Array) {
    flag = true
  }
  return flag
}

/**
 * 判断是否为空对象
 */
function isEmptyObject(obj: Object) {
  for (const key in obj) {
    return false;
  }
  return true;
}

/**
 * 定义替换地址栏中参数的方法
 * @param url
 * @param arg
 * @param arg_val
 */
// eslint-disable-next-line @typescript-eslint/camelcase
function changeURLArg(url: string, arg: string, arg_val: string) {
  const pattern = `${arg}=([^&]*)`;
  // eslint-disable-next-line @typescript-eslint/camelcase
  const replaceText = `${arg}=${arg_val}`;
  if (url.match(pattern)) {
    let tmp = `/(${arg}=)([^&]*)/gi`;
    // eslint-disable-next-line no-eval
    tmp = url.replace(eval(tmp), replaceText);
    return tmp;
  }
  if (url.match('[?]')) {
    return `${url}&${replaceText}`;
  }
  return `${url}?${replaceText}`;
  // eslint-disable-next-line no-unreachable,@typescript-eslint/camelcase
  return `${url}\n${arg}\n${arg_val}`;
}

// 导出stream表格
const exportExcel = (stream: any, filename: any) => {
  const a = document.createElement('a');
  const blob = new Blob([stream], { type: 'application/vnd.ms-excel' });
  const url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

// 复制文字
function copy(message: string) {
  // eslint-disable-next-line eqeqeq
  if (message == '' || message === null) {
    error('当前链接为空');
    return;
  }
  const input = document.createElement('input');
  input.value = message;
  // input.style.height = '0px';
  document.body.appendChild(input);
  input.select();
  input.setSelectionRange(0, input.value.length);
  document.execCommand('Copy');
  document.body.removeChild(input);
  success('复制成功');
}

// 复制图片
function copyImage(name: string) {
  const clipboard = new Clipboard(name);
  // 成功回调
  clipboard.on('success', (e: { clearSelection: () => void }) => {
    e.clearSelection();
    success('复制成功');
  });
  // 失败回调
  clipboard.on('error', () => {
    error('复制失败');
  });
}

function getBase64(file: any) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}
// 随机字符串
function randomString(length: number) {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = length; i > 0;) {
    result += chars[Math.floor(Math.random() * chars.length)];
    i -= 1;
  }
  return result;
}

/**
 * 下载视频（转化为流文件）
 * @param url
 * @param callback
 * @param options
 */
function ajax(url: string, callback: { (xhr: { response: BlobPart; }): void; (arg0: XMLHttpRequest): void; }, options: { responseType: any; }) {
  window.URL = window.URL || window.webkitURL;
  const xhr = new XMLHttpRequest();
  xhr.open('get', url, true);
  if (options.responseType) {
    xhr.responseType = options.responseType;
  }
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      callback(xhr);
    }
  };
  xhr.send();
}

/**
 * 下载视频（通过链接地址）
 * @param url
 */
function handleDownVideo(url: string) {
  const innerurl = getBaseUrl(url);// 文件地址
  const name = url.replace(/(.*\/)*([^.]+).*/ig, '$2');
  ajax(innerurl, (xhr: { response: BlobPart; }) => {
    const filename = `${name}.${innerurl.replace(/(.*\.)/, '')}`;
    const a = document.createElement('a');
    const blob = new Blob([xhr.response]);
    const url1 = window.URL.createObjectURL(blob);
    a.href = url1;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url1);
  }, {
    responseType: 'blob',
  });
}

/**
 * 根据url导出文件
 */
function download(link: any) {
  const a = document.createElement('a');
  a.href = getBaseUrl(link);
  a.click();
  a.remove();
}

function getBaseUrl (url: any) {
  //protocol 属性是一个可读可写的字符串，可设置或返回当前 URL 的协议,所有主要浏览器都支持 protocol 属性
  var ishttps = 'https:' == window.location.protocol ? true: false;
  url = url.split('://')[1];
    if(ishttps){
      url = 'https://' + url;
  }else{
      url = 'http://' + url;
  }
  return url;
}

export { success, warning, error, columnFilter, exportExcel, copy, copyImage, trim, changeURLArg, getBase64, randomString, isArray, isEmptyObject, download, handleDownVideo };
