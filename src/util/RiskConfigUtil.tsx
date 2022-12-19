import * as types from "./types";

export const getDefaultImpactDefinitions = (): types.ImpactDefinition[] => {
  return Object.keys(types.RISK_IMPACT).map((key: string, index: number) => {
    return { sequenceNumber: index + 1, label: key, rdfIri: key.toUpperCase() };
  });
};

export const getDefaultSeverityDefinitions = (): types.SeverityDefinition[] => {
  return Object.keys(types.RISK_SEVERITY).map((key: string, index: number) => {
    return { sequenceNumber: index + 1, label: key, rdfIri: key.toUpperCase() };
  });
};

export const hasCompositeRule = (data: any) => {
  return data.ruleDefinition.reportType === "ACCOUNTENTITLEMENT";
};

const compsiteRowColumnMatches = (key: string[], rowItem: any) => {
  return key.indexOf(rowItem.objectNameRdfIri) !== -1;
};

/**
 * Convert compositeParameters into regular parameters so that UI could display
 * @param compositeParameters
 * @param parameters 
 * @returns 
 */
const fixupCompositeRuleParams = (compositeParameters: any, parameters: any) => {
  const _parameters: types.RiskConfigRuleType[] = [];
  // fixup regular parameters
  parameters.forEach((param: any) => {
    const _parameter: any = { ...param };
    if (_parameter.ruleNameRdfIri === "UC4_OBJ_12_ESM_PRIV_ADMIN_PRIVILEGES_R1" || _parameter.ruleNameRdfIri === "UC4_OBJ_13_ESM_PRIV_SPL_USE_PRIVILEGES_R1") {
      _parameter.objectCategory = types.PRIVILEGE_CATEGORY.ESM_PRIVILEGE;
    }
    else if (_parameter.ruleNameRdfIri === "UC4_SYSTEM_RESOURCES_CMPSTE_R1") {
      _parameter.objectCategory = types.PRIVILEGE_CATEGORY.SYSTEM_RESOURCE;
    }
    else {
      _parameter.objectCategory = types.PRIVILEGE_CATEGORY.UNIX_RESOURCE;
    }
    _parameter.inputType = "table";
    _parameters.push(_parameter);
  });
  if (compositeParameters) {
    // fixup composite parameters
    compositeParameters.forEach((cparam: any) => {
      const _parameter: any = {
        ruleTemplateId: cparam.ruleTemplateId,
        ruleName: cparam.ruleName,
        ruleNameRdfIri: cparam.ruleNameRdfIri,
        objectTitle: cparam.objectTitle,
        active: cparam.active,
        notes: cparam.notes,
        recommendation: cparam.recommendation,
        accessSelection: [],
        inputType: "table"
      };
      if (_parameter.ruleNameRdfIri === "UC4_SYSTEM_RESOURCES_CMPSTE_R1") {
        _parameter.objectCategory = types.PRIVILEGE_CATEGORY.SYSTEM_RESOURCE;
      }
      else {
        _parameter.objectCategory = types.PRIVILEGE_CATEGORY.UNIX_RESOURCE;
      }
      const _attributes: types.RuleAttributeType[] = [];
      cparam.ruleParameterRows.forEach((paramRow: any) => {
        const _attribute: any = {
          active: paramRow.active,
          severity: paramRow.severity,
          severitySequenceNumber: paramRow.severity.sequenceNumber,
          impact: paramRow.impact
        };
        paramRow.ruleParameterColumns.forEach((rowItem: any) => {
          // for Entity
          if (compsiteRowColumnMatches(types.COMPOSITERULE_ROW_COLUMN_KEYS.ENTITY, rowItem)) {
            _parameter.objectKey = rowItem.objectKey;
            _parameter.objectName = rowItem.objectName;
            _parameter.objectNameRdfIri = rowItem.objectNameRdfIri;
            _attribute.value = rowItem.attribute;
          }
          // for resourceType
          else if (compsiteRowColumnMatches(types.COMPOSITERULE_ROW_COLUMN_KEYS.RESOURCE_TYPE, rowItem)) {
            _attribute.resourceType = rowItem.attribute;
          }
          // for resourceClass
          else if (compsiteRowColumnMatches(types.COMPOSITERULE_ROW_COLUMN_KEYS.RESOURCE_CLASS, rowItem)) {
            _attribute.resourceClass = rowItem.attribute;
          }
          // for Access
          else if (compsiteRowColumnMatches(types.COMPOSITERULE_ROW_COLUMN_KEYS.ACCESS, rowItem)) {
            _attribute.access = [rowItem.attribute];
          }
        });
        // combine access for the same resourceType & entity
        const processedAttr = _attributes.filter((_attr: any) => {
          return _attr.value === _attribute.value && _attr.resourceType === _attribute.resourceType;
        });
        if (processedAttr && processedAttr.length > 0) {
          processedAttr[0].access?.push(..._attribute.access);
        }
        else {
          _attributes.push(_attribute);
        }
      });
      _attributes.forEach(_attribute => {
        _attribute.access = (_attribute.access as string[]).sort();
        _attribute.accessDisplay = _attribute.access.toString().replace(/,/g, ", ");
      });
      _parameter.attributes = _attributes.sort((a, b) => {
        if ((a.value as string) <= (b.value as string)) {
          return -1;
        }
        return 1;
      });
      _parameters.push(_parameter);
    });
  }
  return _parameters;
};
/**
 *  Transform the backend JSON payload to UI RiskConfigType
 * @param data backend JSON payload
 * @returns a RiskConfigType
 */
