/**
 * @flow
 */

import React, { PropTypes, Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  TextInput,
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
import {formatDuration, formatGenreLabel} from '../helpers/formatters';

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
    this.sections = [{
      name:'TOP',
      scChartType: SoundCloudApi.chartType.TOP,
      label:'Top Tracks',
      enabled:true
    },
    {
      name:'TRENDING',
      label:'New & Hot',
      scChartType: SoundCloudApi.chartType.TRENDING,
      enabled:true
    },
    {
      name:'PLS',
      label:'PointLineShape Mix',
      enabled:false
    }];
    this.state = {
      section : this.sections[0].name,
      selectedGenre : this.props.selectedGenre || SoundCloudApi.genre.ALL,
      selectedRegion : this.props.selectedRegion || SoundCloudApi.region.WORLDWIDE,
      genreOptions : this.getOptionsListByType('genre'),
      regionOptions: this.getOptionsListByType('region'),
      pickerModalType: 'genre',
      trackList : []
    };

    console.log('genreOptions',this.getOptionsListByType('genre'))
  }
  getCurrSectionObj(){
    return this.sections.filter(s => s.name === this.state.section ).pop();
  }
  componentWillMount(){
    this.scApi = new SoundCloudApi({clientId: this.props.scClientId});
    this.showStreamableOnly = this.props.showStreamableOnly;
    //fetch inial genre list
    this.loadTopSoundCloudTracks().then(this.updateResultList);
  }
  componentDidUpdate(prevProps,prevState){
    if(
      this.state.section != prevState.section ||
      this.state.selectedGenre !== prevState.selectedGenre ||
      this.state.selectedRegion !== prevState.selectedRegion
    ){
      this.loadTopSoundCloudTracks().then(this.updateResultList,(err) => {
        console.log('ignore as old genre request',err)
      });
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
  render() {
    return (
      <View style={styles.container}>
        <SectionTabBar active={this.state.section} onSelected={this.onSectionChange}>
          {
            this.sections
            .filter(e => e.enabled)
            .map(({name,label},key) => <SectionItem key={key} name={name} label={label}/>)
          }
        </SectionTabBar>
        {this.getCurrSectionObj().scChartType ?
          <View style={{flex:1}}>
            <View style={styles.listDescription}>
              <View style={styles.genreSelectionBtn}>
                <TouchableHighlight onPress={this.openRegionPicker}>
                  <View>
                    <Text style={styles.listDetailText} >Region</Text>
                    <Text style={styles.genreSelectionText}>{this.getLabelForRegion(this.state.selectedRegion)}</Text>
                  </View>
                </TouchableHighlight>
              </View>
              <View style={styles.genreSelectionBtn}>
                  <TouchableHighlight onPress={this.openGenrePicker}>
                    <View>
                      <Text style={styles.listDetailText}>Genre</Text>
                      <Text style={styles.genreSelectionText}>{this.getLabelForGenre(this.state.selectedGenre)}</Text>
                    </View>
                  </TouchableHighlight>
              </View>
            </View>
            <TrackListContainer {...this.props}
              trackList={this.state.trackList}
              side={this.props.side}
              resetToTop={true}
              />
          </View>
          :<DiscoverProviderContainer {...this.props}/>
          }
          <ModalPicker
            overlayStyle={this.getPickerOverlayDisplay('genre')}
            options={this.state.genreOptions}
            selected={this.state.selectedGenre}
            onClose={this.onClosePicker}
            onValueChange={this._onGenreChange}/>
          <ModalPicker
           overlayStyle={this.getPickerOverlayDisplay('region')}
           options={this.state.regionOptions}
           selected={this.state.selectedRegion}
           onClose={this.onClosePicker}
           onValueChange={this._onRegionChange}/>
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
    alignItems:'center'
  },
  genreSelectionText : {
    color : THEME.mainActiveColor,
    fontSize : 16,
    lineHeight:23,
    textAlign: 'center',
    fontWeight:'600'
  },
  listDescription : {
    backgroundColor: THEME.contentBgColor,
    paddingLeft:10,
    borderBottomWidth:1,
    borderColor: THEME.contentBorderColor,
    justifyContent:'space-between',
    flexDirection:'row'
  },
  listDescriptionText :{
    paddingRight:20,
    fontSize : 18,
    paddingVertical:10,
    fontWeight:'600',
    color: THEME.mainHighlightColor
  },
  listDetailText :{
    fontSize : 16,
    textAlign: 'center',
    color: THEME.mainColor
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
