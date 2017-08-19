/**
 * @flow
 */
import React, { PropTypes } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity
} from 'react-native';

function Button(props){
  let buttonContainerStyle = [styles.buttonContainer];
  if(props.style) buttonContainerStyle.push(props.style);
  if(props.disabled) buttonContainerStyle.push(styles.disabledButton);
  return <TouchableOpacity style={buttonContainerStyle} onPress={!props.disabled ? props.onPressed : ()=>{}}>
          <Image style={[styles.buttonIcon]} source={props.image} resizeMode={'cover'}/>
      </TouchableOpacity>;
}
Button.propTypes ={
  'onPressed' : PropTypes.func.isRequired,
  'image' : PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.number
  ]),
  'disabled' :PropTypes.bool
}
const styles = StyleSheet.create({
  buttonContainer :{
  },
  disabledButton:{
    opacity:0.5
  },
  buttonIcon:{
    width:30,
    height:30
  }
});
export default Button;
