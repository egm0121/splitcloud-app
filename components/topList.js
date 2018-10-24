/**
 * @flow
 */

import React, { PropTypes, Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  TextInput,
  Image,
  ListView,
  ActivityIndicator,
  View,
  TouchableOpacity,
  TouchableHighlight,
  LayoutAnimation
} from 'react-native';
import axios from 'axios';
import SoundCloudApi from '../modules/SoundcloudApi';
import THEME from '../styles/variables';
import {animationPresets} from '../helpers/constants';
import { ucFirst } from '../helpers/formatters';
import SectionTabBar from '../components/sectionTabBar';
import SectionItem from '../components/sectionItem';
import TrackListContainer from '../containers/trackListContainer';
import ModalPicker from '../components/modalPicker';
import DiscoverProviderContainer from '../containers/discoverProviderContainer';
import OfflineTracksContainer from '../containers/offlineTracksContainer';
import SelectionExpolorer from './selectionExplorer';
import {formatGenreLabel} from '../helpers/formatters';
import AppText from './appText';
class TopList extends Component {

  constructor(props){
    super(props);
    this._onGenreChange = this._onGenreChange.bind(this);
    this.onClosePicker = this.onClosePicker.bind(this);
    this.updateResultList = this.updateResultList.bind(this);
    this.openGenrePicker = this.openGenrePicker.bind(this);
    this._onRegionChange = this._onRegionChange.bind(this);
    this.openRegionPicker = this.openRegionPicker.bind(this);
    this.getLabelForRegion = this.getLabelForRegion.bind(this);
    this.getLabelForGenre = this.getLabelForGenre.bind(this);
    this.getPickerOverlayDisplay = this.getPickerOverlayDisplay.bind(this);
    this.onSectionChange = this.onSectionChange.bind(this);
    this.renderSoundCloudChart = this.renderSoundCloudChart.bind(this);
    
    this.state = {
      sectionList:[{
        name:'TOP',
        scChartType: SoundCloudApi.chartType.TOP,
        label:'Popular',
        icon: require('../assets/section_top_chart.png'),
        enabled:props.isOnline,
        visible:true,
        offlineAvailable:false
      },
      {
        name:'TRENDING',
        label:'Trending',
        icon: require('../assets/section_trending_up.png'),
        scChartType: SoundCloudApi.chartType.TRENDING,
        enabled:props.isOnline,
        visible:true,
        offlineAvailable:false
      },
      {
        name:'SELECTION',
        label:'Discover',
        icon: require('../assets/section_playlist_discover.png'),
        enabled:props.isOnline,
        visible:true,
        offlineAvailable:false
      },
      {
        name:'LOCAL',
        label:'Library',
        icon: require('../assets/section_local_music.png'),
        enabled:true,
        visible:true,
        offlineAvailable:true
      },
      {
        name:'PLS',
        label:'Explore',
        enabled:props.isOnline,
        visible:false,
        offlineAvailable:false
      }],
      section : props.isOnline ? 'TOP' : 'LOCAL',
      selectedGenre : props.selectedGenre || SoundCloudApi.genre.ALL,
      selectedRegion : props.selectedRegion || SoundCloudApi.region.WORLDWIDE,
      genreOptions : this.getOptionsListByType('genre'),
      regionOptions: this.getOptionsListByType('region'),
      pickerModalType: 'genre',
      trackList : []
    };

    console.log('topList loaded constructor::isOnline',props.isOnline,'section',this.state.section);
  }
  getCurrSectionObj(){
    return this.state.sectionList.filter(s => s.name === this.state.section ).pop();
  }
  componentWillMount(){
    this.scApi = new SoundCloudApi({clientId: this.props.scClientId});
    this.showStreamableOnly = this.props.showStreamableOnly;
    //fetch initial section list only if online
    if(this.props.isOnline){
      this.loadTopSoundCloudTracks().then(this.updateResultList);
    }
  }
  componentWillReceiveProps(newProps){
    console.log('props changed for topList',newProps.networkType);
    if(this.props.isOnline != newProps.isOnline){
      console.log('isOnline changed for topList')
      this.setState((state) => {
        let sectionList = state.sectionList.map(s => {
          if(!s.offlineAvailable) s.enabled = newProps.isOnline;
          return s;
        });
        return {
          sectionList,
          section: newProps.isOnline ? 'TOP' : 'LOCAL'
        };
      });
    }
  }
  componentDidUpdate(prevProps,prevState){
    if(
      this.state.section != prevState.section ||
      this.state.selectedGenre !== prevState.selectedGenre ||
      this.state.selectedRegion !== prevState.selectedRegion
    ){
      if(this.getCurrSectionObj().scChartType){
        this.loadTopSoundCloudTracks().then(this.updateResultList);
      }
      if(this.getCurrSectionObj().name == 'SELECTION'){
        this.loadSoundCloudSections().then(this.updateResultList);
      }
    }
  }
  getOptionsListByType(type){
    if(!['genre','region'].includes(type)) return [];
    return Object.keys(SoundCloudApi[type]).map((key,i) => {
      return {
        label : formatGenreLabel(key),
        value : SoundCloudApi[type][key],
        key : i
      }
    });
  }
  getKeyByValue(obj,value){
    return Object.keys(obj).find((key) => obj[key] == value);
  }
  getLabelForGenre(genreValue){
    return formatGenreLabel(this.getKeyByValue(SoundCloudApi.genre,genreValue));
  }
  getLabelForRegion(regionValue){
    return formatGenreLabel(this.getKeyByValue(SoundCloudApi.region,regionValue));
  }
  _onGenreChange(genre){
    this.setState({selectedGenre:genre});
  }
  _onRegionChange(region){
    this.setState({selectedRegion:region});
  }
  _invalidatePrevRequest(){
    if(this.prevQueryCancelToken){
      this.prevQueryCancelToken.cancel({aborted:true});
    }
  }
  generateRequestInvalidationToken(){
    this.prevQueryCancelToken = axios.CancelToken.source();
    return this.prevQueryCancelToken;
  }
  loadTopSoundCloudTracks(){
    this._invalidatePrevRequest();
    this.props.onLoadingStateChange(true);
    let requestPromise = this.scApi.getPopularByGenre(
      this.getCurrSectionObj().scChartType,
      this.state.selectedGenre,
      this.state.selectedRegion,
      { cancelToken : this.generateRequestInvalidationToken().token});
    requestPromise.catch((err) => {
      this.props.onRequestFail(err,this.state.selectedGenre);
      return Promise.resolve(err);
    }).then(
      (val) => {
        if(axios.isCancel(val)){
          return false;
        }
        this.props.onLoadingStateChange(false);
      }
    );
    return requestPromise;
  }
  loadSoundCloudSections(){
    this._invalidatePrevRequest();
    this.props.onLoadingStateChange(true);
    let requestPromise = this.scApi.getSoundcloudSelections({
      cancelToken : this.generateRequestInvalidationToken().token
    });
    requestPromise.catch((err) => {
      this.props.onRequestFail(err,this.state.selectedGenre);
      return Promise.resolve(err);
    }).then((val) => {
      if(axios.isCancel(val))return false;
      this.props.onLoadingStateChange(false);
    });
    return requestPromise;
  }
  updateResultList(resp){
    // in case of empty results or no search terms
    if(!resp){
      return this.setState({ trackList : [] });
    }
    this.setState({ trackList : resp });
  }
  onClosePicker(){
    LayoutAnimation.configureNext(animationPresets.overlaySlideInOut);
    this.setState({pickerModalOpen:false});
  }
  openGenrePicker(){
    LayoutAnimation.configureNext(animationPresets.overlaySlideInOut);
    this.setState({pickerModalOpen:true,pickerModalType:'genre'});
  }
  openRegionPicker(){
    LayoutAnimation.configureNext(animationPresets.overlaySlideInOut);
    this.setState({pickerModalOpen:true,pickerModalType:'region'});
  }
  onSectionChange(sectionName){
    this.setState({
      section:sectionName
    });
  }
  getPickerOverlayDisplay(type){
    return this.state.pickerModalOpen && this.state.pickerModalType == type
      ? styles.openModalStyle: styles.closedModalStyle;
  }
  renderSoundCloudChart(){
    const renderSelectionGenre = this.getCurrSectionObj().scChartType;
    return <View style={[renderSelectionGenre ? {flex:1} : {flex:0,height:0}]}>
      <SectionTabBar  
        style={styles.sectionContainer}
        active={this.state.selectedGenre} 
        onSelected={this._onGenreChange}>
        {
          this.state.genreOptions.map( ({label,value,key}) => 
            <SectionItem key={key} label={label} name={value} style={[styles.genreItemContainer]} textStyle={[styles.genreItemText]} />
          )
        }
      </SectionTabBar>
      {this.getCurrSectionObj().scChartType && 
        <TrackListContainer {...this.props}
        trackList={this.state.trackList}
        side={this.props.side}
        resetToTop={true}
        />}
    </View>
  }
  render() {
    return (
      <View style={styles.container}>
        <SectionTabBar disableScroll 
         style={styles.sectionContainer}
         active={this.state.section} 
         onSelected={this.onSectionChange}>
          {
            this.state.sectionList
            .filter(s => s.visible && s.enabled)
            .map(({name,label,enabled,icon},key,arr) => {
              let itemStyle = arr.length > 1 ?
              styles.sectionItemContainer: styles.sectionSingleItem;
              return <SectionItem key={key} name={name} label={label} style={itemStyle}>{
              isActive => {
                let activeStyle = isActive ? styles.activeSectionIcon : null;
                return <Image source={icon} resizeMode={'contain'} style={[styles.sectionIcon,activeStyle]} />
              }
              }</SectionItem>
            })
          }
        </SectionTabBar>
          {this.renderSoundCloudChart()}
          {this.getCurrSectionObj().name == 'PLS' && <DiscoverProviderContainer {...this.props}/>}
          {this.getCurrSectionObj().name == 'LOCAL' && <OfflineTracksContainer {...this.props}/>}
          {this.getCurrSectionObj().name == 'SELECTION' && <SelectionExpolorer 
            {...this.props} selectionList={this.state.trackList}
            />}
          <ModalPicker
            overlayStyle={this.getPickerOverlayDisplay('genre')}
            options={this.state.genreOptions}
            selected={this.state.selectedGenre}
            onClose={this.onClosePicker}
            onValueChange={this._onGenreChange}/>
      </View>
    );
  }

}
TopList.defaultProps = {
  onRequestFail(){}
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.contentBgColor
  },
  descContainer :{
    flex: 1,
    flexDirection:'row',
    alignItems:'flex-start'
  },
  genreSelectionBtn :{
    flex:1,
    paddingRight: 10,
    paddingVertical:10,
  },
  genreSelectionText : {
    color : THEME.mainActiveColor,
    fontSize : 18,
    textAlign: 'right',
    fontWeight:'600',
    flex:1
  },
  genreItemContainer: {
    padding:10,
    marginRight:10,
    borderRadius:5,
    backgroundColor:THEME.mainBgColor,
    borderWidth:1,
    borderColor: THEME.contentBorderColor,
  },
  genreItemText:{
    paddingRight:0,
    fontSize:15
  },
  listDescription : {
    backgroundColor: THEME.mainBgColor,
    paddingLeft:10,
    paddingVertical:10,
    borderBottomWidth:1,
    borderColor: THEME.contentBorderColor,
    justifyContent:'space-between',
    flexDirection:'row'
  },
  listDetailText :{
    fontSize : 18,
    color: THEME.mainHighlightColor
  },
  sectionContainer:{
    paddingLeft:0,
    alignItems:'flex-start',
    paddingVertical:10
  },
  sectionItemContainer:{
    flex:1,
    alignItems:'center'
  },
  sectionSingleItem:{
    width:80,
    alignItems:'center'
  },
  sectionIcon:{
    width:35,
    height:35,
    opacity:0.5
  },
  activeSectionIcon:{
    opacity:1
  },
  openModalStyle : {
    height: 250
  },
  closedModalStyle :{
    height:0
  }
});

TopList.propTypes = {
  onChartLoadingError :PropTypes.func,
  onClose: PropTypes.func
};

export default TopList;
