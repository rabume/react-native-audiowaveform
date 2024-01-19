/**
 * Created by juanjimenez on 07/12/2016.
 * Otomogroove ltd 2017
 */

"use strict";
import {useCallback, useEffect, useState} from "react";
import { Platform, processColor, DeviceEventEmitter, requireNativeComponent } from "react-native";

import resolveAssetSource from "react-native/Libraries/Image/resolveAssetSource";


const OGWaverformView = requireNativeComponent("OGWave", WaveForm);

const _makeid = () => {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 5; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

const WaveForm = (props: WaveObjectPropsType) => {
  const { source, onPress, waveFormStyle, onFinishPlay } = props;
  const [componentID, setComponentID] = useState(_makeid());

  const _onPress = (e) => {
    const event = Platform.OS === "ios" ? e.nativeEvent : e;
    if (event.componentID === componentID && onPress) {
      onPress(event);
    }
  }

  const _onFinishPlay = useCallback(
      (e) => {
        const event = Platform.OS === "ios" ? e.nativeEvent : e;
        if (event.componentID === componentID && onFinishPlay) {
          onFinishPlay(event);
        }
      },
      [componentID, onFinishPlay]
  );

  useEffect(() => {
    DeviceEventEmitter.addListener("OGOnPress", _onPress);
    DeviceEventEmitter.addListener("OGFinishPlay", _onFinishPlay);
  }, []);

  const assetResoved = resolveAssetSource(source) || {};

  let uri = assetResoved.uri;
  if (uri && uri.match(/^\//)) {
    uri = `file://${uri}`;
  }

  const isNetwork = !!(uri && uri.match(/^https?:/));
  const isAsset = !!(uri && uri.match(/^(assets-library|file|content|ms-appx|ms-appdata):/));

  const nativeProps = {
    ...props,
    waveFormStyle: {
      ogWaveColor: processColor(waveFormStyle.waveColor),
      ogScrubColor: processColor(waveFormStyle.scrubColor)
    },

    src: {
      uri,
      isNetwork,
      isAsset,
      type: source.type,
      mainVer: source.mainVer || 0,
      patchVer: source.patchVer || 0
    },
    componentID
  };

  return <OGWaverformView {...nativeProps} onPress={_onPress} onFinishPlay={_onFinishPlay} />
}

export default WaveForm;

