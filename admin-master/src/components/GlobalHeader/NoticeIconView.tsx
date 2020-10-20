import React, { Component } from 'react';
import { Tag, message , Modal , Empty ,Button ,Form ,Row ,Col, Input, Select, DatePicker} from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi-plugin-react/locale';
import groupBy from 'lodash/groupBy';
import moment from 'moment';
import router from 'umi/router';
import { trim } from '@/utils/utils';
import { NoticeItem } from '@/models/global';
import NoticeIcon from '../NoticeIcon';
import { CurrentUser } from '@/models/user';
import { ConnectProps, ConnectState } from '@/models/connect';
import styles from './index.less';
const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;

export interface GlobalHeaderRightProps extends ConnectProps {
  notices?: NoticeItem[];
  currentUser?: CurrentUser;
  fetchingNotices?: boolean;
  onNoticeVisibleChange?: (visible: boolean) => void;
  onNoticeClear?: (tabName?: string) => void;
}

class GlobalHeaderRight extends Component<GlobalHeaderRightProps> {
  constructor(props: Readonly<GlobalHeaderRightProps>) {
    super(props);
    this.state = {
      search:{
        campDataId: '',
        classId: '',      
        // userId: localStorage.getItem('teacherId') == null ||
        // localStorage.getItem('teacherId') === 'null' ||
        // // @ts-ignore
        // localStorage.getItem('teacherId') === undefined ? JSON.parse(localStorage.getItem('userInfo')).id : localStorage.getItem('teacherId'),
      },
      todoList:[],
      show: true,
      followModalData: {
        followLogList: [],
      },
      followModalVisible: false,
      follow: {
        tag: null,
        remindTime: '',
        rangePickerValue: null,
        content: '',
        studentId: '',
        followVisible: false,
        
      },
      buyCourseStatus: {
        0: '未购课',
        1: '已购课',
      },
      customTagList: {
        null: '全部',
        0: '无效用户',
        1: 'S',
        2: 'A+',
        3: 'A',
        4: 'A-',
        5: 'B+',
        6: 'B',
        7: 'B-',
        8: 'C+',
        9: 'C',
        10: 'C-',
      },
      customTag: [
        {
          id: null,
          name: '全部',
        },
        {
          id: 1,
          name: 'S',
        },
        {
          id: 2,
          name: 'A+',
        },
        {
          id: 3,
          name: 'A',
        },
        {
          id: 4,
          name: 'A-',
        },
        {
          id: 5,
          name: 'B+',
        },
        {
          id: 6,
          name: 'B',
        },
        {
          id: 7,
          name: 'B-',
        },
        {
          id: 8,
          name: 'C+',
        },
        {
          id: 9,
          name: 'C',
        },
        {
          id: 10,
          name: 'C-',
        },
      ],
    };
  }

  componentWillMount(): void {
    if (localStorage.getItem('token')) {
      // 获取提醒的数量
      // this.getTipNum();
      this.getTodoList();
    }
  }

  componentDidMount() {
    // 查询提醒消息
    this.getUpdataMessage();
  }

  getUpdataMessage = () => {
    setTimeout(() => {
      // 获取提醒的数量
      // this.getTipNum();
      this.getTodoList();
      if(localStorage.getItem('userInfo')){
        this.getUpdataMessage();
      }
    }, 600000);
  };

  getTipNum = () => {
    const { dispatch } = this.props;
    if (dispatch) {
      // 获取提醒的数量
      dispatch({
        type: 'user/getTipMessageNum',
      });
    }
  };

  getNotice = () => {
    const { dispatch } = this.props;
    if (dispatch) {
      // 获取最新的数据
      dispatch({
        type: 'user/getNotice',
        payload: {
          pageSize: 10000,
        },
      }).then((result: any) => {
        if (result) {
          // eslint-disable-next-line react/no-unused-state
          this.setState({ show: false });
        }
      });
    }
  };

  changeReadState = (clickedItem: NoticeItem): void => {
    const { id } = clickedItem;
    const { dispatch } = this.props;
    if (dispatch) {
      dispatch({
        type: 'global/changeNoticeReadState',
        payload: id,
      });
    }
  };

