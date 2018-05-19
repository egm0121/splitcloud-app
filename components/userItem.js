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
    return <View>
        <TouchableOpacity
        onPress={this.props.onSelected.bind(this,user)} >
          <View style={styles.itemContainer}>
            <Image style={styles.profileImage} source={{url:this.props.user.avatarUrl}} resizeMode={'cover'}/>
            <AppText style={styles.userText} numberOfLines={1} ellipsizeMode={'tail'}>{name}</AppText>
          </View>
        </TouchableOpacity>
    </View>;
  }
}
UserItem.propTypes = {
  user: PropTypes.object.isRequired,
  onSelected : PropTypes.func
};
const styles = StyleSheet.create({
  userText:{
    flex:1,
    color: THEME.mainHighlightColor,
    fontSize: 17,
    lineHeight: 35,
    fontWeight:'600'
  },
  profileImage:{
    borderRadius:25,
    backgroundColor:'gray',
    width:50,
    height:50,
    marginRight:20
  },
  itemContainer:{
    flexDirection:'row',
    marginHorizontal:20,
    marginVertical:20
  }
});

export default UserItem;
