import React, { PropTypes, Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  Image,
  TextInput,
  ListView,
  View,
  TouchableOpacity
} from 'react-native';
import THEME from '../styles/variables';
import AppText from './appText';
import UserItem from './userItem';
class UserList extends Component {
  constructor(props){
    super(props);
  }
  render(){
    return <View>
    {this.props.userList.map((user,i) => {
      return <UserItem user={user} onSelected={this.props.onUserSelected} key={i} />;
    })}
    </View>;
  }
}
UserList.propTypes = {
  userList: PropTypes.array.isRequired,
  onUserSelected : PropTypes.func
};
const styles = StyleSheet.create({
});

export default UserList;
