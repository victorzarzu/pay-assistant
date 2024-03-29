import React, {Component} from 'react'
import {View,Text,Modal,TouchableOpacity, TextInput,DatePickerAndroid, StyleSheet, KeyboardAvoidingView, TimePickerAndroid, Image} from 'react-native'
import {editBill} from '../../../../databases/billSchemas.js'
import Dialog, { DialogFooter, DialogButton, DialogContent, DialogTitle, SlideAnimation } from 'react-native-popup-dialog';
import Icon from 'react-native-vector-icons/Foundation'
import Barcode from 'react-native-barcode-builder';
import AntDesign from 'react-native-vector-icons/AntDesign'
import { RNCamera } from 'react-native-camera';
import QRCode from 'react-native-qrcode';
var PushNotification = require('react-native-push-notification');

export default class EditDialog extends Component{
    constructor(props){
        super(props)
        this.camera = null;
        this.state = {
            isVisible: false,
            id: this.props.bill.id,
            name: this.props.bill.name,
            price: this.props.bill.price,
            payDateYear: this.props.bill.payDate.getFullYear(),
            payDateMonth: this.props.bill.payDate.getMonth(),
            payDateDay: this.props.bill.payDate.getDate(),
            payDateHour: this.props.bill.payDate.getHours(),
            payDateMinute: this.props.bill.payDate.getMinutes(),
            barcodeValue: this.props.bill.barcode.value,
            barcodeFormat: this.props.bill.barcode.format.replace(/[^a-zA-Z0-9]/g, ''),
            barcodeVisible: false,
            scanVisible: false,
            camera: {
                type: RNCamera.Constants.Type.back,
                flashMode: RNCamera.Constants.FlashMode.auto,
              }
        }
    }

    setDateAndroid = async () => { //alegerea datei pentru utilizatorii Android
        try {
          const {
            action, year, month, day,
          } = await DatePickerAndroid.open({
                date: new Date(),
                minDate: new Date(),
          });
          if (action !== DatePickerAndroid.dismissedAction) {
            this.setState({ payDateYear: year, payDateMonth: month, payDateDay: day  });
          }
        } catch ({ code, message }) {
          alert('Cannot open date picker', message);
        }
    };

    setTimeAndroid = async () => { //alegerea timpului pentru utilizatorii Android
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
        this.setState({barcodeValue: scanResult.data, barcodeFormat: scanResult.type.replace(/[^a-zA-Z0-9]/g, ''), scanVisible: false})
    }
    
