import React, {Component} from 'react'
import {View,Text,Modal, TouchableOpacity, TextInput,DatePickerIOS, StyleSheet, KeyboardAvoidingView, Image} from 'react-native'
import realm, {editBill} from '../../../../databases/billSchemas.js'
import Icon from 'react-native-vector-icons/Foundation'

import ImagePicker from 'react-native-image-picker'
import ImageView from 'react-native-image-view'

export default class EditModal extends Component{
    constructor(props){
        super(props)
        this.state = {
            isVisible: false,
            id: this.props.bill.id,
            name: this.props.bill.name,
            price: this.props.bill.price,
            payDate: new Date(),
            image: this.props.bill.image,
            imageVisible: false
        }
    }

    setDate(newDate) { //alegerea datei si orei pentru utilizatorii IOS
        this.setState({chosenDate: newDate});
      }

      handleChoosePhoto() { //alegerea pozei pentru codul de bare
        const options = {
          noData: true
        }
        ImagePicker.showImagePicker(options,response => {
          if (response.didCancel) {
            console.log('User cancelled image picker');
          } else if (response.error) {
            console.log('ImagePicker Error: ', response.error);
          } else if (response.customButton) {
            console.log('User tapped custom button: ', response.customButton);
          } else {
            this.setState({image: response})
            console.log('response',response)
          }
        });
      }

    render(){
        const image = [ //imaginea pentru codul de bare
            {
                source: {
                    uri: this.state.image.uri,
                },
                height: this.state.image.originalRotation == 90 || this.state.image.originalRotation == 270 ? this.state.image.width : this.state.image.height,
                width: this.state.image.originalRotation == 0 || this.state.image.originalRotation == 180 ? this.state.image.width : this.state.image.height,
            },
        ];
        return(
            <View style = {{justifyContent: 'center', alignItems: 'center'}}>
                <TouchableOpacity onPress = {() => this.setState({isVisible: true}) /* deschiderea modului de editare al facturii */ }>
                    <Icon
                            name = 'page-edit'
                            size = {35}
                            color = {this.props.color}
                    />
                </TouchableOpacity>
                    <Modal
                        visible = {this.state.isVisible}
                        ref={(editPopupDialog) => { this.popupDialog = editPopupDialog; }}
                        onRequestClose = {() => this.setState({isVisible: false, imageVisible: false})}
                        animated = {'slide'}
                        style = {styles.editModal}
                        transparent = {true}
                    >
                        <KeyboardAvoidingView style = {styles.editModal}>
                            <Text style = {styles.titleText}> Edit bill </Text>
                            <View style = {[styles.editRowView]}>
                                <Text style = {{fontSize: 16, color:'#05295B'}}> Bill's name: </Text>
                                <TextInput
                                    placeholder = "Type a name..."
                                    textAlign = 'center'
                                    textAlignVertical = 'center' 
                                    value = {this.state.name}
                                    onChangeText = {name => this.setState({name})}
                                    maxLength = {15}
                                />
                            </View>
                            <View style = {[styles.editRowView]}>
                                <Text style = {{fontSize: 16, color:'#05295B'}}>Bill's price:</Text>
                                <TextInput
                                    placeholder = "Type a price..."
                                    textAlign = 'center'
                                    textAlignVertical = 'center' 
                                    keyboardType = 'numeric'
                                    value = {String(this.state.price)}
                                    onChangeText = {price => this.setState({price})}
                                    maxLength = {15}
                                />
                            </View>
                            <View style = {[styles.editRowView, {marginVertical: 5}]}>
                                <Text style = {{fontSize: 16, color:'#05295B'}}>Pay date: {`${this.state.payDateDay}/${this.state.payDateMonth}/${this.state.payDateYear}  ${this.state.payDateHour}:${this.state.payDateMinute <= 9 ? String('0' + this.state.payDateMinute) : this.state.payDateMinute}`}</Text>
                                <TouchableOpacity onPress = {this.setDate()}>
                                    <Text style = {{color: '#0489B1', fontSize: 16}}>Change pay date</Text>
                                </TouchableOpacity>
                            </View>
                            <View style = {{justifyContent: 'space-around', alignItems: 'center', flexDirection: 'row'}}>
                                <Text style = {{fontSize: 16, color:'#05295B'}}>Bill's image:</Text>
                                <TouchableOpacity
                                    onPress = {() => this.setState({imageVisible: true})}
                                >
                                    <Image 
                                        style = {{width: 33, height: 33, borderRadius: 25}}
                                        source = {{uri: this.state.image.uri}}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress = {() => this.handleChoosePhoto()}
                                >
                                    <Text style = {{color: '#0489B1', fontSize: 16}}>Modify</Text>
                                </TouchableOpacity>
                            </View>
                            <View style = {{alignItems: 'center', justifyContent: 'space-around', flexDirection: 'row',top: '8%'}}>
                            <TouchableOpacity onPress = {() => {
                                if(this.state.name == '' ){ // se verifica numele
                                    alert('Please enter valid name')
                                }else if(isNaN(this.state.price == true)){ // se verifica pretul (sa fie un numar)
                                    alert('Do not forget to enter a valid price')
                                }else if(this.state.price <= 0){ // se verifica pretul(sa fie pozitiv)
                                    alert('Do not forget to enter a price higher than 0')
                                }else if(this.state.payDateDay == ''){  // se verifica ziua de plata
                                    alert('Please modify the bill with a pay day')
                                }else if(this.state.image.uri == ''){ // se verifica imaginea codului de bare
                                    alert("Please enter a photo for the bill's bar code ")
                                }else {
                                    //se editeaza in baza de date si se inchide modul de editare 
                                    this.setState({isVisible: false, imageVisible: false})
                                    const editbill = {
                                        id: this.state.id,
                                        name: this.state.name,
                                        price: parseInt(this.state.price),
                                        payDate: new Date(this.state.payDateYear, this.state.payDateMonth, this.state.payDateDay, this.state.payDateHour, this.state.payDateMinute, 0, 0),
                                        image: {uri: this.state.image.uri, height: this.state.image.height, width: this.state.image.width, originalRotation: this.state.image.originalRotation}
                                    }
                                    editBill(editbill).then().catch(error => alert(`Could not edit the bill: ${error}`))
                                }
                            }}>
                                <Text style = {styles.buttonText}>Save</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress = {() => this.setState({isVisible: false}) /* se inchide modul de editare */}
                            >
                                <Text style = {styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                        </KeyboardAvoidingView>
                </Modal>
                <ImageView
                    images={image}
                    imageIndex={0}
                    isVisible={this.state.imageVisible}
                    isPinchZoomEnabled={false}
                    isTapZoomEnabled= {false}
                    isSwipeCloseEnabled = {false}
                    onClose = {() => this.setState({imageModal: false})}
                />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    editModal: {
        height: 330,
        width: 280,
        backgroundColor: 'white',
        alignSelf: 'center',
        borderRadius: 15,
        backgroundColor: '#D4E6FF',
        borderColor: '#05295B',
        borderWidth: 1.5,
        top: '25%',
        bottom: '25%',
    },
    editRowView: {
        flexDirection: 'row' ,
        justifyContent: 'space-around', 
        alignItems: 'center',
    },
    button: {
        color: 'white',
        fontSize: 15
    },
    titleText: {
        fontSize: 30,
        marginBottom: 15,
        alignSelf: 'center',
        color: '#05295B'
    },
    buttonText: {
        fontSize: 20,
        color: '#0489B1'
    }
})