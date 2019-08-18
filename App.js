import React, { PureComponent } from 'react';
import { Scanner } from './src/screen';
import { SafeAreaView, StatusBar } from 'react-native'
import Colors from './src/utils/Colors'

export default class App extends PureComponent {

  render() {
    return (
      <SafeAreaView style={{ flexGrow: 1, backgroundColor: Colors.theme_color }}>
        <StatusBar backgroundColor={Colors.theme_color} barStyle={"light-content"}/>
        <Scanner />
      </SafeAreaView>
    );
  }
}
