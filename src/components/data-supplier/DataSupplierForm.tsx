import {
  Form,
  Input,
  Select,
  Button,
  Collapse,
  Row,
  Col,
  Tag,
  Checkbox,
  Space,
  DatePicker,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useEffect, useState, useRef } from "react";
import { AppsflyerConfig } from "./connector-configs/AppsflyerConfig";
import { S3Config } from "./connector-configs/S3Config";
import { SupermetricsConfig } from "./connector-configs/SupermetricsConfig";
import { SingularConfig } from "./connector-configs/SingularConfig";
import { BranchConfig } from "./connector-configs/BranchConfig";
import { GCSConfig } from "./connector-configs/GCSConfig";
import {
  useCreateDataSupplier,
  useUpdateDataSupplier,
  useDeleteDataSupplier,
  DataSupplier,
} from "@/hooks/useDataSupplier";
import { useGeoLocations } from "@/hooks/useGeoLocations";
import { useConnectorConfigs } from "@/hooks/useConnectorConfigs";
import { message } from "antd";
import dayjs from "dayjs";

const { Option } = Select;

interface DataSupplierFormProps {
  supplierId: string;
  initial?: DataSupplier | null;
  onSaved?: () => void;
  onBack?: () => void;
}

export function DataSupplierForm({
  supplierId,
  initial,
  onSaved,
  onBack,
}: DataSupplierFormProps) {
  const [form] = Form.useForm();
  const [connectorType, setConnectorType] = useState<string>("");
  const [useDateRange, setUseDateRange] = useState(false);
  const [selectedApps, setSelectedApps] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [isAppDropdownOpen, setIsAppDropdownOpen] = useState(false);
  const appDropdownRef = useRef<HTMLDivElement>(null);

  // Use custom hooks
  const createMutation = useCreateDataSupplier();
  const updateMutation = useUpdateDataSupplier(supplierId);
  const deleteMutation = useDeleteDataSupplier(supplierId);
  const { data: geoData, isLoading: geoLoading } = useGeoLocations();
  const { data: connectorConfigs, isLoading: connectorConfigsLoading } = useConnectorConfigs();

  // Available apps list
  const availableApps = [
    { id: "1", name: "UK FreePrints Android" },
    { id: "2", name: "UK FreePrints iOS" },
    { id: "3", name: "US FreePrints Android" },
    { id: "4", name: "US FreePrints iOS" },
    { id: "5", name: "DE FreePrints Android" },
  ];

  // Standard events for event mapping
  const standardEvents = ["purchase", "registration", "installs", "revenue"];

  // Prefill initial values
  useEffect(() => {
    if (initial) {
      const eventMappingsList = Object.entries(initial.EventMapping || {}).map(
        ([k, v]) => ({
          standardEvent: k,
          mappedEvent: v as string,
        })
      );

      setConnectorType(initial.ConnectorType?.toLowerCase() || "");
      setUseDateRange(!!initial.StartDate && !!initial.EndDate);

      // Set selected apps from initial data
      if (initial.AssociatedApps && initial.AssociatedApps.length > 0) {
        const apps = initial.AssociatedApps.map((appId: string) => {
          const app = availableApps.find((a) => a.id === appId);
          return app || { id: appId, name: appId };
        });
        setSelectedApps(apps);
      }

      form.setFieldsValue({
        ...initial,
        ConnectorType: initial.ConnectorType?.toLowerCase(),
        CurrencyCode: initial.AdvertiserConfig?.CurrencyCode || initial.CurrencyCode,
        LookbackWeeks: initial.AdvertiserConfig?.LookbackWeeks || initial.LookbackWeeks,
        WeeklyGrouping: initial.AdvertiserConfig?.WeeklyGrouping || initial.WeeklyGrouping,
        eventMappings: eventMappingsList.length
          ? eventMappingsList
          : [{ standardEvent: "", mappedEvent: "" }],
        StartDate: initial.StartDate ? dayjs(initial.StartDate) : undefined,
        EndDate: initial.EndDate ? dayjs(initial.EndDate) : undefined,
      });
    } else {
      form.setFieldsValue({
        Active: true,
        LookbackWeeks: 20,
        WeeklyGrouping: 2,
        CurrencyCode: "USD",
        eventMappings: [
          { standardEvent: "purchase", mappedEvent: "af_purchase" },
          {
            standardEvent: "registration",
            mappedEvent: "af_complete_registration",
          },
        ],
      });
    }
  }, [initial, form]);

  // Handle click outside for app dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        appDropdownRef.current &&
        !appDropdownRef.current.contains(event.target as Node)
      ) {
        setIsAppDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleApp = (app: { id: string; name: string }) => {
    const isSelected = selectedApps.some((a) => a.id === app.id);
    if (isSelected) {
      setSelectedApps(selectedApps.filter((a) => a.id !== app.id));
    } else {
      setSelectedApps([...selectedApps, app]);
    }
  };

  const handleRemoveApp = (appId: string) => {
    setSelectedApps(selectedApps.filter((app) => app.id !== appId));
  };

  const onFinish = (values: any) => {
    const payload = {
      ...values,
      ConnectorType: values.ConnectorType || connectorType,
      AssociatedApps: selectedApps.map((app) => app.id),
      EventMapping: (values.eventMappings || []).reduce(
        (acc: Record<string, string>, m: any) => {
          if (m.standardEvent) acc[m.standardEvent] = m.mappedEvent;
          return acc;
        },
        {}
      ),
      StartDate: values.StartDate
        ? dayjs(values.StartDate).format("YYYY-MM-DD")
        : undefined,
      EndDate: values.EndDate
        ? dayjs(values.EndDate).format("YYYY-MM-DD")
        : undefined,
    };

    if (supplierId === "new") {
      createMutation.mutate(payload, {
        onSuccess: () => {
          message.success("Supplier created successfully");
          onSaved?.();
        },
        onError: (err: any) => {
          message.error(
            err?.response?.data?.error || "Failed to create supplier"
          );
        },
      });
    } else {
      updateMutation.mutate(payload, {
        onSuccess: () => {
          message.success("Supplier updated successfully");
          onSaved?.();
        },
        onError: (err: any) => {
          message.error(
            err?.response?.data?.error || "Failed to update supplier"
          );
        },
      });
    }
  };

  const handleDelete = () => {
    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        message.success("Supplier deleted successfully");
        onBack?.();
      },
      onError: () => {
        message.error("Failed to delete supplier");
      },
    });
  };

  const handleActivateDeactivate = () => {
    const currentActive = form.getFieldValue("Active");
    form.setFieldsValue({ Active: !currentActive });
  };

  const activeStatus = Form.useWatch("Active", form);

  return (
    <div style={{ maxWidth: 1200, padding: "0 24px" }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={onBack}
        style={{ marginBottom: 24 }}
      >
        Back to List
      </Button>

      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Collapse
          defaultActiveKey={["1", "2", "3"]}
          style={{ marginBottom: 24 }}
        >
          {/* Section 1: General */}
          <Collapse.Panel header="General" key="1">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="ConnectionName"
                  label="Connection Name"
                  rules={[
                    { required: true, message: "Please enter connection name" },
                  ]}
                >
                  <Input placeholder="Enter connection name" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item name="CurrencyCode" label="Currency Code">
                  <Select
                    placeholder="Select currency"
                    loading={geoLoading}
                    showSearch
                    options={geoData?.currencies.map((currency) => ({
                      label: `${currency.code} - ${currency.name}`,
                      value: currency.code,
                    }))}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item label="Status">
                  <Tag color={activeStatus ? "green" : "red"}>
                    {activeStatus ? "Active" : "Inactive"}
                  </Tag>
                </Form.Item>
              </Col>
            </Row>

            {/* Date Range / Lookback Section */}
            <div
              style={{
                border: "1px solid #d9d9d9",
                borderRadius: 6,
                padding: 16,
                marginBottom: 16,
              }}
            >
              <Checkbox
                checked={useDateRange}
                onChange={(e) => setUseDateRange(e.target.checked)}
                style={{ marginBottom: 16 }}
              >
                Use Date Range (instead of lookback weeks)
              </Checkbox>

              {!useDateRange ? (
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="LookbackWeeks" label="Lookback Weeks">
                      <Input type="number" placeholder="20" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="WeeklyGrouping" label="Weekly Grouping">
                      <Input type="number" placeholder="2" />
                    </Form.Item>
                  </Col>
                </Row>
              ) : (
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="StartDate" label="Start Date">
                      <DatePicker style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="EndDate" label="End Date">
                      <DatePicker style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                </Row>
              )}
            </div>

            {/* Associated Apps */}
            <Form.Item
              label={
                <span>
                  Associated Apps <span style={{ color: "red" }}>*</span>
                </span>
              }
              required
              validateStatus={selectedApps.length === 0 ? "error" : ""}
              help={
                selectedApps.length === 0
                  ? "Please select at least one app"
                  : ""
              }
            >
              <div ref={appDropdownRef} style={{ position: "relative" }}>
                <div
                  onClick={() => setIsAppDropdownOpen(!isAppDropdownOpen)}
                  style={{
                    minHeight: 40,
                    border: "1px solid #d9d9d9",
                    borderRadius: 6,
                    padding: "4px 11px",
                    cursor: "pointer",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 4,
                    alignItems: "center",
                  }}
                >
                  {selectedApps.length > 0 ? (
                    selectedApps.map((app) => (
                      <Tag
                        key={app.id}
                        closable
                        onClose={(e) => {
                          e.preventDefault();
                          handleRemoveApp(app.id);
                        }}
                      >
                        {app.name}
                      </Tag>
                    ))
                  ) : (
                    <span style={{ color: "#bfbfbf" }}>Select apps...</span>
                  )}
                </div>

                {isAppDropdownOpen && (
                  <div
                    style={{
                      position: "absolute",
                      zIndex: 1000,
                      width: "100%",
                      marginTop: 4,
                      background: "#fff",
                      border: "1px solid #d9d9d9",
                      borderRadius: 6,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      maxHeight: 240,
                      overflowY: "auto",
                    }}
                  >
                    {availableApps.map((app) => {
                      const isSelected = selectedApps.some(
                        (a) => a.id === app.id
                      );
                      return (
                        <div
                          key={app.id}
                          onClick={() => handleToggleApp(app)}
                          style={{
                            padding: "8px 16px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#f5f5f5";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                          }}
                        >
                          <Checkbox checked={isSelected} />
                          <span>{app.name}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Form.Item>

            {/* Connector Type */}
            <Form.Item
              name="ConnectorType"
              label={
                <span>
                  Connector Type <span style={{ color: "red" }}>*</span>
                </span>
              }
              rules={[
                { required: true, message: "Please select connector type" },
              ]}
            >
              <Select
                placeholder="Select a connector type"
                loading={connectorConfigsLoading}
                showSearch
                onChange={(value) => setConnectorType(value)}
                options={connectorConfigs?.map((config) => ({
                  label: config.ConnectorType,
                  value: config.ConnectorType.toLowerCase(),
                }))}
              />
            </Form.Item>
          </Collapse.Panel>

          {/* Section 2: Advertiser Config - Dynamic based on Connector Type */}
          {connectorType && (
            <Collapse.Panel
              header={`Advertiser Config (${
                connectorType === "appsflyer"
                  ? "AppsFlyer"
                  : connectorType === "s3"
                  ? "S3"
                  : connectorType === "supermetrics"
                  ? "Supermetrics"
                  : connectorType === "singular"
                  ? "Singular"
                  : connectorType === "branch"
                  ? "Branch"
                  : connectorType === "gcs"
                  ? "GCS"
                  : connectorType
              })`}
              key="2"
            >
              {connectorType === "appsflyer" && <AppsflyerConfig form={form} />}
              {connectorType === "s3" && <S3Config form={form} />}
              {connectorType === "supermetrics" && (
                <SupermetricsConfig form={form} />
              )}
              {connectorType === "singular" && <SingularConfig form={form} />}
              {connectorType === "branch" && <BranchConfig form={form} />}
              {connectorType === "gcs" && <GCSConfig form={form} />}
            </Collapse.Panel>
          )}

          {/* Section 3: Event Mapping */}
          <Collapse.Panel header="Event Mapping" key="3">
            <Row gutter={16} style={{ marginBottom: 8 }}>
              <Col span={11}>
                <span style={{ fontSize: 12, color: "#8c8c8c" }}>
                  AIM Event / KPI
                </span>
              </Col>
              <Col span={11}>
                <span style={{ fontSize: 12, color: "#8c8c8c" }}>
                  Source Event / KPI
                </span>
              </Col>
              <Col span={2}>
                <span style={{ fontSize: 12, color: "#8c8c8c" }}>Action</span>
              </Col>
            </Row>

            <Form.List name="eventMappings">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Row key={key} gutter={16} style={{ marginBottom: 12 }}>
                      <Col span={11}>
                        <Form.Item
                          {...restField}
                          name={[name, "standardEvent"]}
                          rules={[{ required: true, message: "Required" }]}
                        >
                          <Select placeholder="Select event">
                            {standardEvents.map((event) => (
                              <Option key={event} value={event}>
                                {event}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={11}>
                        <Form.Item
                          {...restField}
                          name={[name, "mappedEvent"]}
                          rules={[{ required: true, message: "Required" }]}
                        >
                          <Input placeholder="Supplier event name" />
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
                      + Add Event Mapping
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Collapse.Panel>
        </Collapse>

        {/* Action Buttons */}
        <Space>
          <Button
            type="primary"
            htmlType="submit"
            loading={createMutation.isPending || updateMutation.isPending}
          >
            {supplierId === "new" ? "CREATE" : "UPDATE"}
          </Button>
          <Button onClick={onBack}>CANCEL</Button>
          <Button
            type={activeStatus ? "default" : "primary"}
            danger={activeStatus}
            onClick={handleActivateDeactivate}
            style={{ marginLeft: "auto" }}
          >
            {activeStatus ? "DEACTIVATE" : "ACTIVATE"}
          </Button>
          {supplierId !== "new" && (
            <Button
              danger
              onClick={handleDelete}
              loading={deleteMutation.isPending}
            >
              DELETE
            </Button>
          )}
        </Space>
      </Form>
    </div>
  );
}