  handleNoticeClear = (title: string, key: string) => {
    const { dispatch } = this.props;
    message.success(`${formatMessage({ id: 'component.noticeIcon.cleared' })} ${title}`);
    if (dispatch) {
      dispatch({
        type: 'global/clearNotices',
        payload: key,
      });
    }
  };

  getNoticeData = (): { [key: string]: NoticeItem[] } => {
    const { notices = [] } = this.props;
    if (notices.length === 0) {
      return {};
    }
    const newNotices = notices.map(notice => {
      const newNotice = { ...notice };
      if (newNotice.datetime) {
        newNotice.datetime = moment(notice.datetime as string).fromNow();
      }
      if (newNotice.id) {
        newNotice.key = newNotice.id;
      }
      if (newNotice.extra && newNotice.status) {
        const color = {
          todo: '',
          processing: 'blue',
          urgent: 'red',
          doing: 'gold',
        }[newNotice.status];
        newNotice.extra = (
          <Tag color={color} style={{ marginRight: 0 }}>
            {newNotice.extra}
          </Tag>
        );
      }
      return newNotice;
    });
    return groupBy(newNotices, 'type');
  };

  getUnreadData = (noticeData: { [key: string]: NoticeItem[] }) => {
    const unreadMsg: { [key: string]: number } = {};
    Object.keys(noticeData).forEach(key => {
      const value = noticeData[key];
      if (!unreadMsg[key]) {
        unreadMsg[key] = 0;
      }
      if (Array.isArray(value)) {
        unreadMsg[key] = value.filter(item => !item.read).length;
      }
    });
    return unreadMsg;
  };

  // 打开提醒弹框
  openToast = (visible: any) => {
    if (visible) {
      // this.getNotice();
    }
  };

  // 点击跟进事件
  // handleFollow = (record: { id: any }) => {
  //   this.setState({ show: true });
  //   const { dispatch } = this.props;
  //   if (dispatch) {
  //     dispatch({
  //       type: 'user/followNotice',
  //       payload: {
  //         id: record.id,
  //       },
  //     }).then((result: any) => {
  //       if (result) {
  //         this.getTipNum();
  //         this.getNotice();
  //       }
  //     });
  //   }
  // };
  // 获取todolist
  getTodoList = () => {
    
    const { dispatch } = this.props;
    const { search } = this.state;
    const { userId } = search;
    const data = {
      teacherId: userId,
    };
    dispatch({
      type: 'user/todoList',
      payload: data,
    }).then((res)=>{
      this.setState({
        todoList:res
      })
    });
  };
  // 处理跟进model
  handleFollow = record => {
    const { follow } = this.state;
    const { customerId } = record;
    if(customerId){
      follow.studentId = customerId;
    }
    follow.followVisible = true;
    this.setState({
      follow,
    });
  };

  // 查询跟进记录列表
  queryFollowList = studentId => {
    const { dispatch } = this.props;
    const { userId, campDataId, classId } = this.state.search;
    const parmas = {
      teacherId: userId,
      studentId: String(studentId),
      campdataId: campDataId,
      classId,
    };
    dispatch({
      type: 'myDashboard/LiveEntryFollows',
      payload: parmas,
    }).then(res => {
      if (res) {
        this.setState({
          followModalData: res,
          followModalVisible: true,
        })
      }
    })
  }

  // 执行跟进操作
  handleFollowEvent = parmas => {
    const { dispatch } = this.props;
    dispatch({
      type: 'myDashboard/handleFollowEvent',
      payload: parmas,
    })
  }
  
