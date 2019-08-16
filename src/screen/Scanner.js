import React, { PureComponent } from 'react';
import { Alert, Vibration, Text, TouchableOpacity, NativeModules, Platform, View } from 'react-native';
import { RNCamera } from 'react-native-camera';
import AsyncStorage from '@react-native-community/async-storage';
import { Share, Button } from 'react-native';
import vCard from 'vcf';
import Colors from '../utils/Colors'
import { Header } from '../component';
import { V_CARD_DATA } from '../utils/Constants';

export default class Scanner extends PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            isShareEnable: false,
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
            const result = await Share.share({
                message: data
            });

            if (result.action === Share.sharedAction) {
                //Reset all configs
                this.isBarcodeScan = true;
                await this.clearData();
                this._setState({ isShareEnable: false });
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
        const data = barcodes[0].rawData;
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
            this._setState({ isShareEnable: true });

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
        await AsyncStorage.setItem(V_CARD_DATA, data);
    }

    clearData = async () => {
        await AsyncStorage.removeItem(V_CARD_DATA);
    }

    getCode = async () => {
        return await AsyncStorage.getItem(V_CARD_DATA);
    }

    render() {
        const { container, preview, btnContainer, capture, btnText } = this.getStyles();
        const { isShareEnable, isFlashOn } = this.state;

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
                />
                {
                    isShareEnable ?
                        <View style={btnContainer}>
                            <TouchableOpacity style={capture} onPress={this.onShare.bind(this)}>
                                <Text style={btnText}> SHARE </Text>
                            </TouchableOpacity>
                        </View>
                        : null
                }
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