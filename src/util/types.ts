export enum RISK_SEVERITY {
  Nominal = 1,
  Low = 2,
  Medium = 3,
  High = 4,
}

export enum RISK_IMPACT {
  Minor = 1,
  Moderate = 2,
  Significent = 3,
}

export enum RISK_VALIDITY {
  NORMAL = 1,
  ERROR = 2,
}

export enum NUMBER_RANGE_OPERATOR {
  TO = "to",
  GREATERTHAN = "Greater Than",
  LESSTHAN = "Less Than",
}

export enum RISK_INPUT_TYPE {
  INTEGER = "integer",
  INTEGERRANGE = "integerRange",
  STRING = "string",
  ENUMBERATION = "enumeration",
}

export enum PRIVILEGE_CATEGORY {
  ESM_PRIVILEGE = "ESM Privileges",
  SYSTEM_RESOURCE = "System-Critical Resource Privileges",
  UNIX_RESOURCE = "Unix-Related Privileges"
}

export const COMPOSITERULE_ROW_COLUMN_KEYS: { [key: string]: [string] } = {
  RESOURCE_CLASS: ["UC4_OBJ_05_RSRC_ENTL_RESOURCE_CLASS"],
  RESOURCE_TYPE: ["UC4_OBJ_06_RSRC_ENTL_RESOURCE_TYPE"],
  ENTITY: ["UC4_OBJ_07_RSRC_ENTL_RESOURCE_ENTITY"],
  ACCESS: ["UC4_OBJ_08_RSRC_ENTL_ACCESS_LEVELS"],
};

export type RiskConfigMetaType = {
  objectName: string;
  objectNameRdfIri?: string;
  objectTitle: string;
  objectTitleSaved?: string;
  objectType: string;
  ruleTemplateId: number;
  ruleName: string;
  ruleNameRdfIri?: string;
  ruleNameSaved?: string;
  inputType: string;
  allowedValues?: string[];
};

export type RuleAttributeType = {
  active: boolean;
  value?: string | string[];
  resourceType?: string;
  resourceClass?: string;
  access?: string[];
  min?: number | null;
  max?: number | null;
  operator?: string;
  resourceClassType?: string;
  accessDisplay?: string;
  severitySequenceNumber?: number;
  severity: SeverityDefinition;
  impact: ImpactDefinition;
  invalid?: boolean;
};

export type RecommendationType = {
  ruleTemplateId: number;
  recommendationRdfIri: string;
  recommendations: string;
  recommendationSaved?: string;
};

export type RiskConfigRuleType = RiskConfigMetaType & {
  templatePath?: string;
  csvPath?: string;
  objectKey: number;
  active: boolean;
  notes?: string;
  attributes: RuleAttributeType[];
  recommendation?: RecommendationType;
  objectCategory?: string;
  accessSelection?: string[];
  globalSeverity?: number;
  globalImpact: ImpactDefinition;
  invalid?: boolean;
};

export type RuleDefinition = {
  rulesetId?: string;
  riskSettingName: string;
  factoryDefault: boolean;
  reportType?: string;
  reportOptions?: any;
  esm?: string;
  hash?: string;
  invalid?: boolean;
};

export type ImpactDefinition = {
  sequenceNumber: number;
  label: string | undefined;
  rdfIri?: string;
  invalid?: boolean;
};

export type SeverityDefinition = {
  sequenceNumber: number;
  label: string | undefined;
  demerit?: number;
  rdfIri?: string;
  invalid?: boolean;
};

export type RiskConfigType = {
  ruleDefinition: RuleDefinition;
  impactDefinitions: ImpactDefinition[];
  severityDefinitions: SeverityDefinition[];
  parameters: RiskConfigRuleType[];
  compositeParameters?: any[];
  hasCompositeRule?: boolean;
  creator?: string;
  updatedBy?: string;
  createTimeStamp?: string;
  updateTimestamp?: string;
};

export const RULENOTES_ESCAPE_CHARS = [
  { srcto: /\n/g, destto: "\\\\n", srcfrom: /\\n/g, destfrom: "\n" },
  { srcto: /"/g, destto: '\\"', srcfrom: /\"/g, destfrom: '"' },
];
