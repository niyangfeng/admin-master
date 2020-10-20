import request from '@/utils/request';

// （查询条件）直播期数据
export async function queryStageList(body: any) {
  return request({ url: 'liveClassMember/selectLiveCampDateList', body });
}
