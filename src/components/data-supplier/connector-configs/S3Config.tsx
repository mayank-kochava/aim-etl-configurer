import { Form, Input, Select, Row, Col, Button, FormInstance } from "antd";
import { PlusOutlined, CloseOutlined } from "@ant-design/icons";

const { Option } = Select;

interface S3ConfigProps {
  form: FormInstance;
}

export function S3Config({ form }: S3ConfigProps) {
  return (
    <div>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="BucketName"
            label={
              <span>
                S3 Bucket Name <span style={{ color: "red" }}>*</span>
              </span>
            }
            rules={[{ required: true, message: "Please enter bucket name" }]}
          >
            <Input placeholder="my-data-bucket" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="Region"
            label={
              <span>
                AWS Region <span style={{ color: "red" }}>*</span>
              </span>
            }
            rules={[{ required: true, message: "Please select region" }]}
          >
            <Select placeholder="Select region">
              <Option value="us-east-1">us-east-1 (N. Virginia)</Option>
              <Option value="us-west-2">us-west-2 (Oregon)</Option>
              <Option value="eu-west-1">eu-west-1 (Ireland)</Option>
              <Option value="eu-central-1">eu-central-1 (Frankfurt)</Option>
              <Option value="ap-southeast-1">ap-southeast-1 (Singapore)</Option>
            </Select>
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
        <h4 style={{ marginBottom: 16 }}>AWS Credential</h4>

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

      <div
        style={{
          border: "1px solid #d9d9d9",
          borderRadius: 6,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <h4 style={{ marginBottom: 16 }}>File Discovery Configuration</h4>

        <Form.Item
          label={
            <span>
              Locations <span style={{ color: "red" }}>*</span>
            </span>
          }
        >
          <Form.List
            name="Locations"
            initialValue={["client_planet_y/"]}
            rules={[
              {
                validator: async (_, locations) => {
                  if (!locations || locations.length < 1) {
                    return Promise.reject(
                      new Error("At least 1 location required")
                    );
                  }
                },
              },
            ]}
          >
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map((field, index) => (
                  <div
                    key={field.key}
                    style={{ display: "flex", gap: 8, marginBottom: 8 }}
                  >
                    <Form.Item
                      {...field}
                      validateTrigger={["onChange", "onBlur"]}
                      rules={[
                        {
                          required: true,
                          whitespace: true,
                          message: "Please enter location",
                        },
                      ]}
                      style={{ flex: 1, marginBottom: 0 }}
                    >
                      <Input placeholder="path/to/folder/" />
                    </Form.Item>
                    {fields.length > 1 && (
                      <Button
                        type="text"
                        danger
                        icon={<CloseOutlined />}
                        onClick={() => remove(field.name)}
                      />
                    )}
                  </div>
                ))}
                <Button
                  type="dashed"
                  onClick={() => add()}
                  icon={<PlusOutlined />}
                  style={{ marginTop: 8 }}
                >
                  Add Location
                </Button>
                <Form.ErrorList errors={errors} />
              </>
            )}
          </Form.List>
        </Form.Item>

        <Form.Item
          label={
            <span>
              File Patterns <span style={{ color: "red" }}>*</span>
            </span>
          }
        >
          <Form.List
            name="FilePatterns"
            initialValue={["raw_data_index_untracked"]}
            rules={[
              {
                validator: async (_, patterns) => {
                  if (!patterns || patterns.length < 1) {
                    return Promise.reject(
                      new Error("At least 1 file pattern required")
                    );
                  }
                },
              },
            ]}
          >
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map((field, index) => (
                  <div
                    key={field.key}
                    style={{ display: "flex", gap: 8, marginBottom: 8 }}
                  >
                    <Form.Item
                      {...field}
                      validateTrigger={["onChange", "onBlur"]}
                      rules={[
                        {
                          required: true,
                          whitespace: true,
                          message: "Please enter file pattern",
                        },
                      ]}
                      style={{ flex: 1, marginBottom: 0 }}
                    >
                      <Input placeholder="file_pattern_name" />
                    </Form.Item>
                    {fields.length > 1 && (
                      <Button
                        type="text"
                        danger
                        icon={<CloseOutlined />}
                        onClick={() => remove(field.name)}
                      />
                    )}
                  </div>
                ))}
                <Button
                  type="dashed"
                  onClick={() => add()}
                  icon={<PlusOutlined />}
                  style={{ marginTop: 8 }}
                >
                  Add File Pattern
                </Button>
                <Form.ErrorList errors={errors} />
              </>
            )}
          </Form.List>
        </Form.Item>

        <Form.Item label="Date Patterns (Optional)">
          <Form.List name="DatePatterns">
            {(fields, { add, remove }) => (
              <>
                {fields.length === 0 ? (
                  <p style={{ fontSize: 12, color: "#8c8c8c" }}>
                    No date patterns defined. Files will be matched without date
                    filtering.
                  </p>
                ) : (
                  fields.map((field, index) => (
                    <div
                      key={field.key}
                      style={{ display: "flex", gap: 8, marginBottom: 8 }}
                    >
                      <Form.Item
                        {...field}
                        style={{ flex: 1, marginBottom: 0 }}
                      >
                        <Input placeholder="{yyyy-MM-dd} or {yyyyMMdd}" />
                      </Form.Item>
                      <Button
                        type="text"
                        danger
                        icon={<CloseOutlined />}
                        onClick={() => remove(field.name)}
                      />
                    </div>
                  ))
                )}
                <Button
                  type="dashed"
                  onClick={() => add()}
                  icon={<PlusOutlined />}
                  style={{ marginTop: 8 }}
                >
                  Add Date Pattern
                </Button>
              </>
            )}
          </Form.List>
        </Form.Item>
      </div>
    </div>
  );
}
