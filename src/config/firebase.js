import * as firebase from 'firebase/app'
import 'firebase/database'

const firebaseConfig = {
  apiKey: 'AIzaSyCpPOYISxSTRudgw1P6ttXTyMZDrpGWp6A',
  authDomain: 'bandungjs-c3782.firebaseapp.com',
  databaseURL: 'https://bandungjs-c3782.firebaseio.com',
  projectId: 'bandungjs-c3782',
  storageBucket: '',
  messagingSenderId: '1085804661670',
  appId: '1:1085804661670:web:e9dbd4949057ccf2',
}

firebase.initializeApp(firebaseConfig)

export const database = firebase.database()
