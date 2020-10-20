import React from 'react';
import router from 'umi/router';
import welcomeImg from '../assets/welcome.png';

const Block: React.FC<{}> = () => {
  if (!localStorage.getItem('token')) {
    router.push('/login');
  }
  // const userInfo = JSON.parse(localStorage.getItem('userInfo') as string);
  return (
    <div>
      {/* <Result
        // icon={<Icon type="smile" theme="outlined" />}
        title={`${userInfo ? userInfo.name : ''} ${
          !userInfo ? '老师' : userInfo.identity === 0 ? '老师' : '管理员'
        }`}
      /> */}
      {/* <p>{`${userInfo ? userInfo.name : ''} ${
        !userInfo ? '老师' : userInfo.identity === 0 ? '老师' : '管理员'
      }`}</p> */}
      <img src={welcomeImg} style={{ width: '100%' }} alt="" />
    </div>
  );
};

export default Block;
