### SplitCloud App

This is the repo for the iOS SplitCloud app built with ReactNative and a fork of StreamingKit project.

SplitCloud allows you to share your headphones and listen to two different SoundCloud tracks at the same time using the same device.

Each side gets his own player with independent playlist and volume management.

You can also choose to listen to the same song on both headphones by using the mode selection buttons.

Tap on the track title label to search songs and add them to your playlist.

### The App

![splitcloud](https://cdn-images-1.medium.com/max/800/1*_MedN7kEkKkLKPjCzNbWzA.png)

### Dev instructions

To develop it's node dependecy package egm0121-react-native-audio-streaming use wml tool to watch the cloned project folder, using npm link breaks the packager of react native.

use command:

```
wml add  ./egm0121-react-native-audio-streaming ./react-native-demo/node_modules/react-native-audio-streaming
wml start
```
