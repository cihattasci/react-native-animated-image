import React, {useRef, useState} from 'react';
import { ImageBackground, SafeAreaView, StyleSheet, TouchableOpacity, View, Text, PermissionsAndroid, Image, Dimensions, Platform } from 'react-native';
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
  RotationGestureHandler
} from 'react-native-gesture-handler';

const bgHeight = 150.0;

export default function App() {
    const viewShot = useRef();
    const rotationRef = useRef();
    const pinchRef = useRef();
    const scale = new Animated.Value(1)
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const scales = useSharedValue(0);
    const _rotate = new Animated.Value(0);
    const _rotateStr = _rotate.interpolate({
        inputRange: [-100, 100],
        outputRange: ['-100rad', '100rad'],
    });
    let _lastRotate = 0;
    const _onRotateGestureEvent = Animated.event(
        [{nativeEvent: {rotation: _rotate}}],
        {useNativeDriver: true}
    );
    const {width, height} = Dimensions.get('screen')
    const SIZE = 100;
    const ratio = width / SIZE;
    //const [image, setImage] = useState(null)

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

    const permission = async () => {
      if (Platform.OS === 'android') {
        let result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Permission Explanation',
            message: 'ReactNativeForYou would like to access your photos!',
          },
        );
        if (result !== 'granted') {
          console.log('Access to pictures was denied');
          return;
        }
      }
    }

    const save = async () => {
      const imageUri = await viewShot.current.capture()
      //setImage(imageUri)
      await permission()
      try {
        CameraRoll.save(imageUri)
      } catch (error) {
        console.warn("save",error)
      }
    }

    const _onRotateHandlerStateChange = event => {
      if (event.nativeEvent.state === 5) {
          _lastRotate += event.nativeEvent.rotation;
          //_rotate.setValue(_lastRotate);
          //_rotate.setValue(0);
      }
    };

    return (
      <SafeAreaView style={styles.main}>
        <ViewShot
          ref={viewShot}
          captureMode="mount"
          options={{format:'jpg', quality: 1, result: Platform.OS === 'ios' ? 'data-uri' : 'tmpfile'}}
         >
          <ImageBackground
            source={require('./nature.png')}
            style={{width: '100%', height: 150, justifyContent: 'center', alignItems: 'center'}}>
            <PanGestureHandler 
              maxPointers={1}
              onGestureEvent={panGestureEvent}
              simultaneousHandlers={[rotationRef, pinchRef]}
              >
              <Animated.View
              style={[newStyle, {flex: 1,}]} >
              <RotationGestureHandler
                ref={rotationRef}
                minPointers={2}
                //simultaneousHandlers={pinchRef}
                onGestureEvent={_onRotateGestureEvent}
                onHandlerStateChange={_onRotateHandlerStateChange}>
                  <Animated.View style={[
                    {flex: 1},
                    {transform: [{rotate: _rotateStr}]}]}>
                    <PinchGestureHandler
                      ref={pinchRef}
                      minPointers={2}
                      //simultaneousHandlers={rotationRef}
                      onGestureEvent={pinchGestureEvent}
                      onHandlerStateChange={pinchStateChange}>
                      <Animated.Image
                        source={require('./car.png')}
                        style={{
                          transform: [
                            {scale: scale},
                            {rotate: _rotateStr}
                          ],
                          width: SIZE, 
                          height: SIZE,
                        }}
                      />
                    </PinchGestureHandler>
                    </Animated.View>
                </RotationGestureHandler>
              </Animated.View>
            </PanGestureHandler>
          </ImageBackground>
        </ViewShot>
        <TouchableOpacity onPress={save}>
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
  animatedArea: {
  },
})
