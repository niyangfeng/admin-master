import { Modal, notification, Select } from 'antd';
import React, { useState, useEffect } from 'react';

function DialogConfirmed(props) {
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleOnOk = () => {
    setConfirmLoading(true);
    props.onResult(true);
  };

  useEffect(() => {
    if (!props.visible) {
      setConfirmLoading(false);
    }
  }, [props.visible]);

  return (
    <Modal
      {...props}
      onCancel={() => props.onResult(false)}
      onOk={handleOnOk}
      afterClose={() => {
        setConfirmLoading(false);
      }}
      maskClosable={false}
      confirmLoading={confirmLoading}
    >
      {props.render}
    </Modal>
  );
}

export default DialogConfirmed;
