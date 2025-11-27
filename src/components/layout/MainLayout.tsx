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
    token: { colorBgContainer, colorBorder, colorPrimary },
  } = theme.useToken();

  const { data: advertisers, isLoading: advertisersLoading } = useAdvertisers();
  const {
    selectedAdvertiser,
    setSelectedAdvertiser,
    isLoading: contextLoading,
  } = useAdvertiserContext();

  useEffect(() => {
    if (
      !contextLoading &&
      !advertisersLoading &&
      advertisers &&
      advertisers.length > 0 &&
      !selectedAdvertiser
    ) {
      setSelectedAdvertiser(advertisers[0]);
    }
  }, [
    advertisers,
    advertisersLoading,
    contextLoading,
    selectedAdvertiser,
    setSelectedAdvertiser,
  ]);

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
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed
        defaultCollapsed
        width={80}
        collapsedWidth={80}
        theme="light"
        style={{
          borderRight: `1px solid ${colorBorder}`,
        }}
      >
        <Flex
          justify="center"
          align="center"
          style={{
            height: "64px",
            borderBottom: `1px solid ${colorBorder}`,
          }}
        >
          <RocketOutlined style={{ fontSize: "24px", color: colorPrimary }} />
        </Flex>
        <Menu
          theme="light"
          mode="inline"
          inlineCollapsed={true}
          selectedKeys={[router.pathname]}
          items={items}
          onClick={handleMenuClick}
          style={{
            borderRight: "none",
            paddingTop: "8px",
          }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: colorBgContainer,
            padding: "0 24px",
            borderBottom: `1px solid ${colorBorder}`,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            height: "64px",
            lineHeight: "64px",
          }}
        >
          <Select
            style={{ minWidth: "200px" }}
            placeholder="Select Advertiser"
            loading={advertisersLoading}
            value={selectedAdvertiser?.IdAsString}
            onChange={(value) => {
              const advertiser = advertisers?.find(
                (adv) => adv.IdAsString === value
              );
              if (advertiser) {
                setSelectedAdvertiser(advertiser);
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
            padding: "24px",
            minHeight: "calc(100vh - 64px)",
            overflow: "auto",
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
