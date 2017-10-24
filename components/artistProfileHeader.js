/**
 * @flow
 */
import React, { PropTypes, Component } from 'react';
import { StyleSheet, View, Text,Image } from 'react-native';
import {formatNumberPrefix} from '../helpers/formatters';
import THEME from '../styles/variables';
function ArtistProfileHeader(props){
  if(!props.user) return null;
  let details = props.user;
  return <View style={styles.headerContainer}>
      <View style={styles.horizontalHeaderBox}>
          <Image style={styles.profileImage} source={{url:details.avatarUrl}} resizeMode={'cover'}/>
          <View style={{flex:1}}>
            <Text
            numberOfLines={1}
            ellipsizeMode={'tail'}
            style={styles.headerText}>
            {details.username}
            </Text>
            <Text style={styles.followerCount}>
            {formatNumberPrefix(details.followersCount)} Followers
            </Text>
          </View>
      </View>
      <Text
        numberOfLines={3}
        ellipsizeMode={'tail'}
        style={styles.descText}>
        {details.description}
      </Text>
  </View>;
}
let styles = StyleSheet.create({
  headerContainer :{
    flex:1,
    flexDirection:'column',
    paddingHorizontal:20,
    paddingBottom:20,
    backgroundColor: THEME.mainBgColor,
    borderColor : THEME.contentBorderColor,
    borderBottomWidth :2
  },
  horizontalHeaderBox:{
    flexDirection:'row',
    marginVertical:20
  },
  followerCount:{
    color: THEME.mainColor,
    fontSize: 13,
  },
  profileImage:{
    width:60,
    height:60,
    marginRight:20
  },
  descText:{
    color: THEME.mainHighlightColor,
    fontSize: 15,
    lineHeight: 20,
    fontWeight:'400'
  },
  headerText : {
    color: THEME.mainHighlightColor,
    fontSize: 18,
    lineHeight: 30,
    fontWeight:'600'
  }
});
export default ArtistProfileHeader;
