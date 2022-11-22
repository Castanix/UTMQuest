import { Card, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import React from 'react';

import './Loading.css';

const Loading = () => (
  <Card bordered={false} className="loading">
    <Spin indicator={<LoadingOutlined className="spinner" />} size="large" />
  </Card>
);

export default Loading;
