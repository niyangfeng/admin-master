import request from '@/utils/request';

// 登录接口
export async function fakeAccountLogin(params: any) {
  return request({ url: 'login/login', body: params });
}

// 获取验证码
export async function getMobileCode(params: any) {
  return request({ url: 'login/sendSms', body: params });
}

// 验证码登陆
export async function loginMobileCode(params: any) {
  return request({ url: 'login/login', body: params });
}

// 获取菜单权限
export async function queryPermissions(params: any) {
  return request({ url: `/login/queryPermissions?saleId=${params}` })
}
