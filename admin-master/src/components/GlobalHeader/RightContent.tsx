import { Icon, Tooltip } from 'antd';
import React from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { formatMessage } from 'umi-plugin-react/locale';
import { ConnectProps, ConnectState } from '@/models/connect';

import Avatar from './AvatarDropdown';
// import Teacher from './TeacherDropDown';
// import HeaderSearch from '../HeaderSearch';
// import SelectLang from '../SelectLang';
import Notice from './NoticeIconView';
import styles from './index.less';

export type SiderTheme = 'light' | 'dark';
export interface GlobalHeaderRightProps extends ConnectProps {
  theme?: SiderTheme;
  layout: 'sidemenu' | 'topmenu';
}

const GlobalHeaderRight: React.SFC<GlobalHeaderRightProps> = props => {
  const { theme, layout } = props;
  let className = styles.right;

  if (theme === 'dark' && layout === 'topmenu') {
    className = `${styles.right}  ${styles.dark}`;
  }

  const handleHelp = () => {
    router.push('/block');
  };
  // const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

  return (
    <div className={className}>
      {/* 注释 全局头部的使用文档 */}
      <Tooltip
        title={formatMessage({
          id: 'component.globalHeader.help',
        })}
      >
        <a
          target="_blank"
          rel="noopener noreferrer"
          className={styles.action}
          onClick={() => handleHelp()}
        >
          <Icon type="question-circle-o" />
        </a>
      </Tooltip>
      {/* {userInfo.identity === 0 ? <Notice /> : <Teacher />} */}
      <Notice />
      <Avatar />
    </div>
  );
};

export default connect(({ settings }: ConnectState) => ({
  theme: settings.navTheme,
  layout: settings.layout,
}))(GlobalHeaderRight);
