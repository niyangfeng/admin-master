import request from '@/utils/request';

export async function query(): Promise<any> {
  return request('/api/users');
}

export async function queryCurrent(): Promise<any> {
  return request('/api/currentUser');
}

export async function queryNotices(): Promise<any> {
  return request('/api/notices');
}

// 获取老师跟踪记录提醒数量
export async function getNotices(body: any) {
  return request({ url: 'followUpRecord/countTeacherRemindRecordList', body });
}

// 获取老师跟踪记录提醒数据
export async function getNoticesData(body: any) {
  return request({ url: 'followUpRecord/selectTeacherRemindRecordList', body });
}

// 老师跟进提醒的数据(标记为已读)
export async function followNotices(body: any) {
  return request({ url: 'followUpRecord/reportRecordHasRead', body });
}

// 修改密码
export async function editPassword(body: any) {
  return request({ url: 'login/modifyPassword', body });
}

// 管理者登录后获取老师列表
export async function queryTeacher(body: any) {
  return request({ url: 'teacher/list', body });
}

// 用户点击数据收集上报
export async function userBehaviorReportLog(body: any) {
  return request({ url: 'reportLog/create', body })
}

// 查询代办事项数据
export async function queryTodoList(body: any) {
  return request({ url: 'worker/getWaitDealThing', body });
}
// 执行跟进事件
export async function handleFollowEvent(body: any) {
  return request({ url: 'followUpRecord/dealHasRead', body });
}

