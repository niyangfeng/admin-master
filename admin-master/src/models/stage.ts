import { queryStageList } from '@/services/stage';

export default {
  namespace: 'stage',
  state: {
    pagination: (<any>window).GLOBAL.DEFAULT_PAGINATION, // eslint-disable-line no-undef
    stageList: [],
  },

  effects: {
    // 获取直播期数据（查询条件）
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,consistent-return
    *list({ payload }: any, { call, put }: any) {
      const response = yield call(queryStageList, payload);
      const { data } = response;
      if (response.code === 0) {
        const arr = data.map((item: { value: any; id: any; label: any; name: any }) => {
          item.value = item.id;
          item.label = item.name;
          return item;
        });
        yield put({
          type: 'redList',
          payload: {
            stageList: arr,
          },
        });
        return arr;
      } else {
        yield put({
          type: 'redList',
          payload: {
            stageList: [],
          },
        });
        return [];
      }
    },
  },

  reducers: {
    redList(state: any, action: { payload: any }) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
