import React, {Component} from 'react'
import {TouchableOpacity,Image, StyleSheet, Alert} from 'react-native'
import {deleteAllBills} from '../../../../databases/billSchemas'
var PushNotification = require('react-native-push-notification');

export default class DeleteAllBills extends Component{
    render(){
        return(
                <TouchableOpacity
                    onPress = {() => {
                        deleteAllBills().then().catch(error => alert(`Deleting all bills failed: ${error}`))
                        PushNotification.cancelAllLocalNotifications()
                    }} //stergerea tuturor facturilor
                    style = {{marginRight: '3%'}}
                >
                    <Image source = {require('../images/delete-all-icon.png')} style = {styles.deleteImage } />
                </TouchableOpacity>
        )
    }
}

const styles = StyleSheet.create({
    deleteImage: {
        height: 40,
        width: 40,
        tintColor: '#0489B1'
    }
})