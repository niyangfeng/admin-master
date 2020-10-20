import React, { PureComponent } from 'react';
import style from './select-role.less';

class Role extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      role: '1',
    };
  }

  click = state => {
    this.setState({
      role: state,
    });
    this.props.onClick(state);
  };

  render() {
    const { role } = this.state;
    return (
      <div className={style.wrapper}>
        <div className={style.tag}>
          <div onClick={() => this.click('1')} className={role === '1' ? style.active : ''}>
            <span>老师登录</span>
            {role === '1' && <div></div>}
          </div>
        </div>
        <div className={style.tag}>
          <div onClick={() => this.click('2')} className={role === '2' ? style.active : ''}>
            <span>管理者登录</span>
            {role === '2' && <div></div>}
          </div>
          <div></div>
        </div>
      </div>
    );
  }
}
export default Role;
