// Import stylesheets
import './style.css';
// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from "firebase/app";

// Add the Firebase products that you want to use
import "firebase/auth";
import "firebase/firestore";

import * as firebaseui from 'firebaseui';

// Document elements
const startRsvpButton = document.getElementById('startRsvp');
const guestbookContainer = document.getElementById('guestbook-container');

const form = document.getElementById('leave-message');
const input = document.getElementById('message');
const guestbook = document.getElementById('guestbook');
const numberAttending = document.getElementById('number-attending');
const rsvpYes = document.getElementById('rsvp-yes');
const rsvpNo = document.getElementById('rsvp-no');

var rsvpListener = null;
var guestbookListener = null;

// web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyChyLYuGeuyj1PFGHmm3-FAg7AMEfZzJn4",
    authDomain: "fir-web-codelab-3d8e0.firebaseapp.com",
    databaseURL: "https://fir-web-codelab-3d8e0.firebaseio.com",
    projectId: "fir-web-codelab-3d8e0",
    storageBucket: "fir-web-codelab-3d8e0.appspot.com",
    messagingSenderId: "858734874266",
    appId: "1:858734874266:web:aa0beb9a436f06f99c1923"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// FirebaseUI config
const uiConfig = {
  credentialHelper: firebaseui.auth.CredentialHelper.NONE,
  signInOptions: [
    // Email / Password Provider.
    firebase.auth.EmailAuthProvider.PROVIDER_ID
  ],
  callbacks: {
    signInSuccessWithAuthResult: function(authResult, redirectUrl){
      // Handle sign-in.
      // Return false to avoid redirect.
      return false;
    }
  }
};

const ui = new firebaseui.auth.AuthUI(firebase.auth());

startRsvpButton.addEventListener("click",
 () => {
      if (firebase.auth().currentUser) {
      // User is signed in; allows user to sign out
      firebase.auth().signOut();
    } else {
      // No user is signed in; allows user to sign in
      ui.start("#firebaseui-auth-container", uiConfig);
    }
});

firebase.auth().onAuthStateChanged((user)=> {
  if (user) {
    startRsvpButton.textContent = "LOGOUT"
    // Show guestbook to logged-in users
    guestbookContainer.style.display = "block";
    // Subscribe to the guestbook collection
    subscribeGuestbook();
  }
  else {
    startRsvpButton.textContent = "RSVP"
    // Hide guestbook for non-logged-in users
    guestbookContainer.style.display = "none";
    // Unsubscribe from the guestbook collection
    unsubscribeGuestbook();
  }
});

// Listen to the form submission
form.addEventListener("submit", (e) => {
 // Prevent the default form redirect
 e.preventDefault();
 // Write a new message to the database collection "guestbook"
 firebase.firestore().collection("guestbook").add({
   text: input.value,
   timestamp: Date.now(),
   name: firebase.auth().currentUser.displayName,
   userId: firebase.auth().currentUser.uid
 })
 // clear message input field
 input.value = ""; 
 // Return false to avoid redirect
 return false;
});

// Create query for messages
function subscribeGuestbook(){
  guestbookListener = firebase.firestore().collection("guestbook")
    .orderBy("timestamp","desc")
    .onSnapshot((snaps) => {
      // Reset page
      guestbook.innerHTML = "";
      // Loop through documents in database
      snaps.forEach((doc) => {
        // Create an HTML entry for each document and add it to the chat
        const entry = document.createElement("p");
        entry.textContent = doc.data().name + ": " + doc.data().text;
        guestbook.appendChild(entry);
      });
    });
}

function unsubscribeGuestbook(){
 if (guestbookListener != null)
 {
   guestbookListener();
   guestbookListener = null;
 }
};