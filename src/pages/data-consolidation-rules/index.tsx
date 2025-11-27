import {
  Button,
  Collapse,
  Select,
  Switch,
  Space,
  Typography,
  Tag,
  Row,
  Col,
  Input,
  Checkbox,
  Card,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
  HolderOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { useGeoLocations } from "@/hooks/useGeoLocations";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const { Title } = Typography;
const { Panel } = Collapse;

enum FusionType {
  None = "None",
  FullOuterJoin = "FullOuterJoin",
  Union = "Union",
  LeftJoin = "LeftJoin",
}

interface DataSupplierRule {
  id: string;
  connector: string;
  fusion: FusionType;
  events?: string;
}

interface ConsolidationRule {
  id: string;
  region: string;
  crossPlatformEnabled: boolean;
  webToCrossPlatformEnabled: boolean;
  excludedNetworkIds: string[];
  excludedCampaignRegexes: string[];
  dataSupplierRules: DataSupplierRule[];
}

interface ConfigState {
  advertiser: string;
  active: boolean;
  enrichmentEnabled: boolean;
  enrichmentDatasets: string[];
  consolidationRules: ConsolidationRule[];
}

// Sortable Supplier Rule Component
function SortableSupplierRule({
  rule,
  priority,
  onUpdate,
  onRemove,
}: {
  rule: DataSupplierRule;
  priority: number;
  onUpdate: (rule: DataSupplierRule) => void;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: rule.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card size="small" style={{ marginBottom: 8 }}>
        <Row gutter={16} align="middle">
          <Col flex="none">
            <div
              {...listeners}
              style={{
                cursor: "grab",
                padding: "0 8px",
                color: "#8c8c8c",
              }}
            >
              <HolderOutlined />
            </div>
          </Col>
          <Col flex="none">
            <Tag color="blue">Priority {priority}</Tag>
          </Col>
          <Col flex="auto">
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: "#8c8c8c" }}>
                    Data Supplier Config
                  </span>
                </div>
                <Select
                  value={rule.connector}
                  onChange={(value) => onUpdate({ ...rule, connector: value })}
                  style={{ width: "100%" }}
                  placeholder="Select supplier"
                >
                  <Select.Option value="Appsflyer">
                    Cost and Attribution - Appsflyer
                  </Select.Option>
                  <Select.Option value="Supermetrics">
                    Cost Attr - Supermetrics
                  </Select.Option>
                </Select>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: "#8c8c8c" }}>
                    Fusion Type
                  </span>
                </div>
                <Select
                  value={rule.fusion}
                  onChange={(value) =>
                    onUpdate({ ...rule, fusion: value as FusionType })
                  }
                  style={{ width: "100%" }}
                  placeholder="Select fusion type"
                >
                  {Object.values(FusionType).map((type) => (
                    <Select.Option key={type} value={type}>
                      {type}
                    </Select.Option>
                  ))}
                </Select>
              </Col>
            </Row>
          </Col>
          <Col flex="none">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={onRemove}
            />
          </Col>
        </Row>
        {rule.events && (
          <div style={{ marginTop: 8, paddingLeft: 40 }}>
            <span style={{ fontSize: 12, color: "#8c8c8c" }}>
              {rule.events}
            </span>
          </div>
        )}
      </Card>
    </div>
  );
}

