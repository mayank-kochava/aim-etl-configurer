import { Layout, Menu, theme, Flex, MenuProps } from "antd";
import { DatabaseOutlined, RocketOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import { useState } from "react";

const { Sider, Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const router = useRouter();
  const [collapsed] = useState(true);
  const {
    token: { colorBgContainer, borderRadiusLG, colorBorder, colorPrimary },
  } = theme.useToken();

  type MenuItem = Required<MenuProps>["items"][number];

  function getItem(
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[]
  ): MenuItem {
    return {
      key,
      icon,
      children,
      label,
    } as MenuItem;
  }

  const items: MenuItem[] = [
    getItem(
      "Data Supplier Configs",
      "/data-supplier-configs",
      <DatabaseOutlined />
    ),
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    router.push(key);
  };

  return (
    <Layout style={{ height: "100vh", overflow: "hidden" }}>
      <Sider
        trigger={null}
        collapsible={true}
        collapsed={collapsed}
        width={80}
        collapsedWidth={80}
        theme="light"
      >
        <Flex
          justify="center"
          align="center"
          style={{
            height: "4rem",
            borderBlockEnd: `0.0625rem solid ${colorBorder}`,
          }}
        >
          <RocketOutlined style={{ fontSize: "1.5rem", color: colorPrimary }} />
        </Flex>
        <Menu
          theme="light"
          mode="inline"
          inlineCollapsed={collapsed}
          selectedKeys={[router.pathname]}
          items={items}
          onClick={handleMenuClick}
          style={{ marginTop: "1rem" }}
        />
      </Sider>
      <Layout
        style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}
      >
        <Content
          style={{
            margin: "1.5rem 1rem",
            padding: "1.5rem",
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
