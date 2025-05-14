import React from 'react';
import { Alert, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

interface ErrorHandlerProps {
  error: string | null;
  hasError: boolean;
  onRetry: () => void;
  showRetryButton?: boolean;
}

const ErrorHandler: React.FC<ErrorHandlerProps> = ({
  error,
  hasError,
  onRetry,
  showRetryButton = true,
}) => {
  return (
    <>
      {showRetryButton && hasError && (
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={onRetry}
          style={{ marginBottom: 16 }}
        >
          Try Again
        </Button>
      )}
      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
    </>
  );
};

export default ErrorHandler;