    //用户详情弹窗
  renderDetailMadal = () => {
    const {followModalVisible ,followModalData} = this.state;
    return (
      <Modal
        className={styles.modal_label}
        width="900px"
        title="用户详情"
        visible={followModalVisible}
        onCancel={this.handleDetailCancel}
        onOk={this.handleDetailOK}
        footer={null}
        zIndex={1051}
      >
        <div style={{marginBottom:'20px'}} className={styles.bacisinfo}>
          <span>用户姓名：{followModalData.userName ? followModalData.userName : '无'}</span>
          <span>联系方式：{followModalData.phone ? followModalData.phone : '无'}</span>
          <span>报名日期：{followModalData.reportTime ? followModalData.reportTime : '无'}</span>
          <span>购课状态：{this.state.buyCourseStatus[followModalData.buyCourseStatus]}</span>
          <span>渠道来源：{followModalData.channelSource ? this.handleSourceClass(followModalData.channelSource) : '无'}</span>
        </div>
        <div>
          <span className={styles.user_detail_label}>{followModalData.campDateName ? followModalData.campDateName : '无'}</span>
          <span className={styles.user_detail_label}>{followModalData.className ? followModalData.className : '无'}</span>
          <span className={styles.user_detail_label}>{followModalData.groupName ? followModalData.groupName : '无'}</span>
          {followModalData.addStatus === 1 ? <span className={styles.green_label}>已进群</span> : <span className={styles.red_label}>未加群</span>}    
        </div>
        <div className={styles.follow_list_area}>
          <h3>跟进记录</h3>
          <ul className={styles.follow_list}>
            {
              (followModalData.followLogList == null || followModalData.followLogList.length === 0) ? <Empty /> :
              followModalData.followLogList.map((item, i) => (
              <li className={styles.follow_list_li}>
                <p className={styles.text_left}>{item.content}
                  <p className={styles.next_follow_time}>下次跟进时间：{item.nextFollowTime}</p>
                </p>
                <p className={styles.text_right}>
                  <p className={item.tag == 0 || item.tag == null ? styles.type_null : ( item.tag == 1 ? styles.type_s : (item.tag == 2 || item.tag == 3 || item.tag == 4 ? styles.type_a : (item.tag == 5 || item.tag == 6 || item.tag == 7 ? styles.type_b : styles.type_c))) }>{this.state.customTagList[item.tag]}</p>
                  <p className={styles.text_right_date}>{item.createTime}</p>
                </p>
              </li>
            ))
            }
            <li style={{textAlign:'right',marginTop:'20px'}}>
              <Button icon="plus-circle" type="primary" className={styles.add_follow_btn} onClick={this.handleFollow}>新增跟进记录</Button>
            </li>
          </ul>
        </div>
      </Modal>
    )
  }
  //点击查看更多
  viewDetail = (studentId,data) => {
    const { follow,search } = this.state;
    // const { customerId } = studentId;
    // const { studentId } = data;
    follow.studentId = studentId;
    follow.followVisible = false;
    this.setState({
      follow,
    });
    const { dispatch } = this.props;
    const { userId } = this.state.search;
    const {campDateId, classId ,teacherId} = data;
    const parmas = {
      teacherId: teacherId,
      studentId: String(studentId),
      campdataId: campDateId,
      classId: classId,
    };
    search.campDateId = campDateId;
    search.classId = classId;
    
    dispatch({
      type: 'myDashboard/LiveEntryFollows',
      payload: parmas,
    }).then(res => {
      if (res) {
        res.campDateName = data.campDateName;
        res.className = data.className;
        res.groupName = data.groupName;
        res.addStatus = data.addStatus;
        this.setState({
          search,
          followModalData: res,
          followModalVisible: true,
        })
      }
    })
    this.handleFollowEvent(parmas)
  }
  // 处理渠道来源类型
  handleSourceClass = str => {
    const num = Number(str);
    const sourceClass = {
      1: '安卓',
      2: 'IOS',
      3: '微信',
      4: '其它-渠道-抖音',
      5: '小程序',
      6: '老师端APP注册',
    }
    return sourceClass[num];
  }
  //关闭用户详情
  handleDetailCancel = () => {
    this.setState({
      followModalVisible: false,
      followModalData: {
        followLogList: [],
      },
    })
    this.getTodoList();
  }
    // 跟进弹框
    renderFollowModal = () => {
      const { confirmLoading } = this.props;
      const { follow, customTag } = this.state;
      const { followVisible } = follow;
      const onChange = (date, dateString) => {
        follow.remindTime = dateString;
        follow.rangePickerValue = date;
        this.setState({
          follow,
        });
      };
      const searchSelectChange = val => {
        follow.tag = val;
        this.setState({
          follow,
        });
      };
      const onTextArea = e => {
        follow.content = e;
        this.setState({
          follow,
        });
      };
      return (
        <Modal
          className={styles.modal_label}
          width="600px"
          title="跟进"
          visible={followVisible}
          onCancel={this.handlFollowCancel}
          onOk={this.handlFollowOk}
          confirmLoading={confirmLoading}
          zIndex={1052}
        >
          <Form>
            <Row>
              <Col className={styles.customize_label}>
                <FormItem label="我的自定义标签" >
                  <Select
                    value={this.state.follow.tag}
                    onChange={searchSelectChange}
                    style={{ width: '200px' }}
                    getPopupContainer={triggerNode =>
                      triggerNode.parentNode
                   }
                  >
                    {customTag.map(item => (
                      <Option key="id" value={item.id}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={24}>   
                <FormItem style={{ display: 'block'}}>
                  <TextArea
                    placeholder="请输入..."
                    value={this.state.follow.content}
                    onChange={val => onTextArea(trim(val.target.value, 'number', 200))}
                    rows={4}
                    style={{width:'100%' , height:'200px', resize: 'none' }}
                  />
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col>  
                <FormItem style={{ display: 'flex',flexFlow: 'row-reverse' }}>
                  <span>下次跟进时间:</span>               
                  <DatePicker
                    format="YYYY-MM-DD HH:mm"
                    showTime={{ format: 'HH:mm' }}
                    value={this.state.follow.rangePickerValue}
                    onChange={onChange}
                    getCalendarContainer={triggerNode => triggerNode.parentNode}
                    style={{ marginLeft: '14px', width: '200px' }}
                  />         
                </FormItem>
              </Col>
            </Row>
          </Form>
        </Modal>
      );
    };
  
    // 关闭跟进弹框
    handlFollowCancel = () => {
      const { follow } = this.state;
      Object.keys(follow).forEach(key => {
        if (key == 'tag') {
          follow[key] = null;
          return;
        }
        if (key == 'followVisible') {
          follow[key] = false;
          return;
        }
        if (key == 'rangePickerValue') {
          follow[key] = null;
          return;
        }
        follow[key] = '';
      });
      this.setState({
        follow,
      });
      this.getTodoList();
    };
  
    // 跟进学员确认操作
    handlFollowOk = () => {
      const { dispatch } = this.props;
      const { follow, search } = this.state;
      const { studentId, tag, remindTime, content } = follow;
      const { campDateId, classId, groupId } = search;
      if (remindTime == '') {
        error('请选择下次跟进时间');
        return;
      }
      dispatch({
        type: 'student/addFollowRecord',
        payload: {
          liveCampDateId: campDateId,
          liveClassId: classId,
          remindTime,
          studentId,
          content,
          tag,
          campDateId:campDateId,
          classId:classId,
        },
      }).then(result => {
        if (result) {
          Object.keys(follow).forEach(key => {
            if (key == 'tag') {
              follow[key] = null;
              return;
            }
            if (key == 'followVisible') {
              follow[key] = false;
              return;
            }
            if (key == 'rangePickerValue') {
              follow[key] = null;
              return;
            }
            follow[key] = '';
          });
          this.setState({
            follow,
  
          });
        }
      });
    };
  render() {
    // @ts-ignore
    const { currentUser, onNoticeVisibleChange, count, noticeObj } = this.props;
    // @ts-ignore
    const { show } = this.state;
    return (
      <>
      <NoticeIcon
        className={styles.action}
        count={this.state.todoList && this.state.todoList.length}
        onItemClick={item => {
          this.changeReadState(item as NoticeItem);
        }}
        loading={false}
        clearText={formatMessage({ id: 'component.noticeIcon.clear' })}
        viewMoreText={formatMessage({ id: 'component.noticeIcon.view-more' })}
        onClear={this.handleNoticeClear}
        onPopupVisibleChange={onNoticeVisibleChange}
        onViewMore={() => message.info('Click on view more')}
        clearClose
        dataSoure={this.state.todoList}
        openToast={this.openToast}
        follow={this.viewDetail}
      >
        <div></div>
        
      </NoticeIcon>
        {
        this.renderDetailMadal()
        }
        {
        this.renderFollowModal()
        }
      </>
      
    );
  }
}

export default connect(({ user, global, loading }: ConnectState) => ({
  currentUser: user.currentUser,
  count: user.count,
  noticeObj: user.noticeObj,
  collapsed: global.collapsed,
  fetchingMoreNotices: loading.effects['global/fetchMoreNotices'],
  fetchingNotices: loading.effects['global/fetchNotices'],
  notices: global.notices,
}))(GlobalHeaderRight);
