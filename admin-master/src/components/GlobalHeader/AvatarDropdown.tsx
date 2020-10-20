import { Avatar, Icon, Menu, Modal, Form, Input } from 'antd';
import { ClickParam } from 'antd/es/menu';
import { FormattedMessage } from 'umi-plugin-react/locale';
import React from 'react';
import { connect } from 'dva';
import md5 from 'js-md5';
// import router from 'umi/router';

import { ConnectProps, ConnectState } from '@/models/connect';
import { CurrentUser } from '@/models/user';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';

const FormItem = Form.Item;

export interface GlobalHeaderRightProps extends ConnectProps {
  currentUser?: CurrentUser;
  menu?: boolean;
}

class AvatarDropdown extends React.Component<GlobalHeaderRightProps> {
  state = {
    currentUser: {
      avatar: '',
      name: '',
      wechatAccount: '',
    },
    visible: false,
    password: '',
  };

  componentDidMount() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const currentUser = {
      // avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
      avatar:
        'https://qnunion.feierlaiedu.com/kcschool/201912210328_E69CAAE6A087E9A298-220E68BB7.png',
      name: window.location.href.indexOf('switchAccount')>-1 ? localStorage.getItem('currentName')  : userInfo.accountName,
      wechatAccount: userInfo.wechatAccount,
    };
    this.setState({ currentUser });
  }

  onMenuClick = (event: ClickParam) => {
    const { key } = event;

    if (key === 'logout') {
      const { dispatch } = this.props;
      if (dispatch) {
        dispatch({
          type: 'login/logout',
        });
      }
    } else if (key === 'change-password') {
      this.setState({
        visible: true,
      });
    }
    // router.push(`/account/${key}`);
  };

  handleCancel = () => {
    this.setState({
      visible: false,
      password: '',
    });
  };

  handleOk = () => {
    const { dispatch } = this.props;
    const { password } = this.state;
    if (dispatch) {
      dispatch({
        type: 'user/editPassword',
        payload: {
          newPassword: md5(password),
        },
      });
    }
  };

  handleEditPassword = (e: { target: { value: any } }) => {
    this.setState({
      password: e.target.value,
    });
  };

  editPassword = () => {
    const { visible, currentUser, password } = this.state;
    const { wechatAccount } = currentUser;
    return (
      <Modal title="修改密码" visible={visible} onOk={this.handleOk} onCancel={this.handleCancel}>
        <Form layout="inline" style={{ textAlign: 'center' }}>
          <FormItem label="账号" style={{ display: 'inline-block', marginLeft: '14px' }}>
            <Input disabled value={wechatAccount} />
          </FormItem>
          <FormItem label="新密码" style={{ display: 'inline-block' }}>
            <Input
              type="password"
              value={password}
              placeholder="请输入新密码"
              onChange={e => this.handleEditPassword(e)}
            />
          </FormItem>
        </Form>
      </Modal>
    );
  };

  render(): React.ReactNode {
    // const { currentUser = { avatar: '', name: '' }, menu } = this.props;

    const menuHeaderDropdown = (
      <Menu className={styles.menu} selectedKeys={[]} onClick={this.onMenuClick}>
        <Menu.Item key="logout">
          <Icon type="logout" />
          <FormattedMessage id="menu.account.logout" defaultMessage="logout" />
        </Menu.Item>
        <Menu.Item key="change-password">
          <Icon type="key" />
          <FormattedMessage id="menu.account.change-password" defaultMessage="change-password" />
        </Menu.Item>
      </Menu>
    );

    return (
      <div style={{ display: 'inline-block' }}>
        <HeaderDropdown overlay={menuHeaderDropdown}>
          <span className={`${styles.action} ${styles.account}`}>
            <Avatar
              size="small"
              className={styles.avatar}
              src={this.state.currentUser.avatar}
              alt="avatar"
            />
            <span className={styles.name}>{this.state.currentUser.name}</span>
          </span>
        </HeaderDropdown>
        {this.editPassword()}
      </div>
    );
  }
}
export default connect(({ user }: ConnectState) => ({
  currentUser: user.currentUser,
}))(AvatarDropdown);
