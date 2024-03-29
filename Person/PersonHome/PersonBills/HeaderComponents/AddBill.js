import React, {Component} from 'react'
import {View, Image, TextInput, DatePickerAndroid, TouchableOpacity, Button, Modal, StyleSheet,Text, TimePickerAndroid} from 'react-native'
import {addBill} from '../../../../databases/billSchemas'
import Ionicon from 'react-native-vector-icons/Ionicons'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Dialog, { DialogFooter, DialogButton, DialogContent, DialogTitle, SlideAnimation } from 'react-native-popup-dialog';
import { RNCamera } from 'react-native-camera';
var PushNotification = require('react-native-push-notification');

PushNotification.configure({
    onRegister: function(token) {
        console.log( 'TOKEN:', token );
    },
    onNotification: function(notification) {
        console.log( 'NOTIFICATION:', notification );
    },
    popInitialNotification: true,
    requestPermissions: true,
});

export default class AddBill extends Component{
    constructor(props) {
        super(props)
        this.camera = null;
        this.state = {
            name: '',
            price: '',
            payDateYear: ``,
            payDateMonth: ``,
            payDateDay: ``,
            payDateHour: null,
            payDateMinute: null,
            addVisible: false,
            currency: '€',
            width: '',
            height: '',
            barcodeValue: '',
            barcodeFormat: '',
            scanVisible: false,
            camera: {
                type: RNCamera.Constants.Type.back,
                flashMode: RNCamera.Constants.FlashMode.auto,
            }
        }
    }

    setDateAndroid = async () => { //alegerea datei pentru plata facturii
        try {
          const {
            action, year, month, day,
          } = await DatePickerAndroid.open({
                date: new Date(),
                minDate: new Date(),
          });
          if (action !== DatePickerAndroid.dismissedAction) {
            this.setState({
                payDateYear: year,
                payDateMonth: month,
                payDateDay: day
            });
          }
        } catch ({ code, message }) {
          alert('Cannot open date picker', message);
        }
      };

      setTimeAndroid = async () => { //alegerea orei pentru plata facturii
        try {
          const { action, hour, minute } = await TimePickerAndroid.open({
            hour: 18,
            minute: 0,
            is24Hour: true
          });
          if (action !== TimePickerAndroid.dismissedAction) {
            this.setState({ 
                payDateHour: hour,
                payDateMinute: minute
             });
          }
        } catch ({ code, message }) {
          alert('Cannot open time picker', message);
        }
      };


    onBarCodeRead(scanResult) {
        this.setState({barcodeValue: scanResult.data, barcodeFormat: scanResult.type, scanVisible: false})
    }