// Consolidation Rule Card Component
function ConsolidationRuleCard({
  rule,
  index,
  onUpdate,
  onRemove,
}: {
  rule: ConsolidationRule;
  index: number;
  onUpdate: (rule: ConsolidationRule) => void;
  onRemove: () => void;
}) {
  const { data: geoData, isLoading: geoLoading } = useGeoLocations();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [excludedNetworkIdInput, setExcludedNetworkIdInput] = useState("");
  const [excludedRegexInput, setExcludedRegexInput] = useState("");

  const handleExcludedNetworkIdKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter" && excludedNetworkIdInput.trim()) {
      e.preventDefault();
      const newIds = excludedNetworkIdInput
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id && !rule.excludedNetworkIds.includes(id));
      onUpdate({
        ...rule,
        excludedNetworkIds: [...rule.excludedNetworkIds, ...newIds],
      });
      setExcludedNetworkIdInput("");
    }
  };

  const handleExcludedRegexKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter" && excludedRegexInput.trim()) {
      e.preventDefault();
      const newRegexes = excludedRegexInput
        .split(",")
        .map((regex) => regex.trim())
        .filter(
          (regex) => regex && !rule.excludedCampaignRegexes.includes(regex)
        );
      onUpdate({
        ...rule,
        excludedCampaignRegexes: [
          ...rule.excludedCampaignRegexes,
          ...newRegexes,
        ],
      });
      setExcludedRegexInput("");
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = rule.dataSupplierRules.findIndex(
        (r) => r.id === active.id
      );
      const newIndex = rule.dataSupplierRules.findIndex(
        (r) => r.id === over.id
      );
      const reorderedRules = arrayMove(
        rule.dataSupplierRules,
        oldIndex,
        newIndex
      );
      onUpdate({ ...rule, dataSupplierRules: reorderedRules });
    }
  };

  const updateSupplierRule = (updatedSupplierRule: DataSupplierRule) => {
    onUpdate({
      ...rule,
      dataSupplierRules: rule.dataSupplierRules.map((sr) =>
        sr.id === updatedSupplierRule.id ? updatedSupplierRule : sr
      ),
    });
  };

  const addSupplierRule = () => {
    const newSupplierRule: DataSupplierRule = {
      id: `supplier_${Date.now()}`,
      connector: "Appsflyer",
      fusion: FusionType.None,
    };
    onUpdate({
      ...rule,
      dataSupplierRules: [newSupplierRule, ...rule.dataSupplierRules],
    });
  };

  const removeSupplierRule = (idToRemove: string) => {
    onUpdate({
      ...rule,
      dataSupplierRules: rule.dataSupplierRules.filter(
        (sr) => sr.id !== idToRemove
      ),
    });
  };

  return (
    <Collapse
      bordered
      style={{ marginBottom: 16 }}
      expandIcon={({ isActive }) => (
        <DownOutlined rotate={isActive ? 0 : -90} />
      )}
    >
      <Panel
        header={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Space>
              <Tag color="blue">Rule {index + 1}</Tag>
              <span style={{ fontWeight: 500 }}>Region: {rule.region}</span>
            </Space>
            <Button
              type="text"
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              Delete
            </Button>
          </div>
        }
        key="1"
      >
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          {/* Region Selection */}
          <div>
            <div style={{ marginBottom: 8 }}>
              <span>
                Region <span style={{ color: "#ff4d4f" }}>*</span>
              </span>
            </div>
            <Select
              value={rule.region}
              onChange={(value) => onUpdate({ ...rule, region: value })}
              style={{ width: "100%" }}
              loading={geoLoading}
              showSearch
              placeholder="Select region"
              options={geoData?.regions.map((region) => ({
                label: region.displayName,
                value: region.regionId,
              }))}
            />
          </div>

          {/* Platform Settings */}
          <Card title="Platform Settings" size="small">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Space direction="vertical" size={4}>
                  <span>Cross-Platform Enabled</span>
                  <Switch
                    checked={rule.crossPlatformEnabled}
                    onChange={(checked) =>
                      onUpdate({ ...rule, crossPlatformEnabled: checked })
                    }
                  />
                </Space>
              </Col>
              <Col span={12}>
                <Space direction="vertical" size={4}>
                  <span>Web-to-Cross-Platform Enabled</span>
                  <Switch
                    checked={rule.webToCrossPlatformEnabled}
                    onChange={(checked) =>
                      onUpdate({ ...rule, webToCrossPlatformEnabled: checked })
                    }
                  />
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Filters */}
          <Card title="Filters" size="small">
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: "#8c8c8c" }}>
                    Excluded Network IDs
                  </span>
                </div>
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
                    background: "#fff",
                  }}
                >
                  {rule.excludedNetworkIds.map((id, idx) => (
                    <Tag
                      key={`${id}-${idx}`}
                      closable
                      onClose={() =>
                        onUpdate({
                          ...rule,
                          excludedNetworkIds: rule.excludedNetworkIds.filter(
                            (_, i) => i !== idx
                          ),
                        })
                      }
                    >
                      {id}
                    </Tag>
                  ))}
                  <Input
                    bordered={false}
                    value={excludedNetworkIdInput}
                    onChange={(e) => setExcludedNetworkIdInput(e.target.value)}
                    onKeyDown={handleExcludedNetworkIdKeyDown}
                    placeholder={
                      rule.excludedNetworkIds.length === 0
                        ? "Type and press Enter..."
                        : ""
                    }
                    style={{
                      flex: 1,
                      minWidth: 120,
                      padding: 0,
                    }}
                  />
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: "#8c8c8c" }}>
                    Excluded Campaign Regexes
                  </span>
                </div>
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
                    background: "#fff",
                  }}
                >
                  {rule.excludedCampaignRegexes.map((regex, idx) => (
                    <Tag
                      key={`${regex}-${idx}`}
                      closable
                      onClose={() =>
                        onUpdate({
                          ...rule,
                          excludedCampaignRegexes:
                            rule.excludedCampaignRegexes.filter(
                              (_, i) => i !== idx
                            ),
                        })
                      }
                    >
                      {regex}
                    </Tag>
                  ))}
                  <Input
                    bordered={false}
                    value={excludedRegexInput}
                    onChange={(e) => setExcludedRegexInput(e.target.value)}
                    onKeyDown={handleExcludedRegexKeyDown}
                    placeholder={
                      rule.excludedCampaignRegexes.length === 0
                        ? "Type and press Enter..."
                        : ""
                    }
                    style={{
                      flex: 1,
                      minWidth: 120,
                      padding: 0,
                    }}
                  />
                </div>
              </Col>
            </Row>
          </Card>

          {/* Data Supplier Rules */}
          <Card
            title="Data Supplier Rules"
            size="small"
            extra={
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={addSupplierRule}
              >
                Add Supplier Rule
              </Button>
            }
          >
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={rule.dataSupplierRules.map((r) => r.id)}
                strategy={verticalListSortingStrategy}
              >
                {rule.dataSupplierRules.length > 0 ? (
                  <Space direction="vertical" style={{ width: "100%" }}>
                    {rule.dataSupplierRules.map((supplierRule, idx) => (
                      <SortableSupplierRule
                        key={supplierRule.id}
                        rule={supplierRule}
                        priority={idx + 1}
                        onUpdate={updateSupplierRule}
                        onRemove={() => removeSupplierRule(supplierRule.id)}
                      />
                    ))}
                  </Space>
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "24px",
                      color: "#8c8c8c",
                    }}
                  >
                    No supplier rules added. Click "Add Supplier Rule" to get
                    started.
                  </div>
                )}
              </SortableContext>
            </DndContext>
          </Card>
        </Space>
      </Panel>
    </Collapse>
  );
}

