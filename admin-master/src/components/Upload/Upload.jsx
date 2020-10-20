/**
 * TODO: 使用 ts 定义类型
 * @param type      上传类型 默认 'image', 可选其它
 * @param max       上传数量限制 默认 1
 * @param sizeLimit 上传大小限制，单位M 默认 3
 * @param fileList  回显图片，其中 uid status url 为必须字段
 * @param fileType  上传的文件类型，值有 video normal  默认normal  video需要使用单独的七牛云地址
 * @param showType  回显图片样式，对应ant design中 listType 支持三种基本样式 text, picture 和 picture-card
 * @param text      上传文字
 * @param multiple  是否支持多选文件，默认false
 * @param getKey    为函数，返回 key 字符串，key 中 $FILENAME、$RANDOM_STRING 分别会被替换为文件名字、随机字符串
 * @param beforeUpload  暴露beforeUpload 传入方法优先调用
 *
 */
// fileList = [
//   {
//     uid: '-1',
//     name: 'image.png',
//     status: 'done',
//     url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
//   }
// ]

import React from 'react';
import { notification, Upload, Icon, Modal, Spin, Button } from 'antd';
import moment from 'moment';
import { getQiniuToken } from '@/services/common';
import { getBase64, randomString } from '@/utils/utils';

const domain = QN_UPLOAD_DOMAIN; // eslint-disable-line no-undef
const CDN_DOMAIN = QN_CDN_DOMAIN; // eslint-disable-line no-undef
const CDN_VIDEO_DOMAIN = QN_VIDEO_DOMAIN; // eslint-disable-line no-undef
const videoType = new RegExp(VIDEO_TYPE); // eslint-disable-line no-undef
const domainKey = QN_CDN_KEY; // eslint-disable-line no-undef
const defaultConfig = {
  max: 1,
  sizeLimit: 3,
  showType: 'picture-card',
  text: '上传',
};

