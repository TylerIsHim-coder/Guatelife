/* ============================================================
   GuateLife — Firebase initialization
   Loaded after the Firebase compat SDK scripts, before admin.js.
   ============================================================ */
(function () {
  'use strict';

  var firebaseConfig = {
    apiKey: "AIzaSyD1X7lLkdaTgCQ-dKZraSTkSbNwcnSjETI",
    authDomain: "guatelife-2cc1b.firebaseapp.com",
    projectId: "guatelife-2cc1b",
    storageBucket: "guatelife-2cc1b.firebasestorage.app",
    messagingSenderId: "692683119844",
    appId: "1:692683119844:web:2003d0a7c35e9bf177a0f1",
    measurementId: "G-27NVPF2DLT"
  };

  firebase.initializeApp(firebaseConfig);
  window.GuateLifeDb = firebase.firestore();
})();
