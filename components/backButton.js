/**
 * @flow
 */
import React, { PropTypes, Component } from 'react';
import { StyleSheet } from 'react-native';
import Button from './button';

function BackButton(props){
  return <Button  image={require('../assets/flat_back_btn.png')} size={'small'} {...props} />
}

export default BackButton;
