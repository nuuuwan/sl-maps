import React, {Component} from 'react';

import {
  getHSLA,
  PALETTE_LIST,
} from './ColorUtils.js';

import {
  formatPercent,
  getCurrentDateTime,
  getDataInfo,
  getDataInfoKey,
  COMMA_DELIM,
  DATA_DELIM,
  LINE_DELIM,
  FIELD_KEY_TO_LABEL,
} from './DataUtils.js';

import ReactFileReader from 'react-file-reader';
const fileDownload = require('react-file-download');

export default class Table extends Component {
  render() {
    const palette =  PALETTE_LIST[this.props.paletteID];
    const dataInfoKey = this.props.dataInfoKey;
    const dataInfo = getDataInfo(dataInfoKey);

    const onClickDownload = function(e) {
      const keyName = [
          this.props.parentFieldKey,
          this.props.parentFieldValue,
          this.props.childFieldKey,
      ].join(DATA_DELIM);
      const tableName = dataInfo['table_name'];
      const tableKey = dataInfo['table_key'];

      const dataLines = Object.entries(dataInfo['data_map']).map(
        function([key, value], i) {
          return key + COMMA_DELIM +  value;
        },
      );
      const content = [[keyName, [tableName, tableKey].join(DATA_DELIM)].join(COMMA_DELIM)]
        .concat(dataLines)
        .join(LINE_DELIM);

      const fileName = getDataInfoKey(
        this.props.parentFieldKey,
        this.props.parentFieldValue,
        this.props.childFieldKey,
        tableName,
        tableKey,
        dataInfo['source'],
      ) + '.csv';

      fileDownload(content, fileName);
    }.bind(this);

    const onUpload = function(files) {
      function b64DecodeUnicode(str) {
          return decodeURIComponent(atob(str).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
      }

      const PREFIX = 'data:text/csv;base64,';
      const content = b64DecodeUnicode(
        files.base64.substring(PREFIX.length),
      );

      const lines = content.split(LINE_DELIM);
      const [keyName, dataName] = lines[0].split(COMMA_DELIM);
      const [tableName, tableKey] = dataName.split(DATA_DELIM);
      const [
          parentFieldKey,
          parentFieldValue,
          childFieldKey,
      ] = keyName.split(DATA_DELIM);

      const dataMap = lines.slice(1).reduce(
        function(dataMap, line, i) {
          const [childFieldValue, dataValue] = line.split(COMMA_DELIM);
          dataMap[childFieldValue] = parseFloat(dataValue);
          return dataMap;
        },
        {},
      );

      const dataInfo = {
        'parent_field_key': parentFieldKey,
        'parent_field_value': parentFieldValue,
        'child_field_key': childFieldKey,
        'table_name': ' [👤Custom] ' + tableName,
        'table_key': tableKey,
        'data_map': dataMap,
        'source': 'Unverified Custom Upload ' + getCurrentDateTime(),
      }
      this.props.onUploadData(
        parentFieldKey,
        parentFieldValue,
        childFieldKey,
        dataInfo,
      )

    }.bind(this);

    return (
      <div className="div-data-view">
        <button onClick={onClickDownload}>Download CSV</button>
        <ReactFileReader
          fileTypes={[".csv"]}
          base64={true}
          multipleFiles={false}
          handleFiles={onUpload}
        >
          <button className='btn'>Upload CSV</button>
        </ReactFileReader>
        {renderDataTable(dataInfo, palette)}
      </div>
    )
  }
}

function renderDataTable(dataInfo, palette) {
  const dataMap = dataInfo['data_map'];
  const key = FIELD_KEY_TO_LABEL[dataInfo['child_field_key']];
  const value = '%';

  const dataValueList = Object.values(dataMap);  
  const dataRows = Object.entries(dataMap).sort(
    function(a, b) {
      return -a[1] + b[1];
    }
  ).map(
    function([dataKey, dataValue], i) {
      const style = {
        'backgroundColor': getHSLA(...palette(
            dataValueList,
            dataValue,
        )),
      };
      const key = 'data-table-row-data-' + i;
      return (
        <tr key={key}>
          <td>{dataKey}</td>
          <td className='td-data-table-cell-number' style={style}>
            {formatPercent(dataValue)}
          </td>
        </tr>
      )
    }
  );

  return (
    <table className="table-data-table">
      <thead>
        <tr>
          <th>{key}</th>
          <th>{value}</th>
        </tr>
      </thead>
      <tbody>
        {dataRows}
      </tbody>
    </table>
  );

}
