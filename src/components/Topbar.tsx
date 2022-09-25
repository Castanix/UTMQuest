import { Layout, Menu, Space } from 'antd';
import { CaretDownFilled, BookOutlined } from '@ant-design/icons'
import "./Topbar.css"
import React from 'react';
import { Link } from 'react-router-dom';

const { Header, Content } = Layout;

const Topbar = ({ children }: { children: React.ReactNode }) => (
    <Layout>
        <Header className='header'>
            <Link to="/" className='logo'><BookOutlined /> <Space /> utmQuest</Link>
            <Menu
                className='menu'
                theme="dark"
                mode="horizontal"
                selectable={false}>
                <Menu.Item key="courses"><Link to="/courses">Courses</Link></Menu.Item>
                <Menu.SubMenu key="subMenu" className='subMenu' title={<span>Username <CaretDownFilled /></span>}>
                    <Menu.Item key="profile"><Link to="/profile">Profile</Link></Menu.Item>
                    <Menu.Item key="theme">Dark Mode</Menu.Item>
                    <Menu.Item key="logout">Sign out</Menu.Item>
                </Menu.SubMenu>

            </Menu>
        </Header>
        <Content>
            <div className="content">
                {children}
            </div>
        </Content>
    </Layout >
);

export default Topbar;