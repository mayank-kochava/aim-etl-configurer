import { useDataSupplierConfigs } from "@/hooks/useDataSupplierConfigs";
import { Table, Tag, Typography, Space, Flex, Button } from "antd";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import type { ColumnsType } from "antd/es/table";
import Pageloader from "@/components/pageloader";

const { Title } = Typography;

interface DataSupplierConfig {
  IdAsString: string;
  ConnectionName: string;
  AdvertiserName: string;
  ConnectorType: string;
  Active: boolean;
}

export default function DataSupplierConfigsTable() {
  const { data, isLoading } = useDataSupplierConfigs();
  const router = useRouter();

  const columns: ColumnsType<DataSupplierConfig> = [
    {
      title: "Connection Name",
      dataIndex: "ConnectionName",
      key: "ConnectionName",
      sorter: (a, b) => a.ConnectionName.localeCompare(b.ConnectionName),
      filters: data
        ? Array.from(
            new Set(data.map((item: DataSupplierConfig) => item.ConnectionName))
          ).map((name) => ({ text: String(name), value: String(name) }))
        : [],
      onFilter: (value, record) => record.ConnectionName === value,
      filterSearch: true,
    },
    {
      title: "Advertiser Name",
      dataIndex: "AdvertiserName",
      key: "AdvertiserName",
      sorter: (a, b) => a.AdvertiserName.localeCompare(b.AdvertiserName),
      filters: data
        ? Array.from(
            new Set(data.map((item: DataSupplierConfig) => item.AdvertiserName))
          ).map((name) => ({ text: String(name), value: String(name) }))
        : [],
      onFilter: (value, record) => record.AdvertiserName === value,
      filterSearch: true,
    },
    {
      title: "Connector Type",
      dataIndex: "ConnectorType",
      key: "ConnectorType",
      filters: data
        ? Array.from(
            new Set(data.map((item: DataSupplierConfig) => item.ConnectorType))
          ).map((type) => ({ text: String(type), value: String(type) }))
        : [],
      onFilter: (value, record) => record.ConnectorType === value,
    },
    {
      title: "Status",
      dataIndex: "Active",
      key: "Active",
      render: (active: boolean) => (
        <Tag color={active ? "green" : "red"}>
          {active ? "Active" : "Inactive"}
        </Tag>
      ),
      filters: [
        { text: "Active", value: true },
        { text: "Inactive", value: false },
      ],
      onFilter: (value, record) => record.Active === value,
    },
    {
      title: "",
      key: "actions",
      width: "5rem",
      align: "center",
      render: (_text, record) => (
        <Button
          type="default"
          shape="circle"
          icon={<EditOutlined />}
          onClick={() =>
            router.push(`/data-supplier-config/${record.IdAsString}`)
          }
        />
      ),
    },
  ];

  if (isLoading) return <Pageloader />;

  return (
    <Space
      direction="vertical"
      size="large"
      style={{ display: "flex", height: "100%", overflow: "hidden" }}
    >
      <Flex justify="space-between" align="center">
        <Title level={2} style={{ margin: 0 }}>
          Data Supplier Configurations
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => router.push("/data-supplier-config")}
        >
          Add Config
        </Button>
      </Flex>
      <Table
        bordered
        columns={columns}
        dataSource={data || []}
        rowKey="IdAsString"
        loading={isLoading}
        scroll={{ y: "calc(100vh - 18rem)" }}
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          showTotal: (total) => `Total ${total} items`,
        }}
      />
    </Space>
  );
}
