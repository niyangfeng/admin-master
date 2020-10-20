import React, { Component } from 'react';
import style from './login.less';
import DialogForm from './components/DialogForm';
import loginImg from '../../../assets/login-img.png';

// eslint-disable-next-line react/prefer-stateless-function
class Login extends Component {
  render() {
    return (
      <div className={style.login}>
        <div className={style.login_outer}>
          <div className={style.my_flex_between}>
            <img src={loginImg} className={style.login_img} alt="" />
            <DialogForm />
          </div>
        </div>
      </div>
    );
  }
}
export default Login;
