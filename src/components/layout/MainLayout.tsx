import { Layout, Menu, theme, Flex, MenuProps, Select } from "antd";
import {
  DatabaseOutlined,
  RocketOutlined,
  MergeCellsOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useAdvertisers } from "@/hooks/useAdvertisers";
import { useAdvertiserContext } from "@/contexts/AdvertiserContext";

const { Sider, Content, Header } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const router = useRouter();
  const [collapsed] = useState(true);
  const {
    token: { colorBgContainer, borderRadiusLG, colorBorder, colorPrimary },
  } = theme.useToken();

  const { data: advertisers, isLoading: advertisersLoading } = useAdvertisers();
  const { selectedAdvertiser, setSelectedAdvertiser, isLoading: contextLoading } = useAdvertiserContext();

  useEffect(() => {
    if (!contextLoading && !advertisersLoading && advertisers && advertisers.length > 0 && !selectedAdvertiser) {
      setSelectedAdvertiser(advertisers[0]);
    }
  }, [advertisers, advertisersLoading, contextLoading, selectedAdvertiser, setSelectedAdvertiser]);

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
    getItem("Data Supplier Configs", "/", <DatabaseOutlined />),
    getItem(
      "Data Consolidation",
      "/data-consolidation-rules",
      <MergeCellsOutlined />
    ),
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    router.push(key);
  };

  return (
    <Layout style={{ height: "100vh", overflow: "hidden" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed
        defaultCollapsed
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
          inlineCollapsed={true}
          selectedKeys={[router.pathname]}
          items={items}
          onClick={handleMenuClick}
          style={{ marginTop: "1rem" }}
        />
      </Sider>
      <Layout
        style={{ overflow: "scroll", display: "flex", flexDirection: "column" }}
      >
        <Header
          style={{
            background: colorBgContainer,
            padding: "0 1.5rem",
            borderBottom: `0.0625rem solid ${colorBorder}`,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <Select
            style={{ minWidth: "15rem" }}
            placeholder="Select Advertiser"
            loading={advertisersLoading}
            value={selectedAdvertiser?.IdAsString}
            onChange={(value) => {
              const advertiser = advertisers?.find(
                (adv) => adv.IdAsString === value
              );
              if (advertiser) {
                setSelectedAdvertiser(advertiser);
                // Redirect to home page when advertiser changes
                if (router.pathname !== "/") {
                  router.push("/");
                }
              }
            }}
            options={advertisers?.map((adv) => ({
              label: adv.DisplayName,
              value: adv.IdAsString,
            }))}
          />
        </Header>
        <Content
          style={{
            margin: "1.5rem 1rem",
            padding: "1.5rem",
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            flex: 1,
            overflow: "scroll",
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
