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
import {ucFirst} from '../helpers/formatters';
function Button(props){
  let sizes = ['tiny','small','big','bigger','huge'];
  let buttonContainerStyle = [styles.buttonContainer];
  let buttonIconStyle = [styles.buttonIcon];
  if(props.style) buttonContainerStyle.push(props.style);
  if(props.imageStyle) buttonIconStyle.push(props.imageStyle);
  if(props.size && sizes.includes(props.size)) {
    buttonIconStyle.push(styles['buttonSize'+ucFirst(props.size)]);
  }
  if(props.disabled){
    buttonIconStyle.push(styles.disabledButton);
  }
  return <TouchableOpacity style={buttonContainerStyle}
          onPress={!props.disabled ? props.onPressed : ()=>{}}>
          <Image style={buttonIconStyle} source={props.image} resizeMode={'cover'}/>
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
    opacity:0.4
  },
  buttonIcon:{
    width:30,
    height:30
  },
  buttonSizeTiny:{
    width:20,
    height:20
  },
  buttonSizeSmall:{
    width:25,
    height:25
  },
  buttonSizeBig:{
    width:35,
    height:35
  },
  buttonSizeBigger:{
    width:40,
    height:40
  },
  buttonSizeHuge:{
    width:45,
    height:45
  }
});
export default Button;
