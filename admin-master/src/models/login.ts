import { Reducer } from 'redux';
import { routerRedux } from 'dva/router';
import { Effect } from 'dva';
import { stringify } from 'querystring';

import { fakeAccountLogin, getMobileCode, loginMobileCode, queryPermissions } from '@/services/login';
import { setAuthority } from '@/utils/authority';
import { clearLoginInfo, getPageQuery, setLoginInfo } from '@/utils/utils';
import { reloadAuthorized } from '@/utils/Authorized';

export interface StateType {
  status?: 'ok' | 'error';
  type?: string;
  currentAuthority?: 'user' | 'guest' | 'admin';
}

export interface LoginModelType {
  namespace: string;
  state: StateType;
  effects: {
    login: Effect;
    getCaptcha: Effect;
    logout: Effect;
  };
  reducers: {
    changeLoginStatus: Reducer<StateType>;
  };
}

// @ts-ignore
const Model: LoginModelType = {
  namespace: 'login',

  state: {
    userInfo: {},
  },

  effects: {
    *login({ payload }, { call, put }) {
      let response = { status: '', code: null };
      try {
        response = yield call(fakeAccountLogin, payload);
        response.status = response.code === 0 ? 'ok' : 'error';
      } catch (error) {
        response.status = 'error';
      }
      yield put({
        type: 'changeLoginStatus',
        payload: response,
      });

      // Login successfully
      if (response.status === 'ok') {
        reloadAuthorized();
        // const urlParams = new URL(window.location.href);
        // const params = getPageQuery();
        // const { redirect } = params as { redirect: string };
        // console.log(redirect);
        // yield put(routerRedux.replace(redirect || '/'));
        yield put(routerRedux.push('/'));
      }
    },

    // *getCaptcha({ payload }, { call }) {
    //   // yield call(getFakeCaptcha, payload);
    //   console.log(111)
    // },
    *logout(_, { put }) {
      const { redirect } = getPageQuery();
      // redirect
      if (window.location.pathname !== '/login' && !redirect) {
        yield put(
          routerRedux.replace({
            pathname: '/login',
            search: stringify({
              redirect: window.location.href,
            }),
          }),
          clearLoginInfo(),
        );
      }
    },

    // 获取验证码
    *getCode({ payload }: any, { call }: any) {
      try {
        const response = yield call(getMobileCode, payload);
        if (response.code === 0) {
          return true;
        }
      } catch (e) {
        // error('验证码获取失败')
      }
    },

    // 验证码登陆
    *loginForCode({ payload }: any, { call, put }: any) {
      let response = { status: '', code: null };
      response = yield call(loginMobileCode, payload);
      response.status = response.code === 0 ? 'ok' : 'error';
      // try {
      //   response = yield call(loginMobileCode, payload);
      //   response.status = response.code === 0 ? 'ok' : 'error';
      // } catch (error) {
      //   response.status = 'error';
      // }
      yield put({
        type: 'changeLoginStatus',
        payload: response,
      });

      // Login successfully
      if (response.status === 'ok') {
        reloadAuthorized();
        // const urlParams = new URL(window.location.href);
        // const params = getPageQuery();
        // const { redirect } = params as { redirect: string };
        // console.log(redirect);
        // yield put(routerRedux.replace(redirect || '/'));
        yield put(routerRedux.push('/'));
      } else {
        return false;
      }
    },

    // 获取菜单权限
    *getNavPermission({ payload }: any, { call, put }: any) {
      const response = yield call(queryPermissions, payload);
      if (response.code === 0) {
        const { data } = response;
        yield put({
          type: 'redList',
          payload: {
            navList: data,
          },
        })
        return data;
      }
      return null;
    },
  },

  reducers: {
    redList(state: any, action: { payload: any }) {
      return {
        ...state,
        ...action.payload,
      };
    },
    changeLoginStatus(state, { payload }) {
      if (payload.status === 'ok') {
        setLoginInfo(payload.data);
        setAuthority('admin');
      }
      return {
        ...state,
        userInfo: payload.data,
      };
    },
  },
};

export default Model;
