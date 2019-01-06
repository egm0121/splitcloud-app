### SplitCloud App

This is the repo for the iOS SplitCloud app built with ReactNative and a fork of StreamingKit project.

SplitCloud allows you to share your headphones and listen to two different SoundCloud tracks at the same time using the same device.

Each side gets his own player with independent playlist and volume management.

You can also choose to listen to the same song on both headphones by using the mode selection buttons.

Tap on the track title label to search songs and add them to your playlist.


### The App


Get it from the App Store:

<a href="http://bit.ly/splitcloud" target="_blank"><img src="https://linkmaker.itunes.apple.com/assets/shared/badges/en-us/appstore-lrg-25178aeef6eb6b83b96f5f2d004eda3bffbb37122de64afbaef7107b384a4132.svg"></a>


![splitcloud](https://cdn-images-1.medium.com/max/800/1*_MedN7kEkKkLKPjCzNbWzA.png)

### Dev instructions

### install deps and link native packages

```
npm install
```
```
react-native link react-native-audio-streaming
react-native link react-native-device-info
react-native link react-native-fs
react-native link react-native-store-review
```
### manual install pod inside node_modules/react-native-audio-streaming
run 
```
cd ios

rm -rf Pods
rm -rf Podfile.lock
pod install
```
### Remove custom compiler flags

Just doubleclick on the RCTWebSocket project in your navigator and remove the flags under build settings > custom compiler flags


### unload McAffee if port 8081 is in use

cd /Library/LaunchDaemons
sudo launchctl unload com.mcafee.agent.macmn.plist

### add the config constants

copy the structure `./config/config.dist.js` into `./config/config.js` and edit to set api keys and other configuration constants. 

To develop it's node dependecy package egm0121-react-native-audio-streaming use wml tool to watch the cloned project folder, using npm link breaks the packager of react native.

use command:

```
wml add  ./egm0121-react-native-audio-streaming ./react-native-demo/node_modules/react-native-audio-streaming
wml start
```
