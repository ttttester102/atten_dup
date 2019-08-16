import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { View, Image, TouchableOpacity } from 'react-native'
import Colors from '../utils/Colors';

export default class Header extends PureComponent {
    static propTypes = {
        rightOnPress: PropTypes.func
    }

    static defaultProps = {
        rightOnPress: () => {}
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

    render() {
        const { container, logoStyle, iconStyle, rightBtnStyle } = this.getStyle();
        const logo = require("../../assets/attendize.png");
        const flash_on = require('../../assets/flash_on.png');
        const flash_off = require('../../assets/flash_off.png');
        const { isFlash } = this.state;

        return (
            <View style={[container]}>
                <Image source={logo} resizeMode={"contain"} style={logoStyle} />
                <TouchableOpacity style={rightBtnStyle} onPress={this.toggleFlash.bind(this)}>
                    <Image source={isFlash ? flash_on : flash_off} resizeMode={"contain"} style={iconStyle} />
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
                right: 20,
                padding: 10
            }
        });
    }
}