export const fixupRiskConfigData = (data: any): types.RiskConfigType => {
  let { parameters, ...otherprops } = data;
  const _parameters: types.RiskConfigRuleType[] = [];
  const _riskConfig: types.RiskConfigType = {
    ...otherprops,
    parameters: _parameters
  };
  if (
    !_riskConfig.impactDefinitions ||
    _riskConfig.impactDefinitions.length == 0
  ) {
    _riskConfig.impactDefinitions = getDefaultImpactDefinitions();
  }
  if (
    !_riskConfig.severityDefinitions ||
    _riskConfig.severityDefinitions.length == 0
  ) {
    _riskConfig.severityDefinitions = getDefaultSeverityDefinitions();
  }

  _riskConfig.hasCompositeRule = hasCompositeRule(otherprops);
  if (_riskConfig.hasCompositeRule) {
    parameters = fixupCompositeRuleParams(otherprops.compositeParameters, parameters);
  }

  if (parameters.length > 1 && !_riskConfig.hasCompositeRule) {
    parameters = parameters.sort((p1: any, p2: any) => {
      p1.objectTitleSaved = p1.objectTitle;
      p2.objectTitleSaved = p2.objectTitle;
      return p1.objectTitle > p2.objectTitle ? 1 : -1;
    });
  }
  else {
    if (parameters[0]) {
      parameters[0].objectTitleSaved = parameters[0].objectTitle;
    }
  }
  // fixup attributes in parameters  
  parameters.forEach((param: any) => {
    const { attributes, ...other } = param;
    const _attributes: types.RuleAttributeType[] = [];
    attributes.forEach((attribute: any) => {
      const _attribute: any = { ...attribute };
      _attribute.severitySequenceNumber = _attribute.severity.sequenceNumber;
      if (
        param.inputType === types.RISK_INPUT_TYPE.ENUMBERATION.valueOf() &&
        param.allowedValues
      ) {
        // Deduplicate value for multiselect
        const item = _attributes.find(
          (_attrItem: any) =>
            _attrItem.severity.sequenceNumber ==
            attribute.severity.sequenceNumber
        );
        if (item) {
          if (typeof item.value === "string") {
            item.value = [item.value];
          }
          (item.value as string[]).push(_attribute.value);
        } else {
          _attributes.push(_attribute);
        }
      } else {
        _attributes.push(_attribute);
      }
    });

    const defaultImpact =
      _attributes.length > 0
        ? _attributes[0].impact.sequenceNumber
        : _riskConfig.impactDefinitions[0].sequenceNumber;
    // add an empty attribute for any severity level which doesn't exist in _attributes list
    _riskConfig.severityDefinitions.forEach((def, index: number) => {
      const found = _attributes.findIndex(attribute => {
        return attribute.severity.sequenceNumber == def.sequenceNumber;
      });
      if (found == -1 && !_riskConfig.hasCompositeRule) {
        _attributes.push({
          active: false,
          severity: { sequenceNumber: index + 1, label: undefined, rdfIri: undefined },
          impact: {
            sequenceNumber: defaultImpact,
            label: undefined,
            rdfIri: undefined
          }
        });
      }
    });
    // sort _attributes list by severity sequenceNumber if this is not a compositeRule
    if (!_riskConfig.hasCompositeRule) {
      _attributes.sort((_attr1, _attr2) => {
        if (_attr1.severity.sequenceNumber < _attr2.severity.sequenceNumber) {
          return -1;
        } else if (
          _attr1.severity.sequenceNumber > _attr2.severity.sequenceNumber
        ) {
          return 1;
        }
        return 0;
      });
    }
    // translates ruleName and recommendation
    other.ruleNameSaved = other.ruleName;
    _parameters.push({
      ...other,
      attributes: _attributes,
      globalImpact: _attributes[0].impact,
      globalSeverity: undefined
    });
  });
  return _riskConfig;
};