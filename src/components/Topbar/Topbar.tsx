import { ConfigProvider, Layout, Menu, Space, theme } from 'antd';
import {
  CaretDownFilled, BookOutlined, UserOutlined, LogoutOutlined,
} from '@ant-design/icons';
import './Topbar.css';
import React, { createContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Dark from '../../Dark';
import Light from '../../Light';
import { onMobile } from '../EditHistory/EditHistory';

const { Header, Content } = Layout;
const Logo = () => (
  <span>
    <BookOutlined />
    {' '}
    <Space />
    <span className="show-logo">utmQuest</span>
  </span>
);
const { compactAlgorithm } = theme;
export const ThemeContext = createContext(true);

const DarkModeIcon = () => <svg className="theme" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" width="24" height="22"><path fill="#002a5c" fillRule="evenodd" stroke="#abb4c5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17a5 5 0 0 0-10 0M12 8V1M4.22 9.22l1.42 1.42M1 17h2M21 17h2M18.36 10.64l1.42-1.42M23 21H1M16 4l-4 4-4-4" /></svg>;

/* Icon for light mode; can be uncommented when theme switching is added */
const LightModeIcon = () => (
  <svg className='theme' xmlns="http://www.w3.org/2000/svg" viewBox='0 0 30 30' width="24" height="22"><g fill="#002a5c" fillRule="evenodd" stroke="#abb4c5" strokeLinejoin="round" strokeWidth="2" transform="translate(1 1)"><path d="M16 16a5 5 0 00-10 0M11 0v7M3.22 8.22l1.42 1.42M0 16h2M20 16h2M17.36 9.64l1.42-1.42M22 20H0M7 4l4-4 4 4" /></g></svg>
);

const Topbar = ({ children }: { children: React.ReactNode }) => {

  const [isLightMode, setLightMode] = useState(true);
  const [firstName, setFirstName] = useState("");

  useEffect(() => {
      fetch(`${process.env.REACT_APP_API_URI}/account/setup`, { method: "PUT" })
        .then((result) => {
          if (result.status !== 418 && result.status !== 201) throw Error("Could not perform first time login");
          return result.json();
        }).then(response => {
          setFirstName(response.firstName);
        }).catch((error) => {
          console.log(error);
    });
  }, []);

  const onThemeChange = () => setLightMode(!isLightMode);

  const signOut = () => {
    window.location.href = "/Shibboleth.sso/Logout";
  };

  return (
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
                {firstName}
                <CaretDownFilled />
              </span>
            )}
          >
            <Menu.Item key="profile" icon={<UserOutlined />}>
              <Link to="/profile/dummy22">
                Profile
              </Link>
            </Menu.Item>
            <Menu.Item key="theme" onClick={onThemeChange}>
              <Space size={0}>
                {isLightMode ? <DarkModeIcon /> : <LightModeIcon />}
                {isLightMode ? "Dark Mode" : "Light Mode"}
              </Space>
            </Menu.Item>
            <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={signOut}>Sign out</Menu.Item>
          </Menu.SubMenu>

        </Menu>
      </Header>
      <Content>
        <div className={`content`.concat(isLightMode ? " light" : " dark")}>
          <ConfigProvider theme={{
            token: isLightMode ? Light : Dark,
            algorithm: onMobile() ? [compactAlgorithm] : []
          }}>
            <ThemeContext.Provider value={isLightMode}>
              {children}
            </ThemeContext.Provider>
          </ConfigProvider>
        </div>
      </Content>
    </Layout>
  );
};

export default Topbar;
