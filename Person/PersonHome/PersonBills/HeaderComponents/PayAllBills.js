import React, {Component} from 'react'
import {TouchableOpacity, Image, StyleSheet} from 'react-native'

import {paidAllBills} from '../../../../databases/billSchemas'

export default class PayAllBills extends Component{
    render(){
        return(
            <TouchableOpacity
                style = {{paddingRight: 10}}    
                onPress = {() => paidAllBills().then().catch(error => alert(`Can not pay all your bills: ${error}`))} //platirea tuturor facturilor
            >
                <Image 
                    source = {require('../images/pay-all-icon.png')}
                    style = {styles.payImage }
                />
            </TouchableOpacity>
        )
    }
}

const styles = StyleSheet.create({
    payImage: {
        height: 40,
        width: 40,
        tintColor: '#0489B1'
    }
})