/**
 * @flow
 */

import React, { PropTypes, Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableOpacity
} from 'react-native';
import THEME from '../styles/variables';
import AppText from './appText';
class MenuOverlay extends Component {
  constructor(props){
    super(props);
  }
  componentWillMount(){
    console.log('MenuOverlay component mounted');
  }
  render() {

    return (
        <View style={[styles.container,this.props.overlayStyle]}>
          <View style={styles.closeButtonContainer}>
            <TouchableOpacity onPress={ this.props.onClose }
              underlayColor="transparent"
              style={styles.closeButton}>
                <AppText bold={true} style={styles.closeButtonText}>
                {(this.props.closeLabel || 'Choose')}
                </AppText>
            </TouchableOpacity>
          </View>
          {this.props.children}
        </View>
    );
  }
}

MenuOverlay.defaultProps = {

};
MenuOverlay.propTypes = {

  onClose: PropTypes.func.isRequired
};

const styles = StyleSheet.create({
  container:{
    left:0,
    right:0,
    bottom:0,
    position:'absolute',
    backgroundColor:THEME.mainBgColor,
    opacity:0.95
  },
  closeButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopColor:  THEME.contentBorderColor,
    borderTopWidth: 1,
    height:35,
    borderBottomColor: THEME.contentBorderColor,
    borderBottomWidth:1,
    paddingRight:10
  },
  closeButtonText:{
    color:THEME.mainHighlightColor,
    textAlign:'right',
    lineHeight:25
  }
});

export default MenuOverlay;
