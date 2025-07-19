import React from 'react';
import { Layout, Menu } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';

const { Header } = Layout;

// 🔹 Define routes for items
const menuItems = [
  { label: 'Home', key: 'home', path: '/' },
  { label: 'About', key: 'about', path: '/about' },
  { label: 'Contact', key: 'contact', path: '/contact' },
];

function Navbar() {
  const navigate = useNavigate();

  const handleMenuClick = (e) => {
    const selected = menuItems.find(item => item.key === e.key);
    if (selected?.path) {
      navigate(selected.path);
    }
  };

  return (
    <Layout>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ color: '#fff', fontWeight: 'bold', marginRight: '2rem' }}>
          <Link to={'/'}>HospitalForYou</Link>
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['home']}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ flex: 1, minWidth: 0 }}
          overflowedIndicator={<MenuOutlined />}
        />
      </Header>
    </Layout>
  );
}

export default Navbar;
