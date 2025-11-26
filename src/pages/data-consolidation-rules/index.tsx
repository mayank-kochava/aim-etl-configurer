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
} from "antd";
import {
  PlusOutlined,
  CloseOutlined,
  QuestionCircleOutlined,
  HolderOutlined,
} from "@ant-design/icons";
import { useState } from "react";
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
const { Option } = Select;

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
  isExpanded: boolean;
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
    <div
      ref={setNodeRef}
      style={style}
      className="supplier-rule-card"
      {...attributes}
    >
      <div
        style={{
          border: "1px solid #d9d9d9",
          borderRadius: 6,
          padding: 16,
          marginBottom: 8,
        }}
      >
        <Row gutter={16} align="middle">
          <Col flex="none">
            <div
              {...listeners}
              style={{
                cursor: "grab",
                padding: "0 8px",
                color: "#8c8c8c",
                marginTop: 24,
              }}
            >
              <HolderOutlined />
            </div>
          </Col>
          <Col flex="none">
            <Tag
              style={{
                marginTop: 24,
                fontSize: 12,
                padding: "2px 8px",
              }}
            >
              # {priority}
            </Tag>
          </Col>
          <Col span={10}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <span style={{ fontSize: 12, color: "#8c8c8c" }}>
                Data Supplier Config
              </span>
              <Select
                value={rule.connector}
                onChange={(value) => onUpdate({ ...rule, connector: value })}
                style={{ width: "100%" }}
              >
                <Option value="Appsflyer">
                  Cost and Attribution - Appsflyer
                </Option>
                <Option value="Supermetrics">Cost Attr - Supermetrics</Option>
              </Select>
            </Space>
          </Col>
          <Col span={10}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <span style={{ fontSize: 12, color: "#8c8c8c" }}>
                Fusion Type
              </span>
              <Select
                value={rule.fusion}
                onChange={(value) =>
                  onUpdate({ ...rule, fusion: value as FusionType })
                }
                style={{ width: "100%" }}
              >
                {Object.values(FusionType).map((type) => (
                  <Option key={type} value={type}>
                    {type}
                  </Option>
                ))}
              </Select>
            </Space>
          </Col>
          <Col flex="none">
            <Button
              type="text"
              danger
              icon={<CloseOutlined />}
              onClick={onRemove}
              style={{ marginTop: 24 }}
            />
          </Col>
        </Row>
        {rule.events && (
          <div style={{ marginTop: 8, marginLeft: 56 }}>
            <span style={{ fontSize: 12, color: "#8c8c8c" }}>
              {rule.events}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Consolidation Rule Card Component
function ConsolidationRuleCard({
  rule,
  onUpdate,
  onRemove,
}: {
  rule: ConsolidationRule;
  onUpdate: (rule: ConsolidationRule) => void;
  onRemove: () => void;
}) {
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
    <div
      style={{
        border: "1px solid #d9d9d9",
        borderRadius: 6,
        marginBottom: 16,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 16,
          background: "#fafafa",
        }}
      >
        <Space>
          <Button
            type="text"
            icon={
              rule.isExpanded ? (
                <span style={{ transform: "rotate(0deg)" }}>▼</span>
              ) : (
                <span style={{ transform: "rotate(-90deg)" }}>▼</span>
              )
            }
            onClick={() => onUpdate({ ...rule, isExpanded: !rule.isExpanded })}
          />
          <span style={{ fontWeight: 500 }}>Rule for Region: {rule.region}</span>
        </Space>
        <Button
          type="default"
          danger
          icon={<CloseOutlined />}
          onClick={onRemove}
        >
          Remove Rule
        </Button>
      </div>
      {rule.isExpanded && (
        <div style={{ padding: 24 }}>
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            <div>
              <Space direction="vertical" style={{ width: "100%" }}>
                <span>
                  Region <span style={{ color: "red" }}>*</span>
                </span>
                <Select
                  value={rule.region}
                  onChange={(value) => onUpdate({ ...rule, region: value })}
                  style={{ width: "100%" }}
                >
                  <Option value="US">US</Option>
                  <Option value="UK">UK</Option>
                  <Option value="ALL">ALL</Option>
                </Select>
              </Space>
            </div>

            <Row gutter={16}>
              <Col span={12}>
                <Space direction="vertical">
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
                <Space direction="vertical">
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

            <div>
              <h4>Filters</h4>
              <Row gutter={16}>
                <Col span={12}>
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <span style={{ fontSize: 12, color: "#8c8c8c" }}>
                      Excluded Network IDs
                    </span>
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
                      {rule.excludedNetworkIds.map((id, index) => (
                        <Tag
                          key={`${id}-${index}`}
                          closable
                          onClose={() =>
                            onUpdate({
                              ...rule,
                              excludedNetworkIds:
                                rule.excludedNetworkIds.filter(
                                  (_, i) => i !== index
                                ),
                            })
                          }
                          closeIcon={<CloseOutlined style={{ fontSize: 10 }} />}
                        >
                          {id}
                        </Tag>
                      ))}
                      <input
                        type="text"
                        value={excludedNetworkIdInput}
                        onChange={(e) =>
                          setExcludedNetworkIdInput(e.target.value)
                        }
                        onKeyDown={handleExcludedNetworkIdKeyDown}
                        placeholder={
                          rule.excludedNetworkIds.length === 0
                            ? "Type and press Enter..."
                            : ""
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
                  </Space>
                </Col>
                <Col span={12}>
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <span style={{ fontSize: 12, color: "#8c8c8c" }}>
                      Excluded Campaign Regexes
                    </span>
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
                      {rule.excludedCampaignRegexes.map((regex, index) => (
                        <Tag
                          key={`${regex}-${index}`}
                          closable
                          onClose={() =>
                            onUpdate({
                              ...rule,
                              excludedCampaignRegexes:
                                rule.excludedCampaignRegexes.filter(
                                  (_, i) => i !== index
                                ),
                            })
                          }
                          closeIcon={<CloseOutlined style={{ fontSize: 10 }} />}
                        >
                          {regex}
                        </Tag>
                      ))}
                      <input
                        type="text"
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
                          border: "none",
                          outline: "none",
                          fontSize: 14,
                        }}
                      />
                    </div>
                  </Space>
                </Col>
              </Row>
            </div>

            <div>
              <h4>Data Supplier Rules</h4>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={rule.dataSupplierRules.map((r) => r.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <Space direction="vertical" style={{ width: "100%" }}>
                    {rule.dataSupplierRules.map((supplierRule, index) => (
                      <SortableSupplierRule
                        key={supplierRule.id}
                        rule={supplierRule}
                        priority={index + 1}
                        onUpdate={updateSupplierRule}
                        onRemove={() => removeSupplierRule(supplierRule.id)}
                      />
                    ))}
                  </Space>
                </SortableContext>
              </DndContext>
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={addSupplierRule}
                style={{ marginTop: 8, width: "100%" }}
              >
                Add Supplier Rule
              </Button>
            </div>
          </Space>
        </div>
      )}
    </div>
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
      isExpanded: true,
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
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          Data Consolidation Rules{" "}
          <Tag icon={<QuestionCircleOutlined />} color="default">
            Help
          </Tag>
        </Title>
      </div>

      <Collapse defaultActiveKey={["1", "2"]} style={{ marginBottom: 24 }}>
        <Collapse.Panel header="Consolidation Rules" key="1">
          <div style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={addConsolidationRule}
            >
              Add New Rule
            </Button>
          </div>
          <Space direction="vertical" style={{ width: "100%" }}>
            {config.consolidationRules.map((rule) => (
              <ConsolidationRuleCard
                key={rule.id}
                rule={rule}
                onUpdate={updateConsolidationRule}
                onRemove={() => removeConsolidationRule(rule.id)}
              />
            ))}
          </Space>
        </Collapse.Panel>

        <Collapse.Panel header="Dataset Enrichment" key="2">
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            <div>
              <Space direction="vertical">
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
                <Space direction="vertical" style={{ width: "100%" }}>
                  <span>Enrichment Datasets</span>
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
                              closeIcon={
                                <CloseOutlined style={{ fontSize: 10 }} />
                              }
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
                                e.currentTarget.style.background =
                                  "transparent";
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                readOnly
                              />
                              <span>{dataset.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </Space>
              </div>
            )}
          </Space>
        </Collapse.Panel>
      </Collapse>

      <Space>
        <Button type="primary">UPDATE</Button>
        <Button>CANCEL</Button>
      </Space>
    </div>
  );
}
