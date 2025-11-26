import { Form, Input, Row, Col, Switch, DatePicker, Space, Button } from "antd";
import { FormInstance } from "antd/lib/form";
import { PlusOutlined, CloseOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

interface BranchConfigProps {
  form: FormInstance;
}

export function BranchConfig({ form }: BranchConfigProps) {
  const isDateRange = Form.useWatch(["AdvertiserConfig", "DateRangeConfig", "IsDateRange"], form);

  return (
    <div>
      <h4 style={{ marginBottom: 16 }}>Branch Configuration</h4>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name={["AdvertiserConfig", "Currency"]}
            label="Currency"
          >
            <Input placeholder="USD" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name={["AdvertiserConfig", "CrossEventAPIAvailable"]}
            label="Cross Event API Available"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Col>
      </Row>

      <h4 style={{ marginTop: 16, marginBottom: 16 }}>Date Range Configuration</h4>
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
                getValueFromEvent={(date) => date ? date.format("YYYY-MM-DD") : null}
                getValueProps={(value) => ({ value: value ? dayjs(value) : null })}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name={["AdvertiserConfig", "DateRangeConfig", "EndDate"]}
                label="End Date"
                getValueFromEvent={(date) => date ? date.format("YYYY-MM-DD") : null}
                getValueProps={(value) => ({ value: value ? dayjs(value) : null })}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </>
        )}
      </Row>

      <h4 style={{ marginTop: 16, marginBottom: 16 }}>Branch Apps</h4>
      <Form.List name={["AdvertiserConfig", "BranchApps"]}>
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Row key={key} gutter={16} style={{ marginBottom: 12 }}>
                <Col span={11}>
                  <Form.Item
                    {...restField}
                    name={[name, "AssociatedAppId"]}
                    label="Associated App ID"
                    rules={[{ required: true, message: "Required" }]}
                  >
                    <Input placeholder="App ID from Associated Apps" />
                  </Form.Item>
                </Col>
                <Col span={11}>
                  <Form.Item
                    {...restField}
                    name={[name, "BranchAppId"]}
                    label="Branch App ID"
                    rules={[{ required: true, message: "Required" }]}
                  >
                    <Input placeholder="Branch App ID" />
                  </Form.Item>
                </Col>
                <Col span={2}>
                  <Button
                    type="link"
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => remove(name)}
                    style={{ marginTop: 30 }}
                  />
                </Col>
              </Row>
            ))}
            <Form.Item>
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
              >
                Add Branch App
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>

      <h4 style={{ marginTop: 24, marginBottom: 16 }}>Connector Credential</h4>
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            name={["ConnectorCredential", "ApiKeySecretManagerKeyName"]}
            label="API Key Secret Manager Key Name"
            tooltip="Secret Manager key name for Branch API key"
          >
            <Input placeholder="BranchApiKey" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            name="DatasetType"
            label="Dataset Type"
          >
            <Input placeholder="CostAndAttribution" />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
}
