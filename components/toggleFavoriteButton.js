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
import { ucFirst } from '../helpers/formatters';
import THEME from '../styles/variables';
function ToggleFavoriteButton(props){
  let label = props.isFavorite ? '×':'+';
  let textLabel = [styles.textLabel];
  let buttonIconStyle = [styles.buttonIcon];
  textLabel.push(styles[`text${ucFirst(props.size)}`]);
  buttonIconStyle.push(styles[`button${ucFirst(props.size)}`]);

  if(props.disabled) buttonIconStyle.push(styles.disabledButton);
  if(props.isFavorite) textLabel.push(styles.textSecondaryLabel)
  return <View style={buttonIconStyle.concat(props.style)} >
        <TouchableOpacity style={styles.touchable}
            disabled={props.disabled}
            onPress={() => props.onPressed(props.isFavorite) }>
            <Text style={textLabel}>{label}</Text>
        </TouchableOpacity>
      </View>;
}
ToggleFavoriteButton.propTypes ={
  'onPressed' : PropTypes.func.isRequired,
  'isFavorite' : PropTypes.bool.isRequired,
  'disabled' : PropTypes.bool,
  'size' : PropTypes.oneOf(['normal', 'small'])
}
const styles = StyleSheet.create({
  buttonContainer :{
  },
  disabledButton:{
    opacity:0.4
  },
  textLabel:{
    marginTop:-12,
    marginLeft:3,
    textAlign:'center',
    fontSize : 50,
    fontWeight: "300",
    color: THEME.mainHighlightColor,
  },
  textSecondaryLabel:{
    color: THEME.mainColor,
  },
  textNormal:{},
  textSmall:{
    marginTop:-5,
    marginLeft:2,
    fontSize: 30
  },
  touchable:{
    flex:1
  },
  buttonIcon:{
    borderRadius:20,
    borderBottomLeftRadius:0,
    borderBottomRightRadius:0,
    backgroundColor:THEME.imageTextOverlayBgColor,
    width:40,
    height:40
  },
  buttonNormal:{
  },
  buttonSmall:{
    borderRadius:15,
    borderBottomLeftRadius:0,
    borderBottomRightRadius:0,
    width:30,
    height:30
  }
});
export default ToggleFavoriteButton;