import { Menu, Input, Icon, Empty } from 'antd';
import { ClickParam } from 'antd/es/menu';
import React from 'react';
import { connect } from 'dva';
// import router from 'umi/router';

import { ConnectProps, ConnectState } from '@/models/connect';
import { CurrentUser } from '@/models/user';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';

const { Search } = Input;

export interface GlobalHeaderRightProps extends ConnectProps {
  currentUser?: CurrentUser;
  menu?: boolean;
}

class TeacherDropdown extends React.Component<GlobalHeaderRightProps> {
  state = {
    teacherName: '老师列表',
  };

  componentDidMount() {
    // 回显存储的老师姓名
    this.setState({
      teacherName: !localStorage.getItem('teacherName')
        ? '老师列表'
        : localStorage.getItem('teacherName'),
    });
    const { dispatch } = this.props;
    if (dispatch && localStorage.getItem('token')) {
      dispatch({
        type: 'user/getTeacher',
        payload: {},
      });
    }
  }

  onHandleClickTeacher = (event: ClickParam) => {
    const { key, item } = event;
    const { props } = item;
    const { children } = props;
    if (key === 'search') {
      return;
    }
    localStorage.setItem('teacherId', key);
    localStorage.setItem('teacherName', children);
    this.setState({
      teacherName: children,
    });
    // eslint-disable-next-line prefer-destructuring
    window.location.href = window.location.href.split('?')[0];
  };

  onHandleSearch = (val: any) => {
    const { dispatch } = this.props;
    if (dispatch) {
      dispatch({
        type: 'user/searchTeacher',
        payload: val,
      });
    }
  };

  render(): React.ReactNode {
    const { teacherName } = this.state;
    const { teacherList }: any = this.props;
    const renderTeacherModule = () => (
      <Menu className={styles.menuTeacher} selectedKeys={[]} onClick={this.onHandleClickTeacher}>
        <Menu.Item key="search" disabled>
          <Search placeholder="请输入..." onChange={e => this.onHandleSearch(e.target.value)} />
        </Menu.Item>
        {teacherList.length > 0 ? (
          teacherList.map((item: { id: any; name: any }) => (
            <Menu.Item key={item.id}>{item.name}</Menu.Item>
          ))
        ) : (
          <Menu.Item key="empty">
            <Empty className={styles.menuEmpty} description="亲! 没有查询到老师" />
          </Menu.Item>
        )}
      </Menu>
    );

    // visible={this.state.teacherShow} onMouseOut={this.onMouseOut}
    return (
      <div style={{ display: 'inline-block' }}>
        <HeaderDropdown overlay={renderTeacherModule}>
          <span className={`${styles.action} ${styles.account}`}>
            {/* eslint-disable-next-line jsx-a11y/mouse-events-have-key-events */}
            <span className={styles.name}>
              {teacherName} <Icon type="down" />
            </span>
          </span>
        </HeaderDropdown>
      </div>
    );
  }
}
export default connect(({ user }: ConnectState) => ({
  teacherList: user.teacherList,
}))(TeacherDropdown);
