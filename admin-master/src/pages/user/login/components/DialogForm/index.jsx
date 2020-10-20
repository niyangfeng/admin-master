import React, { Component } from 'react';
import { connect } from 'dva';
import md5 from 'js-md5';
import router from 'umi/router';
import { Form, Checkbox, Input, Button } from 'antd';
import style from './index.less';
import { error, success } from '@/utils/utils';
import user from '../../../../../assets/user.png';
import code from '../../../../../assets/code.png';
import LoginK from '../../../../../assets/login-kc.png';
import SelectRole from './components/select-role';
// const FormItem = Form.Item;
@connect(({ login, loading }) => ({
  login,
  submitting: loading.effects['login/getCode'],
}))
class DialogForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: {
        account: '',
        verifyCode: '',
        password: '',
      },
      text: '获取验证码',
      loginMode: true,
      role: '1', // 1：老师 2：管理者
    };
  }

  componentDidMount() {
    if (localStorage.getItem('token')) {
      router.push('/');
    }
  }
  // 获取验证码
  getCode = () => {
    const { dispatch } = this.props;
    const { search } = this.state;
    const { account } = search;
    const telReg = /^1[3456789]\d{9}$/;
    if (!telReg.test(account)) {
      error('请输入正确的手机号');
      return;
    }
    dispatch({
      type: 'login/getCode',
      payload: {
        mobile: account,
      },
    }).then(result => {
      if (result) {
        success('验证码发送成功');
        this.setState(
          {
            text: 60,
          },
          () => {
            this.timerStart();
          },
        );
      }
    });
  };

  timerStart = () => {
    const { text } = this.state;
    if (text < 0) {
      this.setState({ text: '获取验证码' });
      return;
    }
    setTimeout(() => {
      const num = text;
      const num1 = num - 1;
      this.setState({ text: num1 });
      this.timerStart();
    }, 1000);
  };

  // 输入事件
  onSelectChange = (val, key) => {
    const { search } = this.state;
    search[key] = val;
    this.setState({ search });
  };

  // 登陆
  handleSubmit = () => {
    const { dispatch } = this.props;
    const { search, loginMode, role } = this.state;
    const { account, verifyCode, password } = search;
    const telReg = /^1[3456789]\d{9}$/;
    let type = 0;
    if (role === '1' && !loginMode) {
      // 老师验证码登录
      type = 0;
    } else {
      // 账号密码
      type = 1;
    }
    if (type === 0) {
      if (!telReg.test(account)) {
        error('请输入正确的手机号');
        return;
      }
      if (verifyCode.length <= 0) {
        error('请输入验证码');
        return;
      }
    } else {
      if (account === '') {
        error('请输入账号');
        return;
      }
      if (password === '') {
        error('请输入密码');
        return;
      }
    }

    localStorage.clear()
    dispatch({
      type: 'login/loginForCode',
      payload: {
        type,
        ...search,
        password: md5(search.password),
      },
    }).then(result => {
      if (!result) {
        const { search } = this.state;
        search.verifyCode = '';
        search.password = '';
        this.setState({
          search,
        });
        // this.getNavPermission();
      }
    });
  };

  // 获取菜单权限
  // getNavPermission = () => {
  //   const { dispatch } = this.props;
  //   const userId = JSON.parse(localStorage.getItem('userInfo')).id;
  //   const data = {
  //     userId,
  //   }
  //   dispatch({
  //     type: 'login/getNavPermission',
  //     payload: data,
  //   })
  // }

  // 选择是否账号登录
  handleCheckbox = e => {
    this.setState({
      loginMode: e.target.checked,
    });
  };

  // 选择登录角色
  handleSelRole = state => {
    const { search } = this.state;
    Object.keys(search).forEach(item => {
      search[item] = '';
    });
    this.setState({
      role: state,
      loginMode: false,
      search,
    });
  };

  render() {
    const { text, search, loginMode, role } = this.state;
    const { verifyCode, account, password } = search;
    return (
      <div className={style.login_box}>
        <div className={style.LoginK}>
          <img src={LoginK} alt="logo" />
        </div>
        <div className={style.title}>快财学堂CRM运营系统</div>
        {/* <SelectRole onClick={this.handleSelRole} /> */}
        <div className={style.login_con}>
          <div className={style.form}>
            <Form className="login-form">
              <Form.Item>
                <div className={style.input_mobile_box}>
                  <div className={style.input_color}></div>
                  <div className={style.input_img}>
                    <img src={user} alt="" />
                  </div>
                  <div className={style.user_input}>           
                    <Input readOnly={true}  autoComplete="off" style={{display:"none"}} />
                    <Input
                      value={account}
                      onChange={e => this.onSelectChange(e.target.value, 'account')}
                      placeholder={role === '1' && !loginMode ? '请输入手机号' : '请输入账号'}
                    />
                  </div>
                </div>
              </Form.Item>
              {!loginMode && role === '1' ? (
                <Form.Item className={style.bottom0}>
                  <div className={style.input_code_box}>
                    <div className={style.input_color}></div>
                    <div className={style.input_img}>
                      <img src={code} alt="" />
                    </div>
                    <div className={style.code_input}>
                      <Input
                        style={{ background: 'red' }}
                        maxLength={6}
                        value={verifyCode}
                        onChange={e => this.onSelectChange(e.target.value, 'verifyCode')}
                        placeholder="请输入验证码"
                      />
                    </div>
                    {typeof text === 'number' ? (
                      <Button type="primary" className="login-form-button">
                        {text}s
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        onClick={() => this.getCode()}
                        className="login-form-button"
                      >
                        {text}
                      </Button>
                    )}
                  </div>
                </Form.Item>
              ) : (
                <Form.Item>
                  <div className={style.input_password_box}>
                    <div className={style.input_color}></div>
                    <div className={style.input_img}>
                      <img src={code} alt="" />
                    </div>
                    <div className={style.user_input}>
                      <Input
                        type="password"
                        value={password}
                        onChange={e => this.onSelectChange(e.target.value, 'password')}
                        placeholder="请输入密码"
                        onPressEnter={ e=>{e.preventDefault(); this.handleSubmit()}}
                      />
                    </div>
                  </div>
                </Form.Item>
              )}
              {/* {role === '1' && (
                <Form.Item className={style.checkbox}>
                  <span>账号密码登录: </span>
                  <Checkbox className={style.select} onChange={this.handleCheckbox} />
                </Form.Item>
              )} */}
              <Form.Item>
                <div className={style.login}>
                  <Button
                    type="primary"
                    onClick={() => this.handleSubmit()}
                    className="login-form-button"
                    htmlType='submit'
                  >
                    登录
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    );
  }
}
export default DialogForm;
