import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { View, Image, TouchableOpacity } from 'react-native'
import Colors from '../utils/Colors';
import { Share, Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { V_CARD_DATA } from '../utils/Constants';

export default class Header extends PureComponent {
    static propTypes = {
        rightOnPress: PropTypes.func
    }

    static defaultProps = {
        rightOnPress: () => { }
    }

    constructor(props) {
        super(props);

        this.state = {
            isFlash: false
        }

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

    toggleFlash = () => {
        const { rightOnPress } = this.props;

        rightOnPress && rightOnPress();
        this._setState(prevState => {
            return ({
                isFlash: prevState.isFlash ? false : true
            })
        });
    }

    onShare = async () => {
        try {
            const data = await this.getCode();
            const org_v_cards = data ? JSON.parse(data) : [];

            if (!org_v_cards || (org_v_cards && !org_v_cards.length)) {
                Alert.alert("No Data", "No VCard available.", [
                    {
                        text: "Okay"
                    }
                ], {
                        cancelable: false
                    });
                return;
            }

            await Share.share({
                message: Array.from(org_v_cards).reverse().map((ele, index) => `\n${index+1}.) ${ele.data}${index === org_v_cards.length-1 ? '\n\n' : ''}`).toString() 
            });

        } catch (error) {
            alert(error.message);
        }
    }

    getCode = async () => {
        return await AsyncStorage.getItem(V_CARD_DATA);
    }

    render() {
        const { container, logoStyle, iconStyle, rightBtnStyle, leftBtnStyle } = this.getStyle();
        const logo = require("../../assets/attendize.png");
        const flash_on = require('../../assets/flash_on.png');
        const flash_off = require('../../assets/flash_off.png');
        const share = require('../../assets/share.png');
        const { isFlash } = this.state;

        return (
            <View style={[container]}> 
                <TouchableOpacity style={leftBtnStyle} onPress={this.toggleFlash.bind(this)}>
                    <Image source={isFlash ? flash_on : flash_off} resizeMode={"contain"} style={iconStyle} />
                </TouchableOpacity> 
                <Image source={logo} resizeMode={"contain"} style={logoStyle} />
                <TouchableOpacity style={rightBtnStyle} onPress={this.onShare.bind(this)}>
                    <Image source={share} resizeMode={"contain"} style={iconStyle} />
                </TouchableOpacity>
            </View>
        )
    }

    getStyle = () => {

        return ({
            container: {
                alignItems: 'center',
                justifyContent: 'center',
                height: 56,
                backgroundColor: Colors.theme_color
            },
            logoStyle: {
                width: 100,
                height: 56
            },
            iconStyle: {
                width: 25,
                height: 25,
                tintColor: Colors.white
            },
            rightBtnStyle: {
                position: 'absolute',
                right: 10,
                padding: 10
            },
            leftBtnStyle: {
                position: 'absolute',
                left: 10,
                padding: 10
            }
        });
    }
}
