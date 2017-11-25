/**
 * @flow
 */

import React, { PropTypes, Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  PickerIOS
} from 'react-native';
import THEME from '../styles/variables';
import MenuOverlay from './menuOverlay';
const PickerItemIOS = PickerIOS.Item;
import AppText from './appText';
class ModalPicker extends Component {
  constructor(props){
    super(props);
  }
  componentWillMount(){
    console.log('ModalPicker component mounted');
  }
  render() {
    return (
        <MenuOverlay {...this.props} >
          <PickerIOS
            itemStyle={styles.itemStyle}
            selectedValue={this.props.selected}
            onValueChange={this.props.onValueChange}>
            {this.props.options.map((option) => (
              <PickerItemIOS
                key={option.key}
                value={option.value}
                label={option.label}
              />
            ))}
          </PickerIOS>
      </MenuOverlay>
    );
  }
}

ModalPicker.defaultProps = {

};
ModalPicker.propTypes = {
  options : PropTypes.arrayOf(PropTypes.object),
  selected : PropTypes.string.isRequired,
  onValueChange : PropTypes.func,
  onClose: PropTypes.func.isRequired
};

const styles = StyleSheet.create({
  container:{
    left:0,
    right:0,
    height:250,
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
  itemStyle:{
    color:THEME.mainHighlightColor,
  },
  closeButtonText:{
    color:THEME.mainHighlightColor,
    textAlign:'right',
    lineHeight:25,
  }
});

export default ModalPicker;
