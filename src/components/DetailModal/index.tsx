import React from 'react';
import { Modal, Button } from 'antd';

interface DetailModalProps<T> {
  visible: boolean;
  onClose: () => void;
  record: T | null;
  title: string;
  renderContent: (record: T) => React.ReactNode;
  width?: number;
}

function DetailModal<T>({
  visible,
  onClose,
  record,
  title,
  renderContent,
  width = 600,
}: DetailModalProps<T>) {
  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>
      ]}
      width={width}
      maskClosable={true}
    >
      {record && renderContent(record)}
    </Modal>
  );
}

export default DetailModal;
