/**
 * @flow
 */

import React, { PropTypes, Component } from 'react';
import { AppRegistry, Alert } from 'react-native';
import { connect } from 'react-redux';
import {
  View
} from 'react-native';
import FeatureDiscoveryDot from '../components/featureDiscoveryDot';

class FeatureDiscoveryContainer extends Component {
  constructor(props){
    super(props);
  }
  render() {
    return (
      <View style={this.props.style}>
      {this.props.showDot && <FeatureDiscoveryDot />}
      {this.props.children}
      </View>
    );
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