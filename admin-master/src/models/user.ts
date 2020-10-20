import { Effect } from 'dva';
import { Reducer } from 'redux';
import { routerRedux } from 'dva/router';
import { stringify } from 'querystring';
import {
  queryCurrent,
  query as queryUsers,
  getNotices,
  getNoticesData,
  followNotices,
  editPassword,
  queryTeacher,
  queryTodoList,
} from '@/services/user';
import { clearLoginInfo, success } from '@/utils/utils';

export interface CurrentUser {
  avatar?: string;
  name?: string;
  title?: string;
  group?: string;
  signature?: string;
  tags?: {
    key: string;
    label: string;
  }[];
  userid?: string;
  unreadCount?: number;
}

export interface UserModelState {
  teacherList: any;
  noticeObj: any;
  count: any;
  currentUser?: CurrentUser;
}

export interface UserModelType {
  namespace: 'user';
  state: UserModelState;
  effects: {
    fetch: Effect;
    fetchCurrent: Effect;
  };
  reducers: {
    saveCurrentUser: Reducer<UserModelState>;
    changeNotifyCount: Reducer<UserModelState>;
  };
}

// @ts-ignore
const UserModel: UserModelType = {
  namespace: 'user',

  state: {
    pagination: (<any>window).GLOBAL.DEFAULT_PAGINATION, // eslint-disable-line no-undef
    currentUser: {},
    count: '',
    noticeObj: {},
    teacherList: [],
    teacherData: [],
    teacherSelList: [],
  },

  effects: {
    *fetch(_, { call, put }) {
      const response = yield call(queryUsers);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *fetchCurrent(_, { call, put }) {
      const response = yield call(queryCurrent);
      yield put({
        type: 'saveCurrentUser',
        payload: response,
      });
    },

    // 获取老师跟踪记录提醒数量
    *getTipMessageNum(_: any, { call, put }: any) {
      const response = yield call(getNotices);
      if (response.code === 0) {
        yield put({
          type: 'redList',
          payload: {
            count: response.data,
          },
        });
        return true;
      }
    },

    // 获取提醒老师最新的消息数据
    *getNotice({ payload }: any, { call, put }: any) {
      const response = yield call(getNoticesData, payload);
      if (response.code === 0) {
        // const { dataList, totalCount } = response;
        yield put({
          type: 'redList',
          payload: {
            noticeObj: response.data,
          },
        });
        return true;
      }
    },

    // 提醒跟进
    *followNotice({ payload }: any, { call }: any) {
      const response = yield call(followNotices, payload);
      if (response.code === 0) {
        return true;
      }
    },

    // 修改密码
    *editPassword({ payload }: any, { call, put }: any) {
      const response = yield call(editPassword, payload);
      if (response.code === 0) {
        yield put(
          routerRedux.replace({
            pathname: '/login',
            search: stringify({
              redirect: window.location.href,
            }),
          }),
          clearLoginInfo(),
        );
        success('修改密码成功');
      }
    },

    // 管理者登录后获取老师列表
    *getTeacher({ payload }: any, { call, put }: any) {
      const response = yield call(queryTeacher, payload);
      if (response.code === 0) {
        const { data } = response;
        const arr = data.map((item: { value: any; id: any; label: any; name: any }) => {
          item.value = item.id;
          item.label = item.name;
          return item;
        });
        const all = { id: null, name: '全部' };
        yield put({
          type: 'redList',
          payload: {
            teacherList: [all, ...data],
            teacherData: [all, ...data],
            teacherSelList: arr,
          },
        });
      }
    },

    // 用户搜索教师
    *searchTeacher({ payload }: any, { put, select }: any) {
      const { teacherData } = yield select(_ => _.user);
      const onQueryTeacher = () => {
        const array: never[] | { name: any }[] = [];
        teacherData.forEach((item: { name: any }) => {
          const { name } = item;
          if (name.indexOf(payload) > -1) {
            // @ts-ignore
            array.push(item);
          }
        });
        return new Promise(resolve => {
          resolve(array);
        });
      };
      const response = yield onQueryTeacher();
      yield put({
        type: 'redList',
        payload: {
          teacherList: response,
        },
      });
    },
    // 查询待办事项
    *todoList({ payload }: any, { call, put }: any) {
      const response = yield call(queryTodoList, payload);
      if (response.code === 0) {
        const { data } = response;
        yield put({
          type: 'redList',
          payload: {
            todoList: data,
            // pagination: {
            //   ...payload,
            //   total: totalCount,
            // },
          },
        });
        return data
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
    saveCurrentUser(state, action) {
      return {
        ...state,
        currentUser: action.payload || {},
      };
    },
    changeNotifyCount(
      state = {
        currentUser: {},
      },
      action,
    ) {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          notifyCount: action.payload.totalCount,
          unreadCount: action.payload.unreadCount,
        },
      };
    },
  },
};

export default UserModel;
