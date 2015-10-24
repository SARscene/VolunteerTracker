// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('app', ['ionic'])

  .config(function($compileProvider, $stateProvider, $urlRouterProvider, $locationProvider){
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);

    // routes
    $urlRouterProvider.otherwise('/');

    $stateProvider
      .state('app', {
        url: '/',
        templateUrl: 'templates/start.html',
        controller: 'StartCtrl'
      })

      .state('app.entry',{
        url: 'entry',
        templateUrl: 'templates/entry.html',
        controller: 'EntryCtrl'
      })

      .state('app.tracking', {
        url: 'tracking',
        templateUrl: 'templates/tracking.html',
        controller: 'TrackingCtrl'
      });

  })

  .run(function($ionicPlatform, $localstorage) {

    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if(window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if(window.StatusBar) {
        StatusBar.styleDefault();
      }
    });


  });