    render(){
        return(
            <View style = {{justifyContent: 'center', alignItems: 'center'}}>
                <TouchableOpacity onPress = {() => this.setState({isVisible: true}) /* deschiderea modului de editare al facturii */}>
                    <Icon
                        name = 'page-edit'
                        size = {35}
                        color = {this.props.color}
                    />
                </TouchableOpacity>
                <Dialog
                    visible={this.state.isVisible}
                    dialogAnimation={new SlideAnimation({
                        slideFrom: 'top',
                    })}
                    width = {this.state.scanVisible ? 0 : 0.85}
                    rounded
                    onTouchOutside = {() => this.setState({isVisible: false})}
                    dialogStyle = {styles.editDialog}
                    dialogTitle = {<DialogTitle 
                        title = {this.props.language == "EN" ? `Edit ${this.props.bill.name} bill` : `Editeaza factura ${this.props.bill.name}`} 
                        textStyle = {{color: '#05295B', fontSize: 14}} 
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
                            text = {this.props.language == 'EN' ? "Cancel" : "Anuleaza"}
                            key = 'cancel'
                            textStyle = {{color: '#0489B1'}}
                            style = {{justifyContent: 'center', alignItems: 'center'}}
                            onPress = {() => this.setState({isVisible: false, barcodeVisible: false}) /* se inchide modul de editare */}
                          />
                          <DialogButton
                            text = {this.props.language == 'EN' ? "Save" : "Salveaza"}
                            key = 'save'
                            style = {{justifyContent: 'center', alignItems: 'center'}}
                            textStyle = {{color: '#0489B1'}}
                            onPress = {() => {
                                if(this.state.name == '' ){ // se verifica numele
                                    this.props.language == 'EN' ? alert('Please enter valid name fort the bill') : alert('Introdu un nume valid pentru factura')
                                }else if(isNaN(this.state.price) == true){ // se verifica pretul (sa fie un numar)
                                    this.props.language == 'EN' ? alert('Do not forget to enter a valid price for the bill') : alert('Introdu un pret valid pentru factura')
                                }else if(this.state.price <= 0){ // se verifica pretul(sa fie pozitiv)
                                    this.props.language == 'EN' ? alert('Do not forget to enter a price higher than 0') : alert('Introdu un pret pozitiv pentru factura')
                                }else if(this.state.payDateDay == ''){ // se verifica ziua de plata
                                    this.props.language == 'EN' ? alert('Please choose a deadline for the bill') : alert('Alege o data scadenta pentru factura')
                                }else if(this.state.payDateHour != 0 && this.state.payDateHour == ''){  // se verifica ora de plata
                                    this.props.language == 'EN' ? alert('Please choose a pay time for the bill') : alert('Alege o ora de plata pentru factura')
                                }else {
                                    //se editeaza in baza de date si se inchide modul de editare
                                    this.setState({isVisible: false, barcodeVisible: false})
                                    const editbill = {
                                        id: this.state.id,
                                        name: this.state.name,
                                        price: parseFloat(this.state.price),
                                        payDate: new Date(this.state.payDateYear, this.state.payDateMonth, this.state.payDateDay, this.state.payDateHour, this.state.payDateMinute, 0, 0),
                                        barcode: {value: this.state.barcodeValue, format: this.state.barcodeFormat}
                                    }
                                    const price = this.props.currency === 'Fr' ? editbill.price + '\xa0' + this.props.currency : this.props.currency === 'Lei' ? editbill.price + '\xa0' + this.props.currency : this.props.currency + '\xa0' + editbill.price
                                    const monthNameEng = editbill.payDate.getMonth() + 1 == 1 ? 'January' : 
                                    editbill.payDate.getMonth() + 1 == 2 ? 'February' : 
                                    editbill.payDate.getMonth() + 1 == 3 ? 'March' : 
                                    editbill.payDate.getMonth() + 1 == 4 ? 'April' : 
                                    editbill.payDate.getMonth() + 1 == 5 ? 'May' : 
                                    editbill.payDate.getMonth() + 1 == 6 ? 'June' : 
                                    editbill.payDate.getMonth() + 1 == 7 ? 'July' : 
                                    editbill.payDate.getMonth() + 1 == 8 ? 'August' : 
                                    editbill.payDate.getMonth() + 1 == 9 ? 'September' : 
                                    editbill.payDate.getMonth() + 1 == 10 ? 'October' : 
                                    editbill.payDate.getMonth() + 1 == 11 ? 'November' : 
                                    'December' 
                                const monthNameRo = editbill.payDate.getMonth() + 1 == 1 ? 'Ianuarie' : 
                                    editbill.payDate.getMonth() + 1 == 2 ? 'Februarie' : 
                                    editbill.payDate.getMonth() + 1 == 3 ? 'Martie' : 
                                    editbill.payDate.getMonth() + 1 == 4 ? 'Aprilie' : 
                                    editbill.payDate.getMonth() + 1 == 5 ? 'Mai' : 
                                    editbill.payDate.getMonth() + 1 == 6 ? 'Iunie' : 
                                    editbill.payDate.getMonth() + 1 == 7 ? 'Iulie' : 
                                    editbill.payDate.getMonth() + 1 == 8 ? 'August' : 
                                    editbill.payDate.getMonth() + 1 == 9 ? 'Septembrie' : 
                                    editbill.payDate.getMonth() + 1 == 10 ? 'Octombrie' : 
                                    editbill.payDate.getMonth() + 1 == 11 ? 'Noiembrie' : 
                                    'December' 
                                const deadlineDate = `${editbill.payDate.getDate()} ${this.props.language == 'EN' ? monthNameEng : monthNameRo} ${editbill.payDate.getFullYear()}`
                                var days = 7
                                for(var i = 7; i > 0; --i){
                                    if(editbill.payDate - new Date() - i * 86400000 > 0){
                                        days = i
                                        break
                                    }
                                }
                                PushNotification.localNotificationSchedule({
                                    id: String(editbill.id),
                                    message: this.props.language == 'EN' ? `Your ${editbill.name} bill in amount of ${price} has the deadline on ${deadlineDate}. Don't forget to pay it!` : `Factura ${editbill.name} in valoare de ${price} are data scadenta pe ${deadlineDate}. Nu uita sa o platesti!`,
                                    date: days >= 7 ? new Date(editbill.payDate - days * 86400000) : new Date(), 
                                    repeatType: 'day',
                                    importance: 'high',
                                    vibrate: false,
                                    group: 'Pay Assistant'
                                  });
                                    editBill(editbill).then().catch(error => alert(`Could not edit the bill: ${error}`))
                                }
                            }}
                          />
                        </DialogFooter>
                      }
                >
                    <DialogContent>
                        <KeyboardAvoidingView style = {styles.editModal}>
                            <View style = {[styles.editRowView]}>
                                <Text style = {{fontSize: 14, color:'#05295B'}}> {this.props.language == 'EN' ? "Bill's name:" : 'Numele facturii:'} </Text>
                                <TextInput
                                    placeholder = {this.props.language == 'EN' ? "Type a name..." : 'Introdu un nume...'}
                                    textAlign = 'center'
                                    textAlignVertical = 'center'
                                    maxLength = {18} 
                                    value = {this.state.name}
                                    onChangeText = {name => this.setState({name})}
                                    textAlign = 'center'
                                    textAlignVertical = 'center'
                                />
                            </View>
                            <View style = {[styles.editRowView]}>
                                <Text style = {{fontSize: 14, color:'#05295B'}}>{this.props.language == 'EN' ? "Bill's price:" : 'Pretul facturii:'}</Text>
                                <TextInput
                                    placeholder = {this.props.language == 'EN' ? "Type a price...": 'Introdu un pret...'}
                                    textAlign = 'center'
                                    textAlignVertical = 'center' 
                                    maxLength = {15}
                                    keyboardType = 'numeric'
                                    value = {String(this.state.price)}
                                    onChangeText = {price => this.setState({price})}
                                    textAlign = 'center'
                                    textAlignVertical = 'center'
                                    style = {{width: '25%'}}
                                />
                                <Text>{this.props.currency}</Text>
                            </View>
                            <View style = {[styles.editRowView, {marginVertical: 5}]}>
                                <Text style = {{fontSize: 14, color:'#05295B'}}>{this.props.language == 'EN' ? "Deadline:" : 'Data scandenta:'} {`${this.state.payDateDay}/${this.state.payDateMonth + 1}/${this.state.payDateYear}`}</Text>
                                <TouchableOpacity onPress = {this.setDateAndroid}>
                                    <Text style = {{color: '#0489B1', fontSize: 14}}>{this.props.language == 'EN' ? "Change deadline" : 'Schimba'}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style = {[styles.editRowView, {marginVertical: 5}]}>
                                <Text style = {{fontSize: 14, color:'#05295B'}}>{this.props.language == 'EN' ? "Pay time:" : 'Ora de plata:'} {`${this.state.payDateHour}:${this.state.payDateMinute <= 9 ? String('0' + this.state.payDateMinute) : this.state.payDateMinute}`}</Text>
                                <TouchableOpacity onPress = {this.setTimeAndroid}>
                                    <Text style = {{color: '#0489B1', fontSize: 14}}>{this.props.language == 'EN' ? "Change pay time" : 'Schimba ora'}</Text>
                                </TouchableOpacity>
                            </View>
                            {this.state.barcodeValue == '' ? 
                                <View style = {{justifyContent: 'center', alignItems: 'center', marginTop: '1%'}}>
                                <TouchableOpacity
                                    onPress = {() => {
                                        this.setState({scanVisible: true})
                                    }}
                                >
                                    <Text style = {{color: '#0489B1', fontSize: 14}}>{this.props.language == 'EN' ? "Add the bar code" : 'Adauga codul de bare'}</Text>
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
                                    :
                                <View style = {{justifyContent: 'space-around', alignItems: 'center', flexDirection: 'row'}}>
                                    <Text style = {{fontSize: 14, color:'#05295B'}}>{this.props.language == 'EN' ? "Bill's barcode:" : 'Codul de bare:'}</Text>
                                    <Modal
                                        visible = {this.state.barcodeVisible}
                                        onRequestClose = {() => this.setState({barcodeVisible: false})}
                                    >
                                        <View style = {{flex: 1}}>
                                                <TouchableOpacity
                                                    onPress = {() => this.setState({barcodeVisible: false})}
                                                    style = {{margin: 10}}
                                                >
                                                    <AntDesign 
                                                        name = 'close'
                                                        size = {25}
                                                        color = 'black'
                                                    />
                                                </TouchableOpacity>
                                                <View style = {{justifyContent: 'center', alignItems: 'center', flex: 9}}>
                                                    {this.state.barcodeFormat.includes('QR') ? 
                                                            <QRCode 
                                                                value = {this.state.barcodeValue}
                                                                size = {200}
                                                            />
                                                        : 
                                                            <Barcode 
                                                                value = {this.state.barcodeValue}
                                                                format = {this.state.barcodeFormat}
                                                                width = {this.state.barcodeFormat.includes('CODE') ? 1.9 : 2.5}
                                                                flat
                                                                text = {this.state.barcodeValue}
                                                            />
                                                    }
                                                </View>
                                        </View>
                                    </Modal>
                                    <TouchableOpacity
                                        onPress = {() => this.setState({barcodeVisible: true})}
                                    >
                                            {this.state.barcodeFormat.includes('QR') ?
                                                <Image 
                                                    source = {require('C:/Users/Zarzu Victor/payAssistant/Person/PersonHome/PersonBills/images/qrcode.png')}
                                                    style = {{height: 30, width: 30, tintColor: 'black'}}
                                                />
                                            :
                                                <Barcode 
                                                    value = {this.state.barcodeValue}
                                                    format = {this.state.barcodeFormat}
                                                    width = {this.state.barcodeFormat.includes('CODE') ? 0.4 : 0.6}
                                                    height = {25}
                                                    flat
                                                    background = '#D4E6FF'
                                                />
                                            }
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress = {() => {
                                            this.setState({scanVisible: true})
                                        }}
                                    >
                                        <Text style = {{color: '#0489B1', fontSize: 14}}>{this.props.language == 'EN' ? "Modify" : 'Modifica'}</Text>
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
                            }
                        </KeyboardAvoidingView>
                    </DialogContent>
                </Dialog>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    editDialog: {
        borderRadius: 15,
        backgroundColor: '#D4E6FF',
        borderColor: '#05295B',
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