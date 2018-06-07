import React, { PropTypes, Component } from 'react';
import {
  StyleSheet,
  Image,
  View,
  TouchableOpacity
} from 'react-native';
import THEME from '../styles/variables';
import AppText from './appText';
class UserItem extends Component {
  constructor(props){
    super(props);
  }
  render(){
    const { user } = this.props;
    const name = user.username || user.firstName +' '+user.lastName;
    const artwork = user.avatarUrl ? 
        {url: user.avatarUrl} : require('../assets/alt_album_cover.png');
    const emptyArtworkBg = user.avatarUrl ? null :styles.transparentBg
    return <View style={styles.container}>
        <TouchableOpacity
        onPress={this.props.onSelected.bind(this,user)} style={styles.itemContainer} >
            <Image style={[styles.profileImage,emptyArtworkBg]} source={artwork} resizeMode={'cover'}/>
            <AppText style={styles.userText} numberOfLines={1} ellipsizeMode={'tail'}>{name}</AppText>
        </TouchableOpacity>
    </View>;
  }
}
UserItem.propTypes = {
  user: PropTypes.object.isRequired,
  onSelected : PropTypes.func
};
const styles = StyleSheet.create({
  container:{
    flex:1,
    flexDirection:'row',
  },
  itemContainer:{
    flex:1,
    paddingHorizontal:20,
    marginVertical:20,
    flexDirection:'row',
  },
  userText:{
    flex:1,
    color: THEME.mainHighlightColor,
    fontSize: 17,
    lineHeight: 35,
    fontWeight:'600'
  },
  transparentBg:{
    backgroundColor:'transparent',
  },
  profileImage:{
    borderRadius:25,
    backgroundColor: THEME.listBorderColor,
    width:50,
    height:50,
    marginRight:20,
    flex:0
  }
});

export default UserItem;
