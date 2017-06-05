/**
 * @flow
 */
import React, { PropTypes, Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity
} from 'react-native';
import THEME from '../styles/variables';

function BackButton(props){
  let buttonContainerStyle = props.style ?
    [styles.closeButtonContainer,props.style]:
    [styles.closeButtonContainer];
  return <TouchableOpacity style={buttonContainerStyle} onPress={props.onPressed}>
          <Image style={[styles.closeButtonIcon]} source={require('../assets/flat_back_btn.png')} resizeMode={'cover'}/>
      </TouchableOpacity>;

}
BackButton.propTypes ={
  'onPressed' : PropTypes.func.isRequired
}
const styles = StyleSheet.create({
  closeButtonContainer :{
    position:'absolute',
    left:10,
    top:20
  },
  closeButtonIcon:{
    width:30,
    height:30
  }
});
export default BackButton;
