import React, {Component} from 'react';

import {PALETTE_LIST, getHSLA} from './ColorUtils.js';

import {
  getAreaConfigList,
  getDataInfoKeyList,
  getDataInfo,
  formatPercent,
} from './DataUtils.js';
const DATA_DELIMITER = '____'

export default class OptionsView extends Component {
  render() {
    return (
      <div className="div-options-view">
        <div className='div-options-view-item'>
          <span className="span-options-view-item-label">Area</span>
          {renderAreaSelector(
            this.props.parentFieldKey,
            this.props.parentFieldValue,
            this.props.childFieldKey,
            this.props.onChangeArea
          )}
        </div>

        <div className='div-options-view-item'>
          <span className="span-options-view-item-label">Data</span>
          {renderDataInfoSelector(
            this.props.parentFieldKey,
            this.props.parentFieldValue,
            this.props.childFieldKey,
            this.props.dataInfoKey,
            this.props.onChangeDataInfo,
          )}
        </div>

        <div className='div-options-view-item'>
          <span className="span-options-view-item-label">Palette</span>
          {renderPaletteSelector(
            this.props.paletteID,
            this.props.dataInfoKey,
            this.props.onChangePaletteID,
          )}
        </div>


      </div>
    )
  }
}


function renderAreaSelector(
  selectedParentFieldKey,
  selectedParentFieldValue,
  selectedChildFieldKey,
  onChange,
) {
  const optionList = getAreaConfigList().map(
    function(areaConfig, i) {
      const parentFieldKey = areaConfig.parentFieldKey;
      const parentFieldValue = areaConfig.parentFieldValue;
      const childFieldKey = areaConfig.childFieldKey;
      const label = areaConfig.label;

      const value = [
        parentFieldKey,
        parentFieldValue,
        childFieldKey,
      ].join(DATA_DELIMITER);


      const selected = (selectedParentFieldKey === parentFieldKey)
        && (selectedParentFieldValue === parentFieldValue)
        && (selectedChildFieldKey === childFieldKey);

      const key = 'option-' + i;
      return (
        <option key={key} value={value} selected={selected}>
          {label}
        </option>
      );
    },
  );

  function onChangeInner(e) {
    const [
      parentFieldKey,
      parentFieldValue,
      childFieldKey,
    ] = e.target.value.split(DATA_DELIMITER);

    onChange(
      parentFieldKey,
      parentFieldValue,
      childFieldKey,
    );

  };

  return (
    <select onChange={onChangeInner}>
      {optionList}
    </select>
  );
}

function renderPaletteSelector(
  paletteID,
  dataInfoKey,
  onChangePaletteID,
) {

  const dataInfo = getDataInfo(dataInfoKey);
  const dataValueList = Object.values(dataInfo['data_map']).sort(
    function(a, b) {
      return a - b;
    }
  );
  const n = dataValueList.length;
  const LEGEND_ITEM_COUNT = 5;
  const renderedPalettes = PALETTE_LIST.map(
    function(palette, k) {
      const isSelected = k === paletteID;

      let renderedPalleteItmes = [];
      let i;
      for (i = 0; i < LEGEND_ITEM_COUNT; i += 1) {
        const dataIndex = parseInt(i * (n - 1) / (LEGEND_ITEM_COUNT - 1));
        const value = dataValueList[dataIndex];
        const color = getHSLA(
          ...palette(dataValueList, value),
        );
        const style = {
          backgroundColor: color,
          padding: 12,
        };
        const key =  'legend-item-' + i;
        renderedPalleteItmes.push(
          <div
            className="div-legend-item"
            key={key}
            style={style}
          >
            {formatPercent(value)}
          </div>
        )
      }

      const value = 'palette-' + k;
      function onChangePaletteIDInner(e) {
        onChangePaletteID(k);
      }
      return (
        <div className="div-palette">
          <input
            className='div-legend-column'
            type="radio"
            name="palette"
            value={value}
            checked={isSelected}
            onChange={onChangePaletteIDInner}
          />
          <div className='div-legend'>
            <div className="div-legend-item-group">
              {renderedPalleteItmes}
            </div>
          </div>
        </div>
      )
    },
  )

  return renderedPalettes;
}

function renderDataInfoSelector(
  parentFieldKey,
  parentFieldValue,
  childFieldKey,
  selectedDataInfoKey,
  onChangeDataInfo,
) {
  const optionList = getDataInfoKeyList(
    parentFieldKey,
    parentFieldValue,
    childFieldKey
  ).map(
    function(dataInfoKey, i) {
      const dataInfo = getDataInfo(dataInfoKey);
      const tableName = dataInfo['table_name'];
      const tableKey = dataInfo['table_key'];
      const dataName = tableName + ' (' + tableKey + ')';
      const key = 'option-' + i;
      const selected = (selectedDataInfoKey === dataInfoKey);
      return (
        <option key={key} value={dataInfoKey} selected={selected}>
          {dataName}
        </option>
      );
    },
  );

  function onChangeInner(e) {
    const dataInfoKey = e.target.value;
    onChangeDataInfo(dataInfoKey);
  };

  return (
    <select onChange={onChangeInner}>
      {optionList}
    </select>
  );
}
