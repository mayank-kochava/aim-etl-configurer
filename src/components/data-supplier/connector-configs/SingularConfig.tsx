import { Form, Input, Row, Col } from "antd";
import { FormInstance } from "antd/lib/form";

interface SingularConfigProps {
  form: FormInstance;
}

export function SingularConfig({ form }: SingularConfigProps) {
  return (
    <div>
      <h4 style={{ marginBottom: 16 }}>Singular Configuration</h4>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name={["AdvertiserConfig", "Dimensions"]}
            label="Dimensions"
            tooltip="Comma-separated list of dimensions"
          >
            <Input.TextArea
              placeholder="app,site_public_id,source,os,platform,country_field..."
              rows={3}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name={["AdvertiserConfig", "Metrics"]}
            label="Metrics"
            tooltip="Comma-separated list of metrics"
          >
            <Input.TextArea
              placeholder="adn_cost,custom_impressions,custom_clicks..."
              rows={3}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name={["AdvertiserConfig", "CohortMetrics"]}
            label="Cohort Metrics"
            tooltip="Comma-separated list of cohort metrics"
          >
            <Input.TextArea
              placeholder="revenue,custom_event_1,custom_event_2..."
              rows={3}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name={["AdvertiserConfig", "AdditionalCohortPeriods"]}
            label="Additional Cohort Periods"
            tooltip="e.g., actual"
          >
            <Input placeholder="actual" />
          </Form.Item>
        </Col>
      </Row>

      <h4 style={{ marginTop: 24, marginBottom: 16 }}>Connector Credential</h4>
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            name={["ConnectorCredential", "RiderApiKeySecretManagerKeyName"]}
            label="API Key Secret Manager Key Name"
            tooltip="Secret Manager key name for Singular API key"
          >
            <Input placeholder="SingularApiKey" />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
}
