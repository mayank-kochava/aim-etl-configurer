import {
  Form,
  Input,
  Row,
  Col,
  Switch,
  DatePicker,
  Button,
  Space,
  Typography,
} from "antd";
import { FormInstance } from "antd/lib/form";
import { PlusOutlined, CloseOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Title } = Typography;

interface GCSConfigProps {
  form: FormInstance;
}

export function GCSConfig({ form }: GCSConfigProps) {
  const isDateRange = Form.useWatch(
    ["AdvertiserConfig", "DateRangeConfig", "IsDateRange"],
    form
  );

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>
        GCS Configuration
      </Title>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            name={["AdvertiserConfig", "GcsBucketName"]}
            label="GCS Bucket Name"
            rules={[
              { required: true, message: "Please enter GCS bucket name" },
            ]}
          >
            <Input placeholder="my-gcs-bucket" />
          </Form.Item>
        </Col>
      </Row>

      <Title level={4} style={{ marginTop: 16, marginBottom: 16 }}>
        File Discovery Configuration
      </Title>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            name={[
              "AdvertiserConfig",
              "FileDiscoveryConfig",
              "HistoricalDataStartDate",
            ]}
            label="Historical Data Start Date"
            getValueFromEvent={(date) =>
              date ? date.format("YYYY-MM-DD") : null
            }
            getValueProps={(value) => ({ value: value ? dayjs(value) : null })}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="Locations">
        <Form.List
          name={["AdvertiserConfig", "FileDiscoveryConfig", "Locations"]}
        >
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space
                  key={key}
                  style={{ display: "flex", marginBottom: 8 }}
                  align="baseline"
                >
                  <Form.Item
                    {...restField}
                    name={name}
                    rules={[{ required: true, message: "Required" }]}
                    style={{ marginBottom: 0, flex: 1 }}
                  >
                    <Input placeholder="folder/path/" style={{ width: 400 }} />
                  </Form.Item>
                  <Button
                    type="link"
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => remove(name)}
                  />
                </Space>
              ))}
              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  icon={<PlusOutlined />}
                >
                  Add Location
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form.Item>

      <Form.Item label="File Patterns">
        <Form.List
          name={["AdvertiserConfig", "FileDiscoveryConfig", "FilePatterns"]}
        >
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space
                  key={key}
                  style={{ display: "flex", marginBottom: 8 }}
                  align="baseline"
                >
                  <Form.Item
                    {...restField}
                    name={name}
                    rules={[{ required: true, message: "Required" }]}
                    style={{ marginBottom: 0, flex: 1 }}
                  >
                    <Input
                      placeholder="*.csv or filename.csv"
                      style={{ width: 400 }}
                    />
                  </Form.Item>
                  <Button
                    type="link"
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => remove(name)}
                  />
                </Space>
              ))}
              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  icon={<PlusOutlined />}
                >
                  Add File Pattern
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form.Item>

      <Form.Item label="Date Patterns">
        <Form.List
          name={["AdvertiserConfig", "FileDiscoveryConfig", "DatePatterns"]}
        >
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space
                  key={key}
                  style={{ display: "flex", marginBottom: 8 }}
                  align="baseline"
                >
                  <Form.Item
                    {...restField}
                    name={name}
                    style={{ marginBottom: 0, flex: 1 }}
                  >
                    <Input placeholder="{yyyy-MM-dd}" style={{ width: 400 }} />
                  </Form.Item>
                  <Button
                    type="link"
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => remove(name)}
                  />
                </Space>
              ))}
              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  icon={<PlusOutlined />}
                >
                  Add Date Pattern
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name={[
              "AdvertiserConfig",
              "FileDiscoveryConfig",
              "Options",
              "SearchSubfolders",
            ]}
            label="Search Subfolders"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="Exclude Patterns">
        <Form.List
          name={[
            "AdvertiserConfig",
            "FileDiscoveryConfig",
            "Options",
            "ExcludePatterns",
          ]}
        >
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space
                  key={key}
                  style={{ display: "flex", marginBottom: 8 }}
                  align="baseline"
                >
                  <Form.Item
                    {...restField}
                    name={name}
                    style={{ marginBottom: 0, flex: 1 }}
                  >
                    <Input
                      placeholder="pattern_to_exclude"
                      style={{ width: 400 }}
                    />
                  </Form.Item>
                  <Button
                    type="link"
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => remove(name)}
                  />
                </Space>
              ))}
              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  icon={<PlusOutlined />}
                >
                  Add Exclude Pattern
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form.Item>

      <Title level={4} style={{ marginTop: 16, marginBottom: 16 }}>
        Date Range Configuration
      </Title>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name={["AdvertiserConfig", "DateRangeConfig", "IsDateRange"]}
            label="Use Date Range"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Col>
        {isDateRange && (
          <>
            <Col span={8}>
              <Form.Item
                name={["AdvertiserConfig", "DateRangeConfig", "StartDate"]}
                label="Start Date"
                getValueFromEvent={(date) =>
                  date ? date.format("YYYY-MM-DD") : null
                }
                getValueProps={(value) => ({
                  value: value ? dayjs(value) : null,
                })}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name={["AdvertiserConfig", "DateRangeConfig", "EndDate"]}
                label="End Date"
                getValueFromEvent={(date) =>
                  date ? date.format("YYYY-MM-DD") : null
                }
                getValueProps={(value) => ({
                  value: value ? dayjs(value) : null,
                })}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </>
        )}
      </Row>

      <Title level={4} style={{ marginTop: 24, marginBottom: 16 }}>
        Connector Credential
      </Title>
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            name={[
              "ConnectorCredential",
              "GcsEncodedCredentialSecretManagerKeyName",
            ]}
            label="GCS Encoded Credential Secret Manager Key Name"
            tooltip="Secret Manager key name for GCS credentials"
          >
            <Input placeholder="GcsEncodedGoogleApplicationCredentials" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item name="DatasetType" label="Dataset Type">
            <Input placeholder="CostAndAttribution" />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
}
