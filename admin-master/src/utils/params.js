export const createBody = body => {
  const $body = {
    ...body,
  };
  const saleId = localStorage.getItem('saleId');
  if (saleId && saleId !== '') {
    $body.saleId = saleId;
  } else {
    let userInfo = localStorage.getItem('userInfo');
    userInfo = JSON.parse(userInfo);
    if (userInfo) {
      userInfo.accountName = localStorage.getItem('currentName');
      $body.saleId = !userInfo ? '' : userInfo.id;
    }
  }
  const type = localStorage.getItem('type');
  // 单个代班账号
  if (type === '3') {
    const teacherId = localStorage.getItem('teacherId');
    if (teacherId && teacherId !== '') {
      $body.teacherId = teacherId;
    }
  } else {
    localStorage.removeItem('teacherId');
  }
  if (type && type !== '') {
    $body.type = type;
  } else {
    $body.type = '0';
  }
  const departmentId = localStorage.getItem('departmentId');
  if(type === '1'){
    if (departmentId && departmentId !== '') {
      $body.departmentId = departmentId;
    } else {
      $body.departmentId = null;
    }
  }else if(type === '0' || type === '2'){
    $body.departmentId = 999;
  }

  return $body;
};