// Main Component
export default function DataConsolidationRulesPage() {
  const [config, setConfig] = useState<ConfigState>({
    advertiser: "planet_art_demo",
    active: true,
    enrichmentEnabled: false,
    enrichmentDatasets: [],
    consolidationRules: [],
  });

  const [isEnrichmentDropdownOpen, setIsEnrichmentDropdownOpen] =
    useState(false);

  // Mock data for available enrichment datasets
  const availableEnrichmentDatasets = [
    { id: "s3_data_import", name: "Cost And Attribution" },
    { id: "gcs_data_import", name: "Cost Attr" },
  ];

  const updateConsolidationRule = (updatedRule: ConsolidationRule) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      consolidationRules: prevConfig.consolidationRules.map((rule) =>
        rule.id === updatedRule.id ? updatedRule : rule
      ),
    }));
  };

  const removeConsolidationRule = (ruleId: string) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      consolidationRules: prevConfig.consolidationRules.filter(
        (rule) => rule.id !== ruleId
      ),
    }));
  };

  const addConsolidationRule = () => {
    const newRule: ConsolidationRule = {
      id: `rule_${Date.now()}`,
      region: "US",
      crossPlatformEnabled: false,
      webToCrossPlatformEnabled: false,
      excludedNetworkIds: [],
      excludedCampaignRegexes: [],
      dataSupplierRules: [],
    };
    setConfig((prevConfig) => ({
      ...prevConfig,
      consolidationRules: [newRule, ...prevConfig.consolidationRules],
    }));
  };

  const handleToggleEnrichmentDataset = (datasetId: string) => {
    setConfig((prevConfig) => {
      const isSelected = prevConfig.enrichmentDatasets.includes(datasetId);
      return {
        ...prevConfig,
        enrichmentDatasets: isSelected
          ? prevConfig.enrichmentDatasets.filter((id) => id !== datasetId)
          : [...prevConfig.enrichmentDatasets, datasetId],
      };
    });
  };

  const handleRemoveEnrichmentDataset = (datasetId: string) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      enrichmentDatasets: prevConfig.enrichmentDatasets.filter(
        (id) => id !== datasetId
      ),
    }));
  };

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Title level={3}>
          Data Consolidation Rules{" "}
          <Tag icon={<QuestionCircleOutlined />} color="default">
            Help
          </Tag>
        </Title>
      </div>

      <Collapse
        defaultActiveKey={["1", "2"]}
        style={{ marginBottom: 24 }}
        expandIcon={({ isActive }) => (
          <DownOutlined rotate={isActive ? 0 : -90} />
        )}
      >
        <Panel
          header="Consolidation Rules"
          key="1"
          extra={
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                addConsolidationRule();
              }}
            >
              Add Rule
            </Button>
          }
        >
          {config.consolidationRules.length > 0 ? (
            <Space direction="vertical" style={{ width: "100%" }}>
              {config.consolidationRules.map((rule, index) => (
                <ConsolidationRuleCard
                  key={rule.id}
                  rule={rule}
                  index={index}
                  onUpdate={updateConsolidationRule}
                  onRemove={() => removeConsolidationRule(rule.id)}
                />
              ))}
            </Space>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "48px",
                color: "#8c8c8c",
              }}
            >
              No consolidation rules defined. Click "Add Rule" to create your
              first rule.
            </div>
          )}
        </Panel>

        <Panel header="Dataset Enrichment" key="2">
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            <div>
              <Space direction="vertical" size={4}>
                <span>Enrichment Enabled</span>
                <Switch
                  checked={config.enrichmentEnabled}
                  onChange={(checked) =>
                    setConfig({ ...config, enrichmentEnabled: checked })
                  }
                />
              </Space>
            </div>

            {config.enrichmentEnabled && (
              <div>
                <div style={{ marginBottom: 8 }}>
                  <span>Enrichment Datasets</span>
                </div>
                <div style={{ position: "relative" }}>
                  <div
                    onClick={() =>
                      setIsEnrichmentDropdownOpen(!isEnrichmentDropdownOpen)
                    }
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
                      background: "#fff",
                    }}
                  >
                    {config.enrichmentDatasets.length > 0 ? (
                      config.enrichmentDatasets.map((datasetId) => {
                        const dataset = availableEnrichmentDatasets.find(
                          (d) => d.id === datasetId
                        );
                        return (
                          <Tag
                            key={datasetId}
                            closable
                            onClose={(e) => {
                              e.preventDefault();
                              handleRemoveEnrichmentDataset(datasetId);
                            }}
                          >
                            {dataset?.name || datasetId}
                          </Tag>
                        );
                      })
                    ) : (
                      <span style={{ color: "#bfbfbf" }}>
                        Select enrichment datasets...
                      </span>
                    )}
                  </div>

                  {isEnrichmentDropdownOpen && (
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
                      {availableEnrichmentDatasets.map((dataset) => {
                        const isSelected = config.enrichmentDatasets.includes(
                          dataset.id
                        );
                        return (
                          <div
                            key={dataset.id}
                            onClick={() =>
                              handleToggleEnrichmentDataset(dataset.id)
                            }
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
                            <Checkbox checked={isSelected} readOnly />
                            <span>{dataset.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </Space>
        </Panel>
      </Collapse>

      <Space>
        <Button type="primary">Save Changes</Button>
        <Button>Cancel</Button>
      </Space>
    </div>
  );
}
