import React, { PureComponent } from 'react';
import { Alert, Share, Vibration, Text, TouchableOpacity, NativeModules, Platform, View, PermissionsAndroid } from 'react-native';
import { RNCamera } from 'react-native-camera';
import AsyncStorage from '@react-native-community/async-storage';
import vCard from 'vcf';
import Colors from '../utils/Colors'
import { Header } from '../component';
import { V_CARD_DATA } from '../utils/Constants';

export default class Scanner extends PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            isFlashOn: false
        }
        this.isBarcodeScan = true;
        this._isMounted = true;
    }

    _setState = (value, cb) => {
        if (!this._isMounted) return;

        if (cb) this.setState(value, cb);
        else this.setState(value);
    }

    componentWillUnmount = () => {
        this._isMounted = false;
    }

    componentDidMount = () => {

        //Close android splash screen
        this.closeSplashScreen();
        // this.checkCameraPermssisons();
    }

    toggleFlash = () => {
        this._setState(prevState => {
            return ({
                isFlashOn: prevState.isFlashOn ? false : true
            })
        });
    }

    closeSplashScreen() {
        if (Platform.OS === "android") {
            NativeModules.AndroidCommon.closeSplashScreen();
        }
    }

    onShare = async () => {
        try {
            const data = await this.getCode();
            const org_v_cards = data ? JSON.parse(data) : [];

            if (!org_v_cards || (org_v_cards && !org_v_cards.length)) {
                Alert.alert("No Data", "No VCard available, Please try again.", [
                    {
                        text: "Okay"
                    }
                ], {
                        cancelable: false
                    });
                return;
            }

            const result = await Share.share({
                message: Array.from(org_v_cards).reverse().map((ele, index) => `\n${index + 1}.) ${ele.data}${index === org_v_cards.length - 1 ? '\n\n' : ''}`).toString()
            });

            if (result.action === Share.sharedAction) {
                //Reset all configs
                this.isBarcodeScan = true;
                // await this.clearData();
            } else if (result.action === Share.dismissedAction) {
                this.isBarcodeScan = true;
            }
        } catch (error) {
            alert(error.message);
            this.isBarcodeScan = true;
        }
    };

    scanBarCode = ({ barcodes }) => {
        if (!barcodes || (barcodes && !barcodes.length)) return;
        if (this.isBarcodeScan === false) return;

        this.isBarcodeScan = false;
        const data = barcodes[0] && barcodes[0].rawData ? barcodes[0].rawData : barcodes[0].dataRaw;

        console.log('data ===> ', data);
        this.getVCardData(data);
        Vibration.vibrate(500);
    }

    getVCardData = async (data) => {
        try {
            var card = new vCard().parse(data.replace(/↵/gi, '\n'))
            var n_card_value = card.get('n')._data.replace(/;/gi, ',');
            var fn_card_value = card.get('fn')._data.replace(/;/gi, ',');
            var email_card_value = card.get('email')._data.replace(/;/gi, ',');

            var card_value = `${n_card_value}, ${fn_card_value}, ${email_card_value}`.split(',').map(ele => ele ? ele : null).filter(ele => ele).toString();
            await this.setQRCode(card_value);

            Alert.alert("Success", "Would you like to share the code.", [
                {
                    onPress: () => {
                        this.isBarcodeScan = true;
                    },
                    text: "Cancel"
                },
                {
                    onPress: async () => {
                        await this.onShare();
                    },
                    text: "Okay"
                }
            ], {
                    cancelable: false
                })
        } catch (error) {
            console.log("card ===> error", error);
            this.isBarcodeScan = true;
        }
    }

    setQRCode = async (data) => {
        if (!data) return;

        const org_v_cards = await this.getCode();
        let v_cards = org_v_cards ? JSON.parse(org_v_cards) : [];

        const index = v_cards.findIndex(ele => ele.data === data);

        if (index > -1) {
            console.log("index ===> ", index);
            v_cards.splice(index, 1);
            v_cards.push({
                data
            });
        } else {
            v_cards.push({
                data
            });
        }
        await AsyncStorage.setItem(V_CARD_DATA, JSON.stringify(v_cards));
    }

    clearData = async () => {
        await AsyncStorage.removeItem(V_CARD_DATA);
    }

    getCode = async () => {
        return await AsyncStorage.getItem(V_CARD_DATA);
    }

    checkCameraPermssisons = async () => {
        try {
            const cameraGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
            if (!cameraGranted) {
                await this.requestPermissions(PermissionsAndroid.PERMISSIONS.CAMERA);
            }

            const audioGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
            if (!audioGranted) {
                await this.requestPermissions(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
            }

        } catch (error) {

        }
    }

    requestPermissions = async (permission) => {
        if (Platform.OS === 'android') {
            const result = await PermissionsAndroid.request(permission)
            return result === PermissionsAndroid.RESULTS.GRANTED || result === true
        }
        return true;
    }

    render() {
        const { container, preview } = this.getStyles();
        const { isFlashOn } = this.state;

        return (
            <View style={container}>
                <Header
                    rightOnPress={this.toggleFlash.bind(this)}
                />
                <RNCamera
                    style={preview}
                    type={RNCamera.Constants.Type.back}
                    flashMode={isFlashOn ? RNCamera.Constants.FlashMode.torch : RNCamera.Constants.FlashMode.off}
                    onGoogleVisionBarcodesDetected={this.scanBarCode.bind(this)}
                >
                    {({ camera, status, recordAudioPermissionStatus }) => {
                        console.log("recordAudioPermissionStatus ===> ", status, recordAudioPermissionStatus);
                        if (status === 'PENDING_AUTHORIZATION') {
                            this.checkCameraPermssisons();
                        }

                        return;
                    }}
                </RNCamera>
            </View>
        );
    }

    getStyles = () => {
        return ({
            container: {
                flex: 1,
                flexDirection: 'column',
                backgroundColor: Colors.white,
            },
            preview: {
                flex: 1,
                justifyContent: 'flex-end',
                alignItems: 'center',
            },
            capture: {
                flex: 1,
                backgroundColor: Colors.theme_color,
                borderRadius: 5,
                padding: 15,
                paddingHorizontal: 20,
                marginVertical: 40,
                alignSelf: 'center',
                alignItems: 'center',
                justifyContent: 'center',
                margin: 20,
            },
            btnContainer: {
                flex: 0, flexDirection: 'row', justifyContent: 'center'
            },
            btnText: {
                fontSize: 14,
                color: Colors.white
            }
        });
    }
}