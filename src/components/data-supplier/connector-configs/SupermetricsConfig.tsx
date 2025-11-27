import {
  Form,
  Input,
  Select,
  Row,
  Col,
  Button,
  Checkbox,
  Collapse,
  FormInstance,
  Typography,
} from "antd";
import { PlusOutlined, CloseOutlined } from "@ant-design/icons";
import { useState } from "react";

const { Option } = Select;
const { Title } = Typography;

interface NetworkConfig {
  id: string;
  enabled: boolean;
  network: string;
  appIds: string;
  filePath: string;
  fileNameFormat: string;
  fileDateFormat: string;
  defaultOs: string;
}

interface SupermetricsConfigProps {
  form: FormInstance;
}

export function SupermetricsConfig({ form }: SupermetricsConfigProps) {
  const [networkConfigs, setNetworkConfigs] = useState<NetworkConfig[]>([
    {
      id: "1",
      enabled: true,
      network: "Google Ads",
      appIds:
        "com.photoaffections.freeprints,id518158653,https://www.freeprintsapp.com/",
      filePath: "supermetrics/google_ads/campaign/",
      fileNameFormat: "GOOGLEADS_GA_CAMPAIGN_{0}",
      fileDateFormat: "yyyyMMdd",
      defaultOs: "web",
    },
    {
      id: "2",
      enabled: true,
      network: "Facebook Ads",
      appIds:
        "com.photoaffections.freeprints,id518158653,https://www.freeprintsapp.com/",
      filePath: "supermetrics/facebook_summary/",
      fileNameFormat: "FBADS_SUMMARY_WEBSITE_CONVERSION_VALUE_{0}",
      fileDateFormat: "yyyyMMdd",
      defaultOs: "web",
    },
    {
      id: "3",
      enabled: true,
      network: "Apple Search Ads",
      appIds:
        "com.photoaffections.freeprints,id518158653,https://www.freeprintsapp.com/",
      filePath: "supermetrics/apple_search_ads/adgroup/",
      fileNameFormat: "ASA_ASA_ADGROUP_2_{0}",
      fileDateFormat: "yyyyMMdd",
      defaultOs: "ios",
    },
  ]);

  const addNetworkConfig = () => {
    const newConfig: NetworkConfig = {
      id: String(Date.now()),
      enabled: true,
      network: "Google Ads",
      appIds: "",
      filePath: "",
      fileNameFormat: "",
      fileDateFormat: "yyyyMMdd",
      defaultOs: "web",
    };
    setNetworkConfigs([...networkConfigs, newConfig]);
  };

  const removeNetworkConfig = (id: string) => {
    setNetworkConfigs(networkConfigs.filter((c) => c.id !== id));
  };

  const updateNetworkConfig = (id: string, updates: Partial<NetworkConfig>) => {
    setNetworkConfigs(
      networkConfigs.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  return (
    <div>
      <div
        style={{
          border: "1px solid #d9d9d9",
          borderRadius: 6,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <Title level={4} style={{ marginBottom: 16 }}>
          AWS Credential
        </Title>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="AssumedRoleArn"
              label={
                <span>
                  Assumed Role ARN <span style={{ color: "red" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please enter ARN" }]}
            >
              <Input
                placeholder="arn:aws:iam::123456789:role/role-name"
                style={{ fontFamily: "monospace", fontSize: 13 }}
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              name="RoleSessionName"
              label={
                <span>
                  Role Session Name <span style={{ color: "red" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please enter session name" }]}
            >
              <Input placeholder="session-name" />
            </Form.Item>
          </Col>
        </Row>
      </div>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="AwsRegion"
            label={
              <span>
                AWS Region <span style={{ color: "red" }}>*</span>
              </span>
            }
            rules={[{ required: true, message: "Please select region" }]}
          >
            <Select placeholder="Select region">
              <Option value="us-east-1">us-east-1</Option>
              <Option value="us-west-2">us-west-2</Option>
              <Option value="eu-west-1">eu-west-1</Option>
            </Select>
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="AwsBucket"
            label={
              <span>
                AWS Bucket <span style={{ color: "red" }}>*</span>
              </span>
            }
            rules={[{ required: true, message: "Please enter bucket name" }]}
          >
            <Input placeholder="my-bucket-name" />
          </Form.Item>
        </Col>
      </Row>

      <div
        style={{
          border: "1px solid #d9d9d9",
          borderRadius: 6,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            Supermetrics Network Configs
          </Title>
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={addNetworkConfig}
            size="small"
          >
            Add Network
          </Button>
        </div>

        <Collapse accordion>
          {networkConfigs.map((config, index) => (
            <Collapse.Panel
              key={config.id}
              header={
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    width: "100%",
                  }}
                >
                  <Checkbox
                    checked={config.enabled}
                    onChange={(e) => {
                      e.stopPropagation();
                      updateNetworkConfig(config.id, {
                        enabled: e.target.checked,
                      });
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span>{config.network}</span>
                  {!config.enabled && (
                    <span
                      style={{
                        fontSize: 12,
                        color: "#8c8c8c",
                        marginLeft: 8,
                      }}
                    >
                      (Disabled)
                    </span>
                  )}
                </div>
              }
              extra={
                <Button
                  type="text"
                  danger
                  icon={<CloseOutlined />}
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNetworkConfig(config.id);
                  }}
                />
              }
            >
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item label="Network Type">
                    <Select
                      value={config.network}
                      onChange={(value) =>
                        updateNetworkConfig(config.id, { network: value })
                      }
                    >
                      <Option value="Google Ads">Google Ads</Option>
                      <Option value="Facebook Ads">Facebook Ads</Option>
                      <Option value="Apple Search Ads">Apple Search Ads</Option>
                      <Option value="TikTok Ads">TikTok Ads</Option>
                      <Option value="AppLovin">AppLovin</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item label="App IDs (comma-separated)">
                    <Input
                      value={config.appIds}
                      onChange={(e) =>
                        updateNetworkConfig(config.id, {
                          appIds: e.target.value,
                        })
                      }
                      placeholder="com.example.app,id123456,https://..."
                      style={{ fontFamily: "monospace", fontSize: 13 }}
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item label="File Path">
                    <Input
                      value={config.filePath}
                      onChange={(e) =>
                        updateNetworkConfig(config.id, {
                          filePath: e.target.value,
                        })
                      }
                      placeholder="supermetrics/network/"
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item label="File Name Format">
                    <Input
                      value={config.fileNameFormat}
                      onChange={(e) =>
                        updateNetworkConfig(config.id, {
                          fileNameFormat: e.target.value,
                        })
                      }
                      placeholder="NETWORK_FILE_{0}"
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item label="File Date Format">
                    <Input
                      value={config.fileDateFormat}
                      onChange={(e) =>
                        updateNetworkConfig(config.id, {
                          fileDateFormat: e.target.value,
                        })
                      }
                      placeholder="yyyyMMdd"
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item label="Default OS">
                    <Select
                      value={config.defaultOs}
                      onChange={(value) =>
                        updateNetworkConfig(config.id, { defaultOs: value })
                      }
                    >
                      <Option value="web">Web</Option>
                      <Option value="ios">iOS</Option>
                      <Option value="android">Android</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Collapse.Panel>
          ))}
        </Collapse>
      </div>
    </div>
  );
}
