/**
 * @flow
 */

import React, { PropTypes, Component } from 'react';
import {
  StyleSheet,
  Image,
  View
} from 'react-native';
import axios from 'axios';
import SoundCloudApi from '../modules/SoundcloudApi';
import SplitCloudApi from '../modules/SplitcloudApi';
import AnalyticsService from '../modules/Analytics';
import THEME from '../styles/variables';
import SectionTabBar from '../components/sectionTabBar';
import SectionItem from '../components/sectionItem';
import TrackListContainer from '../containers/trackListContainer';
import DiscoverProviderContainer from '../containers/discoverProviderContainer';
import RelatedTrackPreviewContainer from '../containers/relatedTrackPreviewContainer';
import OfflineTracksContainer from '../containers/offlineTracksContainer';
import SelectionExpolorer from './selectionExplorer';
import {formatGenreLabel} from '../helpers/formatters';

class TopList extends Component {

  constructor(props){
    super(props);
    this._onGenreChange = this._onGenreChange.bind(this);
    this.updateResultList = this.updateResultList.bind(this);
    this.getLabelForGenre = this.getLabelForGenre.bind(this);
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
        enabled: props.isOnline,
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
      selectedGenre : props.selectedGenre || 'splitcloud:charts',
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
    const { scClientId } = this.props;
    const opts = {clientId: scClientId};
    this.scApi = new SoundCloudApi(opts);
    this.splitcloudApi = new SplitCloudApi(opts);
    this.showStreamableOnly = this.props.showStreamableOnly;
    //fetch initial section list only if online
    if(this.props.isOnline){
      this.loadTopSoundCloudTracks().then(this.updateResultList);
    }
    this.trackActiveSubScreen();
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
    const { section, selectedGenre, selectedRegion } = this.state;
    if(
      section != prevState.section ||
      selectedGenre !== prevState.selectedGenre ||
      selectedRegion !== prevState.selectedRegion
    ){
      this.trackActiveSubScreen();
      if(this.getCurrSectionObj().scChartType){
        this.loadTopSoundCloudTracks().then(this.updateResultList);
      }
      if(this.getCurrSectionObj().name == 'SELECTION'){
        this.loadDiscoverySection().then(this.updateResultList);
      }
    }
  }
  trackActiveSubScreen(){
    const { section, selectedGenre } = this.state;
    const subSection = this.getCurrSectionObj().scChartType ? selectedGenre : null;
    AnalyticsService.sendNestedScreenView([section, subSection].join(' - '))
  }
  getOptionsListByType(type){
    if(!['genre','region'].includes(type)) return [];
    let optionsList = Object.keys(SoundCloudApi[type]).map((key,i) => {
      return {
        label : formatGenreLabel(key),
        value : SoundCloudApi[type][key],
      }
    });

    if(type == 'genre'){
      optionsList.splice(1,0,{
        label : 'On SplitCloud',
        value : 'splitcloud:charts',
      });
    }
    return optionsList.map((el,i) =>({...el,key:i}));
  }
  getKeyByValue(obj,value){
    return Object.keys(obj).find((key) => obj[key] == value);
  }
  getLabelForGenre(genreValue){
    return formatGenreLabel(this.getKeyByValue(SoundCloudApi.genre,genreValue));
  }
  _onGenreChange(genre){
    this.setState({selectedGenre:genre});
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
    let requestPromise ;
    let currChartType = this.getCurrSectionObj().scChartType;
    if (this.state.selectedGenre === 'splitcloud:charts') {
      const apiMap = {
        [SoundCloudApi.chartType.TOP] : 'getWeeklyPopular',
        [SoundCloudApi.chartType.TRENDING] : 'getWeeklyTrending'
      };
      const chartName =apiMap[currChartType]
      requestPromise = this.splitcloudApi[chartName](
        {cancelToken : this.generateRequestInvalidationToken().token});
    } else {
      requestPromise = this.scApi.getPopularByGenre(
        currChartType,
        this.state.selectedGenre,
        this.state.selectedRegion,
        { cancelToken : this.generateRequestInvalidationToken().token});
    }
  
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
  loadDiscoverySection(){
    this._invalidatePrevRequest();
    this.props.onLoadingStateChange(true);
    let requestPromise = this.splitcloudApi.getDiscoveryPlaylists({
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
  onSectionChange(sectionName){
    this.setState({
      section:sectionName
    });
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
            <SectionItem key={key} label={label} name={value} style={[styles.genreItemContainer]} activeStyle={styles.activeGenreContainer} textStyle={[styles.genreItemText]} />
          )
        }
      </SectionTabBar>
      {!!this.getCurrSectionObj().scChartType && 
        <TrackListContainer {...this.props}
        trackList={this.state.trackList}
        side={this.props.side}
        resetToTop={true}
        />}
      <RelatedTrackPreviewContainer 
          navigator={this.props.navigator}
          side={this.props.side}
        />
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
    borderWidth:0.5,
    borderColor: THEME.contentBorderColor,
  },
  activeGenreContainer:{
    backgroundColor: THEME.contentBorderColor,
    borderColor: THEME.mainHighlightColor
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
