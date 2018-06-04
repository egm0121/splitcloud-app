import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import THEME from '../styles/variables';

export default function SectionTabBar(props){
  let renderTabs = () => {
    return React.Children.map( props.children, function(child){
      if(React.isValidElement(child)){
        return React.cloneElement(child, {
          onSelected: props.onSelected,
          active:props.active
        });
      }
      return child;
    })
  }
  return <View style={[styles.tabBarContainer,props.style]}>
  { props.disableScroll ? renderTabs() :
  <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
    {renderTabs()}
  </ScrollView>}
  </View>;
}

const styles = StyleSheet.create({
  tabBarContainer:{
    flexDirection:'row',
    paddingLeft:20,
    paddingVertical:20,
    borderBottomWidth:1,
    //backgroundColor:THEME.contentBorderColor,
    borderColor: THEME.contentBorderColor
  }
});
