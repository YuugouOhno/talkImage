import React, { useCallback, useRef, useState } from "react";
import { Image, Text, View, TouchableOpacity, Share, Platform, Alert } from 'react-native';
import ViewShot, { captureRef } from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";
import Icon from "react-native-vector-icons/Octicons";

const os = Platform.OS;

const ShareImage = (props) => {
    // 共有する画像のurlを格納
    const [shareImage, setShareImage] = useState(null);

    // 生成された画像urlを取得
    const imageUrl = props.imageUrl;
    console.log(imageUrl);

    const viewShot = useRef(null);

    // 画像保存の権限許可
    const permissionAlert = () => {
        Alert.alert(
            "画像の保存が許可されませんでした。",
            "設定から画像の保存を許可してください"
        );
    }

    // 画像をデバイスに保存
    const saveImageFromView = async () => {
        try {
            const uri = await captureRef(viewShot);
            await MediaLibrary.saveToLibraryAsync(uri);
            console.log(uri);
            setShareImage(uri);
            Alert.alert("画像保存完了");
        }catch (e) {
            console.log(e);
            permissionAlert();
        }
    }

    //　共有
    const imageShare = async () => {
        if(!shareImage){
            Alert.alert("画像を保存してください");
        }
        else{
            try {
                console.log(shareImage);
                const options = {
                    url: shareImage,
                };
                await Share.share(options);
            } catch (error) {
              console.log('Error sharing:', error);
            }
        }
    };

    // OS分岐
    const capture = useCallback(async () => {
        if(os === 'ios') {
            await saveImageFromView();
        }
        if (os === 'android') {
            const permission = await MediaLibrary.getPermissionsAsync();
            if (permission.canAskAgain && permission.status !== "granted") {
              const permissionResponse = await MediaLibrary.requestPermissionsAsync();
              if (permissionResponse.status !== "granted") {
                permissionAlert();
              } else {
                await saveImageFromView();
              }
            } else if (permission.status !== "granted") {
              permissionAlert();
            } else {
              await saveImageFromView();
            }
        }
      }, []);
    
    
    return (
            <View>
                <ViewShot ref={viewShot}>
                    <Image style={{ width: '100%', height: 0, paddingBottom: '100%', alignSelf: "center"}} source={{ uri: imageUrl }} />
                </ViewShot>
                <View style={{ flex: 1, flexDirection: "row", alignSelf: "center"}}>
                    <TouchableOpacity onPress={capture} style={{ marginHorizontal:20, marginTop:20}}>
                    <Icon name="download" size={25}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={imageShare} style={{ marginHorizontal:20, marginTop:20}}>
                        <Icon name="share" size={25}/>
                    </TouchableOpacity>
                </View>
            </View>
    )
}


export { ShareImage };