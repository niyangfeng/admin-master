import { Badge, Icon, Spin, Card, Table, Empty ,Modal } from 'antd';
import {
  SoundOutlined,
  MessageFilled,
} from '@ant-design/icons';
import React, { Component } from 'react';
import classNames from 'classnames';
import NoticeList, { NoticeIconTabProps } from './NoticeList';

import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';
import { columnFilter } from '@/utils/utils';
import { createFromIconfontCN } from '@ant-design/icons';
const IconFont = createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/font_1819115_rkb5nc2l09.js',
});

export interface NoticeIconData {
  avatar?: string | React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  datetime?: React.ReactNode;
  extra?: React.ReactNode;
  style?: React.CSSProperties;
  key?: string | number;
  read?: boolean;
}

export interface NoticeIconProps {
  count?: number;
  bell?: React.ReactNode;
  className?: string;
  loading?: boolean;
  onClear?: (tabName: string, tabKey: string) => void;
  onItemClick?: (item: NoticeIconData, tabProps: NoticeIconTabProps) => void;
  onViewMore?: (tabProps: NoticeIconTabProps, e: MouseEvent) => void;
  onTabChange?: (tabTile: string) => void;
  style?: React.CSSProperties;
  onPopupVisibleChange?: (visible: boolean) => void;
  popupVisible?: boolean;
  clearText?: string;
  viewMoreText?: string;
  clearClose?: boolean;
  children: React.ReactElement<NoticeIconTabProps>[];
}

export default class NoticeIcon extends Component<NoticeIconProps> {
  public static Tab: typeof NoticeList = NoticeList;

  static defaultProps = {
    onItemClick: (): void => {},
    onPopupVisibleChange: (): void => {},
    onTabChange: (): void => {},
    onClear: (): void => {},
    onViewMore: (): void => {},
    loading: false,
    clearClose: false,
    emptyImage: 'https://gw.alipayobjects.com/zos/rmsportal/wAhyIChODzsoKIOBHcBk.svg',
  };

  state = {
    visible: false,
  };

  onItemClick = (item: NoticeIconData, tabProps: NoticeIconTabProps): void => {
    const { onItemClick } = this.props;
    if (onItemClick) {
      onItemClick(item, tabProps);
    }
  };

  onClear = (name: string, key: string): void => {
    const { onClear } = this.props;
    if (onClear) {
      onClear(name, key);
    }
  };

  onTabChange = (tabType: string): void => {
    const { onTabChange } = this.props;
    if (onTabChange) {
      onTabChange(tabType);
    }
  };

  onViewMore = (tabProps: NoticeIconTabProps, event: MouseEvent): void => {
    const { onViewMore } = this.props;
    if (onViewMore) {
      onViewMore(tabProps, event);
    }
  };

  handleFollow = (text: any) => {
    // @ts-ignore
    const { follow } = this.props;
    follow(text.studentId,text);
  };

  getNotificationBox(): React.ReactNode {
    // @ts-ignore
    const { children, loading, dataSoure } = this.props;
    // const { dataList = [] } = dataSoure;
    if (!children) {
      return null;
    }
    const columns = [
      {
        title: '跟进学生',
        dataIndex: 'wechatName',
        width: '280px',
        render: (val: React.ReactNode) => (
          <div style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
            <span style={{ color: '#FA3052' }}> <SoundOutlined />【跟进提醒】</span>到时间跟进<span style={{ color: '#3AA0FF' }}>{val}</span>啦
          </div>
        ),
      },
      {
        title: '时间',
        dataIndex: 'remindTime',
        width: '180px',
        render: (text: any) => (
          <span style={{ color: '#0FBD1E'}}>
            {text}
          </span>
        ),
      },
      {
        title: '操作',
        render: (text: any) => (
          <a style={{ color: '#1890FF' ,padding: '0 10px',borderRadius: '20px',border: '1px solid #B0D9FF',background: '#E6F4FF',float:'right'}} onClick={() => this.handleFollow(text)}>
            跟进
          </a>
        ),
      },
    ];
    return (
      <>
        <Spin spinning={loading} delay={300}>
          <div className={styles.spin}>
            <Card title={<h3 style={{fontWeight:'bold'}}><MessageFilled style={{color:'#3AA0FF',marginRight:'10px'}}/>最新消息</h3>} className={styles.notice_card} bordered={false} style={{ width: 600 }}>
              {dataSoure && dataSoure.length > 0 ? (
                <Table className={styles.no_head_table}
                  scroll={{ y: 240 }}
                  dataSource={dataSoure}
                  rowKey={record => record.id}
                  columns={columnFilter(columns, 'none')}
                  pagination={false}
                />
              ) : (
                <Empty style={{padding:'20px 0'}} description="暂无新消息" />
              )}
            </Card>
          </div>
        </Spin>
      </>
    );
  }

  handleVisibleChange = (visible: boolean): void => {
    // @ts-ignore
    const { onPopupVisibleChange, openToast } = this.props;
    this.setState({ visible });
    if (onPopupVisibleChange) {
      onPopupVisibleChange(visible);
    }
    openToast(visible);
  };

  render(): React.ReactNode {
    const { className, count, popupVisible, bell } = this.props;
    const { visible } = this.state;
    const noticeButtonClass = classNames(className, styles.noticeButton);
    const notificationBox = this.getNotificationBox();
    const NoticeBellIcon = bell || <IconFont type="iconlingdang" className={styles.icon} />;
    const trigger = (
      <span className={classNames(noticeButtonClass, { opened: visible })}>
        <Badge
          count={count == undefined ? 0 : count}
          style={{ boxShadow: 'none' }}
          className={styles.badge}
        >
          {NoticeBellIcon}
        </Badge>
      </span>
    );
    if (!notificationBox) {
      return trigger;
    }
    const popoverProps: {
      visible?: boolean;
    } = {};
    if ('popupVisible' in this.props) {
      popoverProps.visible = popupVisible;
    }

    return (
      <HeaderDropdown
        placement="bottomRight"
        overlay={notificationBox}
        overlayClassName={styles.popover}
        trigger={['click']}
        visible={visible}
        onVisibleChange={this.handleVisibleChange}
        {...popoverProps}
      >
        {trigger}
        {/* {this.renderDetailMadal()} */}
      </HeaderDropdown>
    );
  }
}
