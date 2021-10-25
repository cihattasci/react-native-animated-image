import React, {createRef, useRef, useState} from 'react';
import { ImageBackground, SafeAreaView, StyleSheet, TouchableOpacity, View, Text, PermissionsAndroid, Image, Dimensions } from 'react-native';
import CameraRoll from "@react-native-community/cameraroll";
import ViewShot, {captureRef} from 'react-native-view-shot';
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {
  PanGestureHandler,
  PinchGestureHandler,
} from 'react-native-gesture-handler';

const bgHeight = 150.0;

export default function App() {
    const viewShot = useRef();
    const scale = new Animated.Value(1)
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const scales = useSharedValue(0);
    const {width, height} = Dimensions.get('screen')
    const SIZE = 100;
    const ratio = width / SIZE;
    const [image, setImage] = useState(null)

    const panGestureEvent = useAnimatedGestureHandler({
      onStart: (event, context) => {
        context.translateX = translateX.value;
        context.translateY = translateY.value;
      },
      onActive: (event, context) => {
        scales.value = event.scale
        if (event.scale == scales.value && event.translationY + context.translateY < bgHeight - SIZE 
            ) {
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
      if (event.nativeEvent.scale > ratio && (event.nativeEvent.state === 5 || event.nativeEvent.state === 4)) {
        scale.setValue(ratio)
      }
    }

    const save = async () => {
      const imageUri = await viewShot.current.capture()
      setImage(imageUri);
      CameraRoll.save(imageUri)
    }

    return (
      <SafeAreaView style={styles.main}>
        <ViewShot
          ref={viewShot}
          captureMode="mount"
          options={{format:'jpg', quality: 1, result: 'data-uri'}}
         >
          <ImageBackground
            source={require('./nature.png')}
            style={{width: '100%', height: 150, justifyContent: 'center', alignItems: 'center'}}>
          <PanGestureHandler 
            maxPointers={1}
            onGestureEvent={panGestureEvent}
            >
            <Animated.View
             style={[styles.animatedArea, newStyle]} >
              <PinchGestureHandler
                onGestureEvent={pinchGestureEvent}
                onHandlerStateChange={pinchStateChange}>
                <Animated.Image
                  source={require('./car.png')}
                  style={{
                    transform: [
                      {scale: scale}
                    ],
                    width: SIZE, 
                    height: SIZE,
                  }}
                />
              </PinchGestureHandler>
            </Animated.View>
          </PanGestureHandler>
          </ImageBackground>
        </ViewShot>
        <TouchableOpacity onPress={save}>
          <View style={{justifyContent: 'center', alignItems: 'center', marginTop: 50}}>
            <Text>Save photo</Text>
          </View>
        </TouchableOpacity>
        <Image
          source={{uri: image}}
          style={{width: '100%', height: 160, marginTop: 200}}
        />
      </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
  animatedArea: {
  }
})
