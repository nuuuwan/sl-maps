const md5 = require('md5');

export const BIG_MAP_DATA = require('./data/sri_lanka_big_map.json');
export const MAP_STATS_DATA_MAP =
  require('./data/map_stats_data_map.json');

export const FIELD_KEY_TO_LABEL = {
  country: '',
  pd: 'Polling Division',
  ed: 'Electoral District',
  province: 'Province',
  district: 'District',
  dsd: 'Divisional Secretariat Division',
  gnd: 'Grama Niladari Division',
}

const PARENT_CHILD_LIST = [
  ['country', 'province'],
  ['country', 'district'],
  // ['country', 'ed'],
  // ['province', 'district'],
  // ['province', 'ed'],
  // ['ed', 'pd'],
  ['district', 'dsd'],
];

export function getAreaConfigList() {
  return Object.values(AREA_CONFIG_MAP).sort(
    function(a, b) {
      const cmpParentFieldKey = a.parentFieldKey.localeCompare(
        b.parentFieldKey,
      );
      if (cmpParentFieldKey) {
        return cmpParentFieldKey;
      }

      const cmpParentFieldValue = a.parentFieldValue.localeCompare(
        b.parentFieldValue,
      );
      if (cmpParentFieldValue) {
        return cmpParentFieldValue;
      }

      const cmpChildFieldKey = a.childFieldKey.localeCompare(
        b.childFieldKey,
      );
      if (cmpChildFieldKey) {
        return cmpChildFieldKey;
      }

      const cmpChildFieldValue = a.childFieldValue.localeCompare(
        b.childFieldValue,
      );
      return cmpChildFieldValue;
    },
  );
}

export function getAreaConfigKey(
  parentFieldKey,
  parentFieldValue,
  childFieldKey
) {
  return [parentFieldKey, parentFieldValue, childFieldKey].join('.');
}

function getAreaConfigMap() {
  return PARENT_CHILD_LIST.reduce(
    function(areaConfigMap, [parentFieldKey, childFieldKey], i) {
      return Object.assign(
        areaConfigMap,
        getAreaConfigMapByParentChild(parentFieldKey, childFieldKey),
      );
    },
    {},
  );
}
export const AREA_CONFIG_MAP = getAreaConfigMap();

function getAreaConfigMapByParentChild(parentFieldKey, childFieldKey) {
  const parentToChildListMap = BIG_MAP_DATA.reduce(
    function(parentToChildListMap, data, i) {
      const parentFieldValue = (parentFieldKey === 'country') ? 'Sri Lanka' : data[parentFieldKey];

      const childFieldValue = data[childFieldKey];

      if (!(parentFieldValue in parentToChildListMap)) {
        parentToChildListMap[parentFieldValue] = new Set();
      }
      parentToChildListMap[parentFieldValue].add(childFieldValue);
      return parentToChildListMap;
    },
    {},
  );

  return Object.entries(parentToChildListMap).reduce(
    function(areaConfigMap, [parentFieldValue, childFieldValueSet], i) {
      const key = getAreaConfigKey(
        parentFieldKey,
        parentFieldValue,
        childFieldKey,
      );
      const childFieldValueList = [...childFieldValueSet];

      const label = parentFieldValue + ' '
        + FIELD_KEY_TO_LABEL[parentFieldKey]
        + ' (by ' + childFieldValueList.length + ' '
        + FIELD_KEY_TO_LABEL[childFieldKey] + 's)';

      areaConfigMap[key] = {
        parentFieldKey: parentFieldKey,
        childFieldKey: childFieldKey,
        parentFieldValue: parentFieldValue,
        childFieldValueList: childFieldValueList,
        label: label,
      };
      return areaConfigMap;
    },
    {},
  );

}

export function getRandomDataInfoKey(
  parentFieldKey,
  parentFieldValue,
  childFieldKey,
) {
  const dataInfoKeyList = getDataInfoKeyList(
    parentFieldKey,
    parentFieldValue,
    childFieldKey,
  );
  return dataInfoKeyList[0];
}

export function getCompleteDataInfoMap() {
  return Object.assign(
    MAP_STATS_DATA_MAP,
    getCustomDataInfoMap(),
  );
}

export function getDataInfo(dataInfoKey) {
  const completeDataInfoMap = getCompleteDataInfoMap();
  return completeDataInfoMap[dataInfoKey]
}

export function getDataInfoKeyList(
  parentFieldKey,
  parentFieldValue,
  childFieldKey,
) {
  const completeDataInfoMap = getCompleteDataInfoMap();
  return Object.entries(completeDataInfoMap).filter(
    function([key, dataInfo], i) {
      return dataInfo['parent_field_key'] === parentFieldKey
        && dataInfo['parent_field_value'] === parentFieldValue
        && dataInfo['child_field_key'] === childFieldKey;
    }
  ).sort(
    function(a, b) {
      return a[1]['table_name'].localeCompare(
          b[1]['table_name'],
      );
    },
  ).map(
    function([key, dataInfo], i) {
      return key;
    }
  );
}

export function getDataInfoKey(
  parentFieldKey,
  parentFieldValue,
  childFieldKey,
  tableName,
  tableKey,
  source,
) {
  return md5([
    parentFieldKey,
    parentFieldValue,
    childFieldKey,
    tableName,
    tableKey,
    source,
  ].join(DATA_DELIM)).substring(0, 8);
}

export function formatPercent(x) {
  if (!x) {
    return '';
  }
  return x.toLocaleString(
      undefined,
      {
        style: 'percent',
        minimumFractionDigits: 1,
      },
  );
}

const CACHE_KEY_CUSTOM_DATA_INFO_MAP = 'maps_lk.customDataInfoMap'
export function uploadcustomDataInfoMapInfo(dataInfo) {
  let customDataInfoMap = getCustomDataInfoMap();
  const dataInfoKey = getDataInfoKey(
    dataInfo['parent_field_key'],
    dataInfo['parent_field_value'],
    dataInfo['child_field_key'],
    dataInfo['table_name'],
    dataInfo['table_key'],
    dataInfo['source'],
  )
  customDataInfoMap[dataInfoKey] = dataInfo;
  let customDataInfoMapJson = JSON.stringify(customDataInfoMap);

  localStorage.setItem(CACHE_KEY_CUSTOM_DATA_INFO_MAP, customDataInfoMapJson);
}

function getCustomDataInfoMap() {
  let customDataInfoMapJson =
    localStorage.getItem(CACHE_KEY_CUSTOM_DATA_INFO_MAP);
  let customDataInfoMap = JSON.parse(customDataInfoMapJson);
  if (!customDataInfoMap) {
    customDataInfoMap = {};
  }
  return customDataInfoMap;
}

export function getCurrentDateTime() {
  return (new Date()).toLocaleString()
}

export const COMMA_DELIM = ',';
export const DATA_DELIM = '_';
export const LINE_DELIM = '\n';
