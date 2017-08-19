/**
 * @flow
 */
import React, { PropTypes, Component } from 'react';
import { StyleSheet } from 'react-native';
import Button from './button';

function ClearPlaylistButton(props){
  return <Button image={require('../assets/flat_clear_list.png')} {...props} />
}

export default ClearPlaylistButton;
