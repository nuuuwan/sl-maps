import React, {Component} from 'react';
import { Redirect } from 'react-router-dom'

import Header from './Header.js';
import OptionsView from './OptionsView.js';
import TableView from './TableView.js';
import MapView from './MapView.js';

import ReactToPrint from 'react-to-print';
import {Helmet} from "react-helmet";

import {
  getRandomDataInfoKey,
  getDataInfoKey,
  getDataInfo,
  uploadcustomDataInfoMapInfo,
  FIELD_KEY_TO_LABEL,
} from './DataUtils.js';

export default class HomePage extends Component {
  constructor(props) {
    super(props);

    let dataInfoKey =  props.dataInfoKey;
    const dataInfo = getDataInfo(dataInfoKey);

    let parentFieldKey, parentFieldValue, childFieldKey;

    if (dataInfo !== undefined) {
      parentFieldKey = dataInfo['parent_field_key'];
      parentFieldValue = dataInfo['parent_field_value'];
      childFieldKey = dataInfo['child_field_key'];
    } else {
      parentFieldKey = 'country';
      parentFieldValue = 'Sri Lanka';
      childFieldKey = 'province';

      dataInfoKey = getRandomDataInfoKey(
        parentFieldKey,
        parentFieldValue,
        childFieldKey,
      );
    }

    this.state = {
      parentFieldKey:  parentFieldKey,
      parentFieldValue: parentFieldValue,
      childFieldKey: childFieldKey,
      dataInfoKey: dataInfoKey,
      paletteID: 0,
    };
  }


  render() {
    const onChangeArea = function(
        parentFieldKey,
        parentFieldValue,
        childFieldKey,
    ) {
      this.setState({
          parentFieldKey: parentFieldKey,
          parentFieldValue: parentFieldValue,
          childFieldKey: childFieldKey,
          dataInfoKey: getRandomDataInfoKey(
            parentFieldKey,
            parentFieldValue,
            childFieldKey,
          ),
      });
    }.bind(this);

    const onChangePaletteID = function(paletteID) {
      this.setState({paletteID: paletteID});
    }.bind(this);

    const onChangeDataInfo = function(dataInfoKey) {
      this.setState({
        dataInfoKey: dataInfoKey,
      });
    }.bind(this);

    const onUploadData = function(
      parentFieldKey,
      parentFieldValue,
      childFieldKey,
      dataInfo,
    ) {
      const dataInfoKey = getDataInfoKey(
        dataInfo['parent_field_key'],
        dataInfo['parent_field_value'],
        dataInfo['child_field_key'],
        dataInfo['table_name'],
        dataInfo['table_key'],
        dataInfo['source'],
      );
      uploadcustomDataInfoMapInfo(dataInfo);
      this.setState({
          parentFieldKey: parentFieldKey,
          parentFieldValue: parentFieldValue,
          childFieldKey: childFieldKey,
          dataInfoKey: dataInfoKey,
      });
    }.bind(this);

    const dataInfo = getDataInfo(this.state.dataInfoKey);
    const tcTitle = 'Maps of Sri Lanka';
    const tcDescription = dataInfo['table_name']
      + ' ' + dataInfo['table_key'] + '. '
      +  dataInfo['parent_field_value'] + ' '
      + FIELD_KEY_TO_LABEL[dataInfo['parent_field_key']]
      +  ' By '
      + FIELD_KEY_TO_LABEL[dataInfo['child_field_key']]
      + '. '
      + ' (Source: ' + dataInfo['source'] + ')';
    const txImage = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Sri_Lanka_%28orthographic_projection%29.svg/1920px-Sri_Lanka_%28orthographic_projection%29.svg.png';

    return (
      <div className="div-home-page">
        <Helmet>
          <meta name="twitter:title" content={tcTitle} />
          <meta name="twitter:description" content={tcDescription} />
          <meta name="twitter:image" content={txImage} />
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:site" content="@nuuuwan" />
          <meta name="twitter:creator" content="@nuuuwan" />

          <meta name="og:title" content={tcTitle} />
          <meta name="og:description" content={tcDescription} />
          <meta name="og:image" content={txImage} />
          <meta name="og:type" content="summary" />
        </Helmet>

        <Redirect to={'/' + this.state.dataInfoKey} />
        <div className="div-home-page-header">
          <Header />
        </div>
        <div className="div-home-page-body">
          <div className="div-home-page-body-item">
            <OptionsView
              parentFieldKey={this.state.parentFieldKey}
              parentFieldValue={this.state.parentFieldValue}
              childFieldKey={this.state.childFieldKey}
              paletteID={this.state.paletteID}

              dataInfoKey={this.state.dataInfoKey}

              onChangeArea={onChangeArea}
              onChangePaletteID={onChangePaletteID}
              onChangeDataInfo={onChangeDataInfo}
            />


          </div>

          <div className="div-home-page-body-item">
            <TableView
              parentFieldKey={this.state.parentFieldKey}
              parentFieldValue={this.state.parentFieldValue}
              childFieldKey={this.state.childFieldKey}
              paletteID={this.state.paletteID}

              dataInfoKey={this.state.dataInfoKey}

              onUploadData={onUploadData}
            />
          </div>


          <div className="div-home-page-body-item">
              <div>
                <ReactToPrint
                  trigger={function() {
                    return <button>Print Map</button>;
                  }}
                  content={() => this.componentRef}
                />
              </div>
              <MapView
                ref={el => (this.componentRef = el)}

                parentFieldKey={this.state.parentFieldKey}
                parentFieldValue={this.state.parentFieldValue}
                childFieldKey={this.state.childFieldKey}
                paletteID={this.state.paletteID}

                dataInfoKey={this.state.dataInfoKey}

              />
          </div>


        </div>
        <div className="div-home-page-fotter">
        </div>
      </div>
    );
  }
}