    render() {
        return(
            <View style = {{justifyContent: 'center', alignItems: 'center', paddingRight: 10}}>
                <TouchableOpacity
                    onPress = {() => this.setState({addVisible: true}) /* deschiderea modului de adaugare a facturii */}
                >
                    <Image 
                        source = {require('../images/add-icon.png')}
                        style = {styles.addButtonImage} 
                    />
                </TouchableOpacity>
                <Dialog
                    visible={this.state.addVisible}
                    dialogAnimation={new SlideAnimation({
                        slideFrom: 'top',
                    })}
                    width = {0.85}
                    rounded
                    onTouchOutside = {() => this.setState({addVisible: false})}
                    dialogStyle = {styles.addDialog}
                    dialogTitle = {<DialogTitle 
                        title = {this.props.language == 'EN' ? 'Add bill' : 'Adaugare factura'} 
                        textStyle = {{color: '#05295B'}}
                        bordered = {false} 
                        style = {{backgroundColor: '#D4E6FF', height: 20}}
                        hasTitleBar = {false}
                         />}
                    footer={
                        <DialogFooter
                            bordered = {false}
                            style = {{height: 25}}
                        >
                          <DialogButton
                            text = {this.props.language == 'EN' ? 'Cancel' : 'Anuleaza'}
                            key = 'cancel'
                            textStyle = {{color: '#0489B1'}}
                            style = {{justifyContent: 'center', alignItems: 'center'}}
                            onPress = {() => {
                                this.setState({
                                    name: '',
                                    price: '',
                                    payDateYear: ``,
                                    payDateMonth: ``,
                                    payDateDay: ``,
                                    payDateHour: null,
                                    payDateMinute: null,
                                    addVisible: false,
                                    currency: '€',
                                    width: '',
                                    height: '',
                                    barcodeValue: '',
                                    barcodeFormat: '',
                                    scanVisible: false
                                })
                            }}
                          />
                          <DialogButton
                            text = {this.props.language == 'EN' ? 'Add' : 'Adauga'}
                            key = 'add'
                            style = {{justifyContent: 'center', alignItems: 'center'}}
                            textStyle = {{color: '#0489B1'}}
                            onPress = {() => {
                                const newBill = {
                                    id: parseInt(Math.floor(Date.now() / 1000)),
                                    name: this.state.name,
                                    price: parseFloat(this.state.price),
                                    payDate: new Date(this.state.payDateYear,this.state.payDateMonth,this.state.payDateDay,this.state.payDateHour,this.state.payDateMinute,0,0),
                                    barcode: {value: this.state.barcodeValue, format: this.state.barcodeFormat}
                                }   
                                    if(newBill.name == ''){ //verificarea numelui pentru factura
                                        alert(this.props.language == 'EN' ? 'Please enter the name for the bill' : 'Adauga numele facturii')
                                    }else if(newBill.price < 0){ //verificarea pretului pentru factura (sa fie un numar valid)
                                        alert(this.props.language == 'EN' ? 'Please enter a positive price' : 'Adauga un pret mai mare decat 0')
                                    }else if(isNaN(newBill.price) == true){ //verificarea pretului pentru factura (sa fie un numar valid)
                                        alert(this.props.language == 'EN' ? 'Please enter a valid price' : 'Adauga un pret valid pentru factura')
                                    }else if(this.state.payDateDay == null){ //verificarea datei pentru factura
                                        alert(this.props.language == 'EN' ? 'Please choose enter deadline' : 'Alege data scadenta')
                                    }else if(this.state.payDateHour == null){ //verificarea orei pentru factura
                                        alert(this.props.language == 'EN' ? 'Please choose a pay time!' : 'Adauga ora de plata')
                                    }else {
                                        //adaugarea facturii in baza de date
                                        const price = this.props.currency === 'Fr' ? newBill.price + '\xa0' + this.props.currency : this.props.currency === 'Lei' ? newBill.price + '\xa0' + this.props.currency : this.props.currency + '\xa0' + newBill.price
                                        const monthNameEng = newBill.payDate.getMonth() + 1 == 1 ? 'January' : 
                                            newBill.payDate.getMonth() + 1 == 2 ? 'February' : 
                                            newBill.payDate.getMonth() + 1 == 3 ? 'March' : 
                                            newBill.payDate.getMonth() + 1 == 4 ? 'April' : 
                                            newBill.payDate.getMonth() + 1 == 5 ? 'May' : 
                                            newBill.payDate.getMonth() + 1 == 6 ? 'June' : 
                                            newBill.payDate.getMonth() + 1 == 7 ? 'July' : 
                                            newBill.payDate.getMonth() + 1 == 8 ? 'August' : 
                                            newBill.payDate.getMonth() + 1 == 9 ? 'September' : 
                                            newBill.payDate.getMonth() + 1 == 10 ? 'October' : 
                                            newBill.payDate.getMonth() + 1 == 11 ? 'November' : 
                                            'December' 
                                        const monthNameRo = newBill.payDate.getMonth() + 1 == 1 ? 'Ianuarie' : 
                                            newBill.payDate.getMonth() + 1 == 2 ? 'Februarie' : 
                                            newBill.payDate.getMonth() + 1 == 3 ? 'Martie' : 
                                            newBill.payDate.getMonth() + 1 == 4 ? 'Aprilie' : 
                                            newBill.payDate.getMonth() + 1 == 5 ? 'Mai' : 
                                            newBill.payDate.getMonth() + 1 == 6 ? 'Iunie' : 
                                            newBill.payDate.getMonth() + 1 == 7 ? 'Iulie' : 
                                            newBill.payDate.getMonth() + 1 == 8 ? 'August' : 
                                            newBill.payDate.getMonth() + 1 == 9 ? 'Septembrie' : 
                                            newBill.payDate.getMonth() + 1 == 10 ? 'Octombrie' : 
                                            newBill.payDate.getMonth() + 1 == 11 ? 'Noiembrie' : 
                                            'December' 
                                        const deadlineDate = `${newBill.payDate.getDate()} ${this.props.language == 'EN' ? monthNameEng : monthNameRo} ${newBill.payDate.getFullYear()}`
                                        addBill(newBill).then().catch(error => {})
                                        var days = 7
                                        for(var i = 7; i > 0; --i){
                                            if(newBill.payDate - new Date() - i * 86400000 > 0){
                                                days = i
                                                break
                                            }
                                        }
                                        PushNotification.localNotificationSchedule({
                                            id: String(newBill.id),
                                            message: this.props.language == 'EN' ? `Your ${newBill.name} bill in amount of ${price} has the deadline on ${deadlineDate}. Don't forget to pay it!` : `Factura ${newBill.name} in valoare de ${price} are data scadenta pe ${deadlineDate}. Nu uita sa o platesti!`,
                                            date: new Date(newBill.payDate - days * 86400000), 
                                            repeatType: 'day',
                                            importance: 'high',
                                            vibrate: false,
                                            group: 'Pay Assistant',
                                          });
                                        this.setState({
                                            name: '',
                                            price: '',
                                            payDateYear: ``,
                                            payDateMonth: ``,
                                            payDateDay: ``,
                                            payDateHour: null,
                                            payDateMinute: null,
                                            addVisible: false,
                                            currency: '€',
                                            width: '',
                                            height: '',
                                            barcodeValue: '',
                                            barcodeFormat: '',
                                            scanVisible: false
                                        })
                                    }
                            }}
                          />
                        </DialogFooter>
                      }
                >
                    <DialogContent>
                        <View style = {[styles.modalView]}>
                            <View style = {styles.addFormView}>
                                <View style = {{alignItems: 'center', justifyContent: 'space-around', flexDirection: 'row'}}>
                                    <Text style = {{fontSize: 14, color:'#05295B', right: '40%'}}>{this.props.language == 'EN' ? "Bill's name:" : 'Numele facturii:'}</Text>
                                    <TextInput
                                        value = {this.state.name} 
                                        placeholder = {this.props.language == 'EN' ? "Type a name..." : 'Introdu un nume...'}
                                        onChangeText = {name => this.setState({name})}
                                        maxLength = {21}
                                        textAlign = 'center'
                                        textAlignVertical = 'center'
                                    />
                                </View>
                                <View style = {{alignItems: 'center', justifyContent: 'space-evenly', flexDirection: 'row'}}>
                                    <Text style = {{fontSize: 14, color:'#05295B', right: '40%'}}>{this.props.language == 'EN' ? "Bill's price:" : 'Pretul facturii:'}</Text>
                                    <TextInput
                                        keyboardType = "numeric"
                                        placeholder = {this.props.language == 'EN' ? "Type a price...": 'Introdu un pret...'}
                                        value = {this.state.price}
                                        onChangeText = {price => this.setState({price})}
                                        maxLength = {15}
                                        textAlign = 'center'
                                        textAlignVertical = 'center'
                                    />
                                    <Text>{this.props.currency}</Text>
                                </View>
                                <View style = {{flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center'}}>
                                    <TouchableOpacity
                                        style = {styles.timeAndDateButton}  
                                        onPress = {this.setDateAndroid}
                                    >
                                        <AntDesign
                                            name = 'calendar' 
                                            size = {35}
                                            color = '#0489B1'
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style = {styles.timeAndDateButton} 
                                        onPress = {this.setTimeAndroid}
                                    >
                                        <Ionicon
                                            name = 'md-clock'
                                            size = {35}
                                            color = '#0489B1'
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style = {styles.timeAndDateButton}
                                        onPress = {() => this.setState({scanVisible: true})}
                                    >
                                        <Ionicon
                                            name = 'md-barcode'
                                            size = {35}
                                            color = '#0489B1'
                                        />
                                    </TouchableOpacity>
                                    <Modal
                                        visible = {this.state.scanVisible}
                                        onRequestClose = {() => this.setState({scanVisible: false})}
                                        animationType = 'slide'
                                    >
                                        <View style={styles.container}>
                                            <RNCamera
                                                ref={ref => {
                                                this.camera = ref;
                                                }}
                                                defaultTouchToFocus
                                                flashMode={this.state.camera.flashMode}
                                                mirrorImage={false}
                                                onBarCodeRead={this.onBarCodeRead.bind(this)}
                                                style={styles.preview}
                                                type={this.state.camera.type}
                                            />
                                            <View style={[styles.overlay, styles.topOverlay]}>
                                                <TouchableOpacity
                                                    onPress = {() => this.setState({scanVisible: false})}
                                                >
                                                    <AntDesign 
                                                        name = 'close'
                                                        size = {25}
                                                        color ='white'
                                                    />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </Modal>
                                </View>
                            </View>
                        </View>
                    </DialogContent>
                </Dialog>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    addDialog: {
        backgroundColor: '#D4E6FF',
        borderColor: '#05295B',
        borderWidth: 1.5,
    },
    addFormView: {
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    cancelButton: {
        justifyContent: 'center',
        marginTop: 3,
    },  
    addButtonImage: {
        height: 40,
        width: 40,
        tintColor: '#0489B1'
    },
    timeAndDateImage: {
        width: 35,
        height: 35,
        tintColor: '#0489B1'
    },
    timeAndDateButton: {
        marginHorizontal: 20
    },
    container: {
        flex: 1
      },
      preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center'
      },
      overlay: {
        position: 'absolute',
        padding: 16,
        right: 0,
        left: 0,
        alignItems: 'center'
      },
      topOverlay: {
        top: 0,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
      },
})


