import { Button, Card, Result } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';

import './ErrorMessage.css';


const ErrorMessage = ({ title, link, message }: { title: string, link: string, message: string }) => (
    <Card bordered={false} className="error">
        <Result
            title={title}
            extra={
                link !== '.'
                    ? <Link to={link}><Button type="primary" shape='round'>{message}</Button></Link>
                    : <Button type='primary' shape='round' onClick={() => window.location.reload()}>{message}</Button>
            }
        />
    </Card>
)

export default ErrorMessage;