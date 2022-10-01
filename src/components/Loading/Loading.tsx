import { Card, Spin } from "antd";
import { LoadingOutlined } from '@ant-design/icons'

import "./Loading.css"


const Loading = () => (
    <Card bordered={false} className='loading'>
        <Spin indicator={<LoadingOutlined className="spinner" />} />
    </Card>
)

export default Loading;