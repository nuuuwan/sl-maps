import React, {Component} from 'react';

import {
  getHSLA,
  PALETTE_LIST,
} from './ColorUtils.js';

import {
  getDataInfo,
  BIG_MAP_DATA,
  formatPercent,
  FIELD_KEY_TO_LABEL,
} from './DataUtils.js';


export default class MapView extends Component {
  render() {
    const parentFieldKey = this.props.parentFieldKey;
    const parentFieldValue = this.props.parentFieldValue;
    const childFieldKey = this.props.childFieldKey;
    const dataInfoKey = this.props.dataInfoKey;
    const dataInfo = getDataInfo(dataInfoKey);
    const palette =  PALETTE_LIST[this.props.paletteID];

    const title = parentFieldValue + ' ' + FIELD_KEY_TO_LABEL[parentFieldKey];
    const subTitle = dataInfo['table_name'];
    const subTitle2 = dataInfo['table_key'];
    const subSubTitle = 'By ' + FIELD_KEY_TO_LABEL[childFieldKey];

    const dataMap = dataInfo['data_map'];
    const source = dataInfo['source'];
    const dataValueList = Object.values(dataMap);
    const medianDataValue = dataValueList[parseInt(dataValueList.length / 2)];
    const medianColor = palette(dataValueList, medianDataValue);

    const MAX_DIM = 640;
    function funcChildToColor(childFieldValue) {
      return getHSLA(
        ...palette(
            dataValueList,
            dataMap[childFieldValue],
        )
      )
    }

    function funcChildToLabelInfo(childFieldValue) {
      return {
        key: childFieldValue,
        value: formatPercent(dataMap[childFieldValue]),
      };
    }

    function funcFilter(data, i) {
      if (parentFieldKey === 'country') {
        return true;
      }
      return data[parentFieldKey] === parentFieldValue;
    };
    const dataList = BIG_MAP_DATA.filter(funcFilter);

    const renderedDataList = renderDataList(
        dataList,
        childFieldKey,
        MAX_DIM,
        funcChildToColor,
        funcChildToLabelInfo,
    );

    const [xTitle, yTitle] = [MAX_DIM / 2, 15];
    const [xSubTitle, ySubTitle] = [MAX_DIM / 2, 45];
    const [xSubTitle2, ySubTitle2] = [MAX_DIM / 2, 70];
    const [xSubSubTitle, ySubSubTitle] = [MAX_DIM / 2, 85];
    const [xSource, ySource] = [MAX_DIM / 2, 100];

    const color = getHSLA(...medianColor);
    const STYLE_TITLE = {
      fill: color,
      stroke: 'none',
      textAnchor: 'middle',
      fontFamily: 'Futura',
      fontSize: 12,
    };
    const STYLE_SUB_TITLE = {
      fill: 'gray',
      stroke: 'none',
      textAnchor: 'middle',
      fontFamily: 'Futura',
      fontSize: 24,
    };
    const STYLE_SUB_TITLE2 = {
      fill: 'black',
      stroke: 'none',
      textAnchor: 'middle',
      fontFamily: 'Futura',
      fontSize: 21,
    };
    const STYLE_SUB_SUB_TITLE = {
      fill: color,
      stroke: 'none',
      textAnchor: 'middle',
      fontFamily: 'Futura',
      fontSize: 12,
    };
    const STYLE_SOURCE = {
      fill: 'gray',
      stroke: 'none',
      textAnchor: 'middle',
      fontFamily: 'Futura',
      fontSize: 8,
    };

    return (
      <svg className="svg-map" height={MAX_DIM} width={MAX_DIM}>
        <text x={xTitle} y={yTitle} style={STYLE_TITLE}>
          {title}
        </text>
        <text x={xSubTitle} y={ySubTitle} style={STYLE_SUB_TITLE}>
          {subTitle}
        </text>
        <text x={xSubTitle2} y={ySubTitle2} style={STYLE_SUB_TITLE2}>
          {subTitle2}
        </text>
        <text
          x={xSubSubTitle}
          y={ySubSubTitle}
          style={STYLE_SUB_SUB_TITLE}
        >
          {subSubTitle}
        </text>
        <text x={xSource} y={ySource} style={STYLE_SOURCE}>
          {'Source: ' + source}
        </text>
        {renderedDataList}
      </svg>
    )
  }
}

function renderDataList(
    dataList, childFieldKey,
    MAX_DIM,
    funcChildToColor,
    funcChildToLabelInfo,
) {
  const childToPolygonList = dataList.reduce(
    function(childToPolygonList, data, i) {
      const childFieldValue = data[childFieldKey];
      if (!(childFieldValue in childToPolygonList)) {
        childToPolygonList[childFieldValue] = [];
      }
      const polygonList = getPolygonList(data['nq_polygon_list']);
      childToPolygonList[childFieldValue] =
        childToPolygonList[childFieldValue].concat(polygonList)
      return childToPolygonList;
    },
    {},
  );

  /* eslint-disable no-unused-vars */
  const [
    minLat,
    maxLat,
    latSpan,
    minLon,
    maxLon,
    lonSpan,
  ] = getBBox(Object.values(childToPolygonList));
  /* eslint-enable no-unused-vars */

  const HEADER_HEIGHT = 120;
  let WIDTH = (MAX_DIM - HEADER_HEIGHT);
  let HEIGHT = WIDTH;
  let WIDTH_PADDING = 0;
  let HEIGHT_PADDING = 0;
  const r = latSpan / lonSpan;

  if (r < 1) {
    HEIGHT = HEIGHT * r;
    HEIGHT_PADDING = ((MAX_DIM - HEADER_HEIGHT) - HEIGHT) / 2;
  } else {
    WIDTH = WIDTH / r;
    WIDTH_PADDING = ((MAX_DIM - HEADER_HEIGHT) - WIDTH) / 2;
  }

  function tx(lon) {
    return WIDTH * (lon - minLon) / lonSpan + WIDTH_PADDING;
  };
  function ty(lat) {
    return HEADER_HEIGHT + HEIGHT * (1  - (lat - minLat) / latSpan)
      + HEIGHT_PADDING;
  };
  function t(point) {
    const [lat, lon] = point;
    return [tx(lon), ty(lat)];
  };

  const renderedPolygonListList = Object.entries(childToPolygonList).map(
    function([childFieldValue, polygonList], i) {
      return renderPolygonList(
        polygonList,
        i,
        t,
        funcChildToColor(childFieldValue),
        funcChildToLabelInfo(childFieldValue),
      );
    }
  );

  return (
    <svg>
      {renderedPolygonListList}
    </svg>
  );
}

function renderPolygonList(polygonList, iPolygonList, t, color, label) {
  const renderedPolygonList = polygonList.map(
    function(polygon, i) {
      return renderPolygon(polygon, i, t, color, label);
    }
  );

  /* eslint-disable no-unused-vars */
  const [
    minLat,
    maxLat,
    latSpan,
    minLon,
    maxLon,
    lonSpan,
  ] = getBBox([polygonList]);
  /* eslint-enable no-unused-vars */

  const midLat = (minLat + maxLat) / 2;
  const midLon = (minLon + maxLon) / 2;

  const [x, y] = t([midLat, midLon]);

  const STYLE_MAP_LABEL_KEY= {
    fill: 'black',
    stroke: 'none',
    textAnchor: 'middle',
    fontFamily: 'Futura',
    fontSize: 9,
  };
  const STYLE_MAP_LABEL_VALUE= {
    fill: 'black',
    stroke: 'none',
    textAnchor: 'middle',
    fontFamily: 'Futura',
    fontSize: 12,
  };

  return (
    <svg>
      {renderedPolygonList}
      <text x={x} y={y - 6} style={STYLE_MAP_LABEL_KEY}>
        {label.key}
      </text>
      <text x={x} y={y + 6} style={STYLE_MAP_LABEL_VALUE}>
        {label.value}
      </text>
    </svg>
  )

}

function renderPolygon(polygon, iPolygon, t, color, label) {
  const PATH_STYLE = {
    fill: color,
    stroke: 'none',
  };

  const d = polygon.map(
    function(point, i) {
      const [x, y] = t(point);

      const cmd = (i === 0) ? 'M' : 'L';
      return cmd + x + ' ' + y;
    },
  ).join(' ') + ' Z';

  return (
    <svg>
      <path d={d} style={PATH_STYLE} />
    </svg>
  );
}



function  getPolygonList(nqPolygonList) {
  return nqPolygonList.map(
    function(nqPolygonListData, i) {
      return getPolygon(
          nqPolygonListData['start'],
          nqPolygonListData['nq_polygon'],
      );
    },
  );
}

function  getPolygon(start, nqPolygon) {
  let [curLat, curLon] = decompressPoint(start);
  return [[curLat, curLon]].concat(nqPolygon.split(DATA_DELIM).map(
    function(dPointStr, i) {
      const [dLat, dLon] = decompressPoint(dPointStr);
      [curLat, curLon] = [curLat + dLat, curLon + dLon];
      return [curLat, curLon];
    },
  ));
}

const QUANTUM = 1000;
const POINT_DELIM = ',';
const DATA_DELIM = ';';
function decompressPoint(pointStr) {
  const tokens = pointStr.split(POINT_DELIM);
  return [
    decompressFloat(tokens[0]),
    decompressFloat(tokens[1]),
  ];
}

function decompressFloat(floatStr) {
  return parseFloat(floatStr) * 1.0 / QUANTUM
}

function getBBox(polygonListList) {
  const flatPointList = polygonListList.reduce(
    function(flatPointList, polygonList, i) {
      return polygonList.reduce(
        function(flatPointList, polygon, j) {
          return polygon.reduce(
            function(flatPointList, point, k) {
              flatPointList.push(point);
              return flatPointList;
            },
            flatPointList,
          );
        },
        flatPointList,
      );
    },
    [],
  );

  const [
    minLat,
    maxLat,
    minLon,
    maxLon,
  ] = flatPointList.reduce(
    function([
      minLat,
      maxLat,
      minLon,
      maxLon,
    ], point, i) {
      const [lat, lon] = point;

      if (lat && lon) {
        minLat = Math.min(lat, minLat);
        maxLat = Math.max(lat, maxLat);

        minLon = Math.min(lon, minLon);
        maxLon = Math.max(lon, maxLon);
      }


      return [
        minLat,
        maxLat,
        minLon,
        maxLon,
      ];
    },
    [1000, -1000, 1000, -1000],
  );

  return [
    minLat,
    maxLat,
    maxLat - minLat,
    minLon,
    maxLon,
    maxLon - minLon,
  ];
}
