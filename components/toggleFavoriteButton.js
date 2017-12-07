/**
 * @flow
 */
import React, { PropTypes } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity
} from 'react-native';
import THEME from '../styles/variables';
function ToggleFavoriteButton(props){
  let label = props.isFavorite ? '×':'+';
  let buttonIconStyle = [styles.buttonIcon];
  if(props.disabled){
    buttonIconStyle.push(styles.disabledButton);
  }
  return <TouchableOpacity style={[styles.buttonIcon].concat(props.style)}
          onPress={() => props.disabled ? null : props.onPressed(props.isFavorite) }>
          <Text style={styles.textLabel}>{label}</Text>
      </TouchableOpacity>;
}
ToggleFavoriteButton.propTypes ={
  'onPressed' : PropTypes.func.isRequired,
  'isFavorite' : PropTypes.bool.isRequired,
  'disabled' : PropTypes.bool
}
const styles = StyleSheet.create({
  buttonContainer :{
  },
  disabledButton:{
    opacity:0.4
  },
  textLabel:{
    marginTop:-15,
    textAlign:'center',
    fontSize : 60,
    fontWeight: "300",
    color: THEME.mainHighlightColor
  },
  buttonIcon:{
    borderRadius:25,
    backgroundColor: THEME.imageTextOverlayBgColor,
    width:50,
    height:50
  }
});
export default ToggleFavoriteButton;