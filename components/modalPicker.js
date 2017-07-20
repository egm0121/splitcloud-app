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
const PickerItemIOS = PickerIOS.Item;
class ModalPicker extends Component {
  constructor(props){
    super(props);

  }
  componentWillMount(){
    console.log('ModalPicker component mounted');
  }
  render() {

    return (
        <View style={styles.container}>
          <View style={styles.closeButtonContainer}>
            <TouchableOpacity onPress={ this.props.onClose }
              underlayColor="transparent"
              style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Choose</Text>
            </TouchableOpacity>
          </View>
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
        </View>
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
    backgroundColor:THEME.mainBgColor
  },
  closeButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopColor:  THEME.contentBorderColor,
    borderTopWidth: 1,
    height:30,
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
    lineHeight:20,

  }
});

export default ModalPicker;
