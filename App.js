import React, {useRef, useState} from 'react';
import { ImageBackground, SafeAreaView, StyleSheet, TouchableOpacity, View, Text, PermissionsAndroid, Image, Dimensions, Platform } from 'react-native';
import CameraRoll from "@react-native-community/cameraroll";
import ViewShot, {captureRef} from 'react-native-view-shot';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
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
    const _baseScale = new Animated.Value(1);
    const _pinchScale = new Animated.Value(1);
    const _scale = Animated.multiply(_baseScale, _pinchScale);
    let _lastScale = 1;
    let _lastRotate = 0;
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const scales = useSharedValue(0);
    let SIZE = 100
    const _rotate = new Animated.Value(0);
    const _rotateStr = _rotate.interpolate({
        inputRange: [-100, 100],
        outputRange: ['-100rad', '100rad'],
    });
    const _onRotateGestureEvent = Animated.event(
        [{nativeEvent: {rotation: _rotate}}],
        {useNativeDriver: true}
    );
    const {width, height} = Dimensions.get('screen')
    //const SIZE = 100;
    //const ratio = width / SIZE;
    //const [image, setImage] = useState(null)

    const panGestureEvent = useAnimatedGestureHandler({
      onStart: (event, context) => {
        context.translateX = translateX.value;
        context.translateY = translateY.value;
      },
      onActive: (event, context) => {
        scales.value = event.scale
        if (event.scale == scales.value && event.translationY + context.translateY < 50
            ) {
          translateX.value = event.translationX + context.translateX;
          translateY.value = event.translationY + context.translateY;
        }
      },
      onEnd: (event) => {
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

    const _onRotateHandlerStateChange = event => {
      if (event.nativeEvent.oldState === 4) {
        _lastRotate += event.nativeEvent.rotation;
        //_rotate.setOffset(_lastRotate);
        _rotate.setValue(_lastRotate);
      }
    };

    const pinchGestureEvent = Animated.event([
      {nativeEvent: {scale: _pinchScale}}
    ], {useNativeDriver: true})

    const pinchStateChange = (event) => {
      if (event.nativeEvent.oldState === 4) {
        _lastScale *= event.nativeEvent.scale;
        _baseScale.setValue(_lastScale);
        _pinchScale.setValue(1);
      }
    }

    const permission = async () => {
      if (Platform.OS === 'android') {
        let result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Permission Explanation',
            message: 'App would like to access your photos!',
          },
        );
        if (result !== 'granted') {
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
              style={[newStyle, {flex: 1}]} >
              <RotationGestureHandler
                ref={rotationRef}
                minPointers={2}
                simultaneousHandlers={pinchRef}
                onGestureEvent={_onRotateGestureEvent}
                onHandlerStateChange={_onRotateHandlerStateChange}>
                  <Animated.View style={[
                    {flex: 1},
                    {transform: [{rotate: _rotateStr}]}]}>
                    <PinchGestureHandler
                      ref={pinchRef}
                      minPointers={2}
                      simultaneousHandlers={rotationRef}
                      collapsable={false}
                      onGestureEvent={pinchGestureEvent}
                      onHandlerStateChange={pinchStateChange}>
                      <Animated.Image
                        source={require('./car.png')}
                        style={{
                          transform: [
                            {scale: _scale},
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
