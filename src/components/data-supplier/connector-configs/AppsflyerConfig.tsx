import { Form, Input, Row, Col, Tag, Button, FormInstance } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useState } from "react";

interface AppsflyerConfigProps {
  form: FormInstance;
}

export function AppsflyerConfig({ form }: AppsflyerConfigProps) {
  const [cohortKPIs, setCohortKPIs] = useState([
    { id: "1", name: "af_purchase" },
    { id: "2", name: "first_purchase" },
    { id: "3", name: "af_complete_registration" },
  ]);
  const [cohortKPIInput, setCohortKPIInput] = useState("");

  const [masterAggKPIs, setMasterAggKPIs] = useState([
    { id: "1", name: "impressions" },
    { id: "2", name: "clicks" },
    { id: "3", name: "installs" },
    { id: "4", name: "revenue" },
    { id: "5", name: "cost" },
  ]);
  const [masterAggKPIInput, setMasterAggKPIInput] = useState("");

  const handleCohortKPIKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && cohortKPIInput.trim()) {
      e.preventDefault();
      const newKPIs = cohortKPIInput
        .split(",")
        .map((kpi) => kpi.trim())
        .filter((kpi) => kpi && !cohortKPIs.some((k) => k.name === kpi))
        .map((kpi) => ({ id: String(Date.now() + Math.random()), name: kpi }));
      setCohortKPIs([...cohortKPIs, ...newKPIs]);
      setCohortKPIInput("");
    }
  };

  const handleMasterAggKPIKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter" && masterAggKPIInput.trim()) {
      e.preventDefault();
      const newKPIs = masterAggKPIInput
        .split(",")
        .map((kpi) => kpi.trim())
        .filter((kpi) => kpi && !masterAggKPIs.some((k) => k.name === kpi))
        .map((kpi) => ({ id: String(Date.now() + Math.random()), name: kpi }));
      setMasterAggKPIs([...masterAggKPIs, ...newKPIs]);
      setMasterAggKPIInput("");
    }
  };

  return (
    <div>
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            name="ApiKeySecretName"
            label={
              <span>
                API Key Secret Manager Key Name{" "}
                <span style={{ color: "red" }}>*</span>
              </span>
            }
            rules={[{ required: true, message: "Please enter API key" }]}
          >
            <Input.Password placeholder="Enter secret manager key name" />
          </Form.Item>
          <p style={{ fontSize: 12, color: "#8c8c8c", marginTop: -16 }}>
            The secret name in AWS Secret Manager containing the AppsFlyer API
            key
          </p>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            label={
              <span>
                Cohort KPIs{" "}
                <span style={{ fontSize: 12, color: "#8c8c8c" }}>
                  (comma-separated, press Enter)
                </span>
              </span>
            }
          >
            <div
              style={{
                minHeight: 40,
                border: "1px solid #d9d9d9",
                borderRadius: 6,
                padding: "4px 11px",
                display: "flex",
                flexWrap: "wrap",
                gap: 4,
                alignItems: "center",
              }}
            >
              {cohortKPIs.map((kpi) => (
                <Tag
                  key={kpi.id}
                  closable
                  onClose={() =>
                    setCohortKPIs(cohortKPIs.filter((k) => k.id !== kpi.id))
                  }
                  closeIcon={<CloseOutlined style={{ fontSize: 10 }} />}
                >
                  {kpi.name}
                </Tag>
              ))}
              <input
                type="text"
                value={cohortKPIInput}
                onChange={(e) => setCohortKPIInput(e.target.value)}
                onKeyDown={handleCohortKPIKeyDown}
                placeholder={
                  cohortKPIs.length === 0 ? "Type and press Enter..." : ""
                }
                style={{
                  flex: 1,
                  minWidth: 120,
                  border: "none",
                  outline: "none",
                  fontSize: 14,
                }}
              />
            </div>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            label={
              <span>
                Master Agg KPIs{" "}
                <span style={{ fontSize: 12, color: "#8c8c8c" }}>
                  (comma-separated, press Enter)
                </span>
              </span>
            }
          >
            <div
              style={{
                minHeight: 40,
                border: "1px solid #d9d9d9",
                borderRadius: 6,
                padding: "4px 11px",
                display: "flex",
                flexWrap: "wrap",
                gap: 4,
                alignItems: "center",
              }}
            >
              {masterAggKPIs.map((kpi) => (
                <Tag
                  key={kpi.id}
                  closable
                  onClose={() =>
                    setMasterAggKPIs(masterAggKPIs.filter((k) => k.id !== kpi.id))
                  }
                  closeIcon={<CloseOutlined style={{ fontSize: 10 }} />}
                >
                  {kpi.name}
                </Tag>
              ))}
              <input
                type="text"
                value={masterAggKPIInput}
                onChange={(e) => setMasterAggKPIInput(e.target.value)}
                onKeyDown={handleMasterAggKPIKeyDown}
                placeholder={
                  masterAggKPIs.length === 0 ? "Type and press Enter..." : ""
                }
                style={{
                  flex: 1,
                  minWidth: 120,
                  border: "none",
                  outline: "none",
                  fontSize: 14,
                }}
              />
            </div>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="Master Agg Calculated KPIs">
        <Row gutter={16} style={{ marginBottom: 8 }}>
          <Col span={11}>
            <span style={{ fontSize: 12, color: "#8c8c8c" }}>Name</span>
          </Col>
          <Col span={11}>
            <span style={{ fontSize: 12, color: "#8c8c8c" }}>Formula</span>
          </Col>
          <Col span={2}>
            <span style={{ fontSize: 12, color: "#8c8c8c" }}>Action</span>
          </Col>
        </Row>

        <Form.List
          name="calculatedKPIs"
          initialValue={[
            {
              name: "calculated_kpi_revenue",
              formula: "sales_in_usd_return_purchase",
            },
            {
              name: "calculated_kpi_new_orders",
              formula: "event_counter_first_purchase",
            },
            {
              name: "calculated_kpi_total_orders",
              formula: "event_counter_return_purchase",
            },
            {
              name: "calculated_kpi_complete_registration",
              formula: "event_counter_af_complete_registration",
            },
          ]}
        >
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Row key={key} gutter={16} style={{ marginBottom: 12 }}>
                  <Col span={11}>
                    <Form.Item
                      {...restField}
                      name={[name, "name"]}
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <Input placeholder="KPI name" />
                    </Form.Item>
                  </Col>
                  <Col span={11}>
                    <Form.Item
                      {...restField}
                      name={[name, "formula"]}
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <Input placeholder="Formula" />
                    </Form.Item>
                  </Col>
                  <Col span={2}>
                    <Button
                      type="link"
                      danger
                      onClick={() => remove(name)}
                      style={{ width: "100%" }}
                    >
                      Remove
                    </Button>
                  </Col>
                </Row>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  style={{ marginTop: 8 }}
                >
                  + Add Calculated KPI
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form.Item>
    </div>
  );
}