class MultiUpload extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ...defaultConfig,
      ...props,
      showUploadList: true,
      previewVisible: false,
      previewImage: '',
      qiniuToken: '',
      fileList: [],
      loading: false,
      popList: [],
    };
  }

  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(this.state.fileList) === JSON.stringify(nextProps.fileList)) return;
    this.setState(previousState => ({ ...previousState, ...nextProps }));
  }

  componentDidUpdate = preProps => {
    if (preProps.value !== this.props.value) {
      this.updateFileList();
    }
  };

  updateFileList = () => {
    let fileList = [];
    if (Array.isArray(this.props.value)) {
      fileList = [...this.props.value];
    }
    this.setState({
      fileList,
    });
  };

  getQiniuToken = () =>
    new Promise((resolve, reject) => {
      this.setState({ loading: true });
      let type = 1;
      if (this.props.fileType === 'video') type = 2;
      getQiniuToken(type)
        .then(res => {
          if (!res) return;
          this.setState({ qiniuToken: res.data });
          resolve(res.data);
        })
        .catch(reject)
        .finally(() => this.setState({ loading: false }));
    });

  handleCancel = () => this.setState({ previewVisible: false });

  handlePreview = async file => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    this.setState({
      previewImage: file.url || file.preview,
      previewVisible: true,
    });
  };

  handleChange = res => {
    if (res.file.status === 'error') {
      notification.error({ message: res.file.response.error });
      return;
    }

    if (this.state.controlled) {
      // 受控-不展示文件列表
      if (['done', 'removed'].includes(res.file.status)) {
        this.setState({ fileList: [] });
      } else {
        this.setState({ fileList: res.fileList });
      }
    } else {
      this.setState({ fileList: res.fileList });
    }

    if (['done', 'removed'].includes(res.file.status)) this.handlePop(res);
  };

  /**
   * 处理返回的数据给调用者
   * 只返回成功、失败
   */
  handlePop = res => {
    this.state.popList = res.fileList
      .map(item => {
        if (item.url) return item;
        if (!['done', 'removed'].includes(item.status)) return null;
        const qnDomain = videoType.test(item.response.key) ? CDN_VIDEO_DOMAIN : CDN_DOMAIN;
        const url = qnDomain + item.response.key;
        return { ...item, url };
      })
      .filter(Boolean);

    if (typeof this.props.onSuccess === 'function') {
      this.props.onSuccess(this.state.popList);
    } else if (typeof this.props.onChange === 'function') {
      // 为getFieldDecorator()提供接口
      this.props.onChange(this.state.popList);
    } else {
      notification.warn({ message: '未绑定 onSuccess 方法' });
    }
  };

  getFileType = name => {
    const splitArr = name.split('.');
    const len = splitArr.length;
    return len > 1 ? `.${splitArr[len - 1]}` : '';
  };

  beforeUpload = file =>
    new Promise(async (resolve, reject) => {
      const beforeUploadHook = this.props.beforeUpload;
      if (typeof beforeUploadHook === 'function') await beforeUploadHook(file);

      let receiveKey = this.props.getKey;
      // 获取文件后缀
      const fileType = this.getFileType(file.name);
      // 上传文件的名字
      const nameEncoded = encodeURIComponent(file.name).replace(/%/g, '');
      const name = nameEncoded.length > 32 ? nameEncoded.substring(0, 28) + fileType : nameEncoded;

      file.substringName = name;
      // 如果自定义key，则必须传入key
      if (receiveKey) {
        receiveKey = receiveKey();
        receiveKey = receiveKey.replace('$FILENAME', name);
        receiveKey = receiveKey.replace('$RANDOM_STRING', randomString(32));
        file.key = receiveKey;
      }
      const token = await this.getQiniuToken();
      if (!token) {
        notification.error({
          message: '获取token失败，请刷新重新尝试',
        });
        reject();
        return;
      }

      const isLt2M = file.size < 1024 * 1024 * this.state.sizeLimit;
      if (!isLt2M) {
        notification.error({ message: `文件不能超过${this.state.sizeLimit}M` });
        reject();
        return;
      }
      resolve();
    });

  render() {
    const { previewVisible, previewImage, showType, text, getKey, fileList, showUploadList } = this.state;
    const { multiple } = this.props;
    const uploadButton = () => {
      switch (showType) {
        case 'picture-card':
          return (
            <div>
              <Icon type="plus" />
            </div>
          );
        case 'update':
          return (
            <Button type="link">
              {text}
            </Button>
          );
        default:
          return (
            <Button type="link">
              <Icon type="upload" /> {text}
            </Button>
          );
      }
    };

    const uploadData = file => {
      const data = { token: this.state.qiniuToken };
      if (getKey && file.key !== 'DEFAULT') {
        data.key = file.key;
      } else {
        const now = moment(Date.now()).format('YYYYMMDDhhmm');
        // const key = this.props.fileType === 'video' ? 'kcxt' : domainKey
        data.key = `${domainKey}/${now}_${file.substringName}`;
      }
      return data;
    };

    const config = {
      name: 'file',
      action: domain,
      data: uploadData,
      beforeUpload: this.beforeUpload,
      onChange: this.handleChange,
    };

    // if (this.props.fileType === 'video') config.action = CDN_VIDEO_DOMAIN;

    return (
      <div className="clearfix" style={{ minHeight: showType === 'picture-card' ? 112 : 'auto' }}>
        <Spin spinning={this.state.loading}>
          {showType === 'drag' &&
            <Upload.Dragger {...config} multiple={multiple} style={{ padding: '50px 0' }}>
              <p className="ant-upload-drag-icon">
                <Icon type="inbox" />
              </p>
              <p className="ant-upload-text" style={{ color: '#888' }}>
                {this.state.text}
              </p>
            </Upload.Dragger>
          }
          {showType === 'update' &&
            <div>
              <Upload
                {...config}
                listType={showType}
                fileList={fileList}
                onPreview={this.handlePreview}
              >
                {fileList && fileList.length >= this.state.max ? null : uploadButton()}
              </Upload>
            </div>
          }
          {!['drag', 'update'].includes(showType) &&
            <Upload
              {...config}
              showUploadList={showUploadList}
              listType={showType}
              fileList={fileList}
              onPreview={this.handlePreview}
            >
              {fileList && fileList.length >= this.state.max ? null : uploadButton()}
            </Upload>
          }
        </Spin>
        <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
          <img alt="" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </div>
    );
  }
}

export default MultiUpload;
