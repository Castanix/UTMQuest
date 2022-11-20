import { Layout, Menu, Space } from 'antd';
import {
  CaretDownFilled, BookOutlined, UserOutlined, LogoutOutlined,
} from '@ant-design/icons';
import './Topbar.css';
import React from 'react';
import { Link } from 'react-router-dom';

const { Header, Content } = Layout;
const Logo = () => (
  <span>
    <BookOutlined />
    {' '}
    <Space />
    <span className="show-logo">utmQuest</span>
  </span>
);

const DarkModeIcon = () => <svg className="theme" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" width="24" height="22"><path fill="#002a5c" fillRule="evenodd" stroke="#abb4c5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17a5 5 0 0 0-10 0M12 8V1M4.22 9.22l1.42 1.42M1 17h2M21 17h2M18.36 10.64l1.42-1.42M23 21H1M16 4l-4 4-4-4" /></svg>;

/* Icon for light mode; can be uncommented when theme switching is added
const LightModeIcon = () => (
    <svg className='theme' xmlns="http://www.w3.org/2000/svg" viewBox='0 0 30 30' width="24" height="22"><g fill="#002a5c" fill-rule="evenodd" stroke="#abb4c5" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" transform="translate(1 1)"><path d="M16 16a5 5 0 00-10 0M11 0v7M3.22 8.22l1.42 1.42M0 16h2M20 16h2M17.36 9.64l1.42-1.42M22 20H0M7 4l4-4 4 4" /></g></svg>
)
*/

const Topbar = ({ children }: { children: React.ReactNode }) => (
  <Layout>
    <Header className="header">
      <Link to="/" className="logo">
        <Logo />
      </Link>
      <Menu
        theme="dark"
        mode="horizontal"
        selectable={false}
      >
        <Menu.SubMenu
          key="sub-menu"
          className="sub-menu"
          title={(
            <span>
              Username
              <CaretDownFilled />
            </span>
          )}
        >
          <Menu.Item key="profile" icon={<UserOutlined />}>
            <Link to="/profile/dummy22">
              Profile
            </Link>
          </Menu.Item>
          <Menu.Item key="theme">
            <Space size={0}>
              <DarkModeIcon />
              Dark Mode
            </Space>
          </Menu.Item>
          <Menu.Item key="logout" icon={<LogoutOutlined />}>Sign out</Menu.Item>
        </Menu.SubMenu>

      </Menu>
    </Header>
    <Content>
      <div className="content">
        {children}
      </div>
    </Content>
  </Layout>
);

export default Topbar;
