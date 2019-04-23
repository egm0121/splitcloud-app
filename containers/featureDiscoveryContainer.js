/**
 * @flow
 */

import React, { PropTypes, Component } from 'react';
import { AppRegistry, Alert } from 'react-native';
import { connect } from 'react-redux';
import {
  View
} from 'react-native';
import { isFunction } from '../helpers/utils';
import FeatureDiscoveryDot from '../components/featureDiscoveryDot';

class FeatureDiscoveryContainer extends Component {
  constructor(props){
    super(props);
  }
  render() {
    if(isFunction(this.props.children) && this.props.showDot){
      return this.props.children();
    }
    return (
      <View style={this.props.style}>
      {!!this.props.showDot && <FeatureDiscoveryDot />}
      {this.props.children}
      </View>
    );
  }
  shouldComponentUpdate(nextProps){
    return this.props.showDot !== nextProps.showDot;
  }
}
FeatureDiscoveryContainer.propTypes = {
  featureName : PropTypes.string.isRequired
}
const mapStateToProps = (state,props) => {
  return {
    showDot : !!state.featureDiscovery[props.featureName]
  };
};
const ConnectedFeatureDiscoveryContainer =
 connect(mapStateToProps)(FeatureDiscoveryContainer);

AppRegistry.registerComponent(
  'FeatureDiscoveryContainer', 
  () => ConnectedFeatureDiscoveryContainer
);

export default ConnectedFeatureDiscoveryContainer;