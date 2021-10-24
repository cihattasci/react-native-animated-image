import React from 'react';
import { ImageBackground, SafeAreaView, StyleSheet, TouchableOpacity, View, Text, PermissionsAndroid, Image } from 'react-native';
import CameraRoll from "@react-native-community/cameraroll";
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import {
  PanGestureHandler,
  PinchGestureHandler,
} from 'react-native-gesture-handler';

let SIZE = 100.0;

export default function App() {
    const scale = new Animated.Value(1)
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const scales = useSharedValue(0);

    const panGestureEvent = useAnimatedGestureHandler({
      onStart: (event, context) => {
        context.translateX = translateX.value;
        context.translateY = translateY.value;
      },
      onActive: (event, context) => {
        scales.value = event.scale
        if (event.scale == scales.value) {
          translateX.value = event.translationX + context.translateX;
          translateY.value = event.translationY + context.translateY;
        }
      },
      onEnd: () => {
        
      },
    });

  const newStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: translateX.value,
        },
        {
          translateY: translateY.value,
        },
      ],
    };
  });

  const pinchGestureEvent = Animated.event([
    {nativeEvent: {scale: scale}}
  ], {useNativeDriver: true})

  const pinchStateChange = (event) => {
    console.warn(event.nativeEvent)
  }
    return (
      <SafeAreaView style={styles.main}>
        <View>
          <ImageBackground
          source={require('./nature.png')}
          style={{width: '100%', height: 150, justifyContent: 'center', alignItems: 'center'}}>
          <PanGestureHandler maxPointers={1} onGestureEvent={panGestureEvent}>
            <Animated.View style={[styles.animatedArea, newStyle]} >
              <PinchGestureHandler
                onGestureEvent={pinchGestureEvent}
                onHandlerStateChange={pinchStateChange}
              >
                <Animated.Image
                  source={require('./car.png')}
                  style={[styles.image, {
                    transform: [
                      {scale: scale}
                    ]
                  }]}
                />
              </PinchGestureHandler>
            </Animated.View>
          </PanGestureHandler>
          </ImageBackground>
        </View>
        <TouchableOpacity onPress={this.save}>
          <View style={{justifyContent: 'center', alignItems: 'center', marginTop: 50}}>
            <Text>Save photo</Text>
          </View>
        </TouchableOpacity>
      </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
  image: {
    width: SIZE, 
    height: SIZE
  }
})



  /*
  <View>
          <ImageBackground style={{width: '100%', height: '50%', backgroundColor: `${this.state.color}`, justifyContent: 'center', alignItems: 'center'}}>
            <Image
              source={require('./car.png')}
              style={{width: 100, height: 100}}
            />
          </ImageBackground>
        </View>
  <View style={{height: 55, alignItems: 'center', width: '100%'}}>
          <FlatList
            data={this.colors}
            renderItem={({item}) => this.renderColors(item)}
            horizontal
          />
        </View>*/

        /*
        constructor(props) {
    super(props);
    this.state = {
      color: 'red'
    };
    //this.colors = ['yellow', 'blue', 'red', 'green'];
  }
  
  hasAndroidPermission = async () => {
    const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
  
    const hasPermission = await PermissionsAndroid.check(permission);
    if (hasPermission) {
      return true;
    }
  
    const status = await PermissionsAndroid.request(permission);
    return status === 'granted';
  }

  save = async () => {
    if (Platform.OS === "android" && !(await hasAndroidPermission())) {
      return;
    }
  
    CameraRoll.save('./nature.png')
  }

  renderColors = color => {
    return(
      <TouchableOpacity onPress={() => this.setState({ color })}>
        <View
          style={{backgroundColor: color, width: 50, height: 50, borderRadius: 5}}
        />
      </TouchableOpacity>
    )
  }*/