// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'starter.config','ngCordova'])

  .run(function ($ionicPlatform,$rootScope,$ionicPopup,$location,$ionicHistory) {
    $ionicPlatform.ready(function () {
        //主页面显示退出提示框
        $ionicPlatform.registerBackButtonAction(function (e) {
          e.preventDefault();
          function showConfirm() {
            var confirmPopup = $ionicPopup.confirm({
              title: '<strong>退出应用?</strong>',
              template: '你确定要退出壁虎漫步应用吗?',
              okText: '退出',
              cancelText: '取消'
            });

            confirmPopup.then(function (res) {
              if (res) {
                ionic.Platform.exitApp();
              } else {
                // Don't close
              }
            });
          }

          // Is there a page to go back to? 制定页面返回退出程序
          if ($location.path() == '/tab/main'|| $location.path() == '/tab/worklist' ||$location.path() == '/login' || $location.path() == '/tab/account') {
            showConfirm();
          } else if ($ionicHistory.backView()) {
            // Go back in history
            $ionicHistory.goBack();
          } else {
            // This is the last page: Show confirmation popup
            showConfirm();
          }

          return false;
        }, 101);

      //hide splash immediately 加载完成立刻隐藏启动画面
      if (navigator && navigator.splashscreen) {
        navigator.splashscreen.hide();
      }

      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);

      }
      if (window.StatusBar) {
        //状态栏颜色设置
        // org.apache.cordova.statusbar required
        StatusBar.overlaysWebView(false);
        StatusBar.backgroundColorByHexString("#33cd5f");
      }
    });
  })

  .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
    $ionicConfigProvider.platform.ios.tabs.style('standard');
    $ionicConfigProvider.platform.ios.tabs.position('bottom');
    $ionicConfigProvider.platform.android.tabs.style('standard');
    $ionicConfigProvider.platform.android.tabs.position('bottom');

    $ionicConfigProvider.platform.ios.navBar.alignTitle('center');
    $ionicConfigProvider.platform.android.navBar.alignTitle('center');

    $ionicConfigProvider.platform.ios.backButton.previousTitleText('').icon('ion-ios-arrow-back');
    $ionicConfigProvider.platform.android.backButton.previousTitleText('').icon('ion-ios-arrow-back');

    $ionicConfigProvider.platform.ios.views.transition('ios');
    $ionicConfigProvider.platform.android.views.transition('android');

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

      // setup an abstract state for the tabs directive
      .state('tab', {
        url: '/tab',
        abstract: true,
        cache:false,
        templateUrl: 'templates/tabs.html',
        controller: 'TabCtrl'
      })

      // Each tab has its own nav history stack:

      .state('tab.main', {
        url: '/main',
        views: {
          'tab-main': {
            templateUrl: 'templates/main.html',
            controller: 'MainCtrl'
          }
        }
      })
      .state('tab.worklist', {
        url: '/worklist',
        cache:false,
        views: {
          'tab-worklist': {
            templateUrl: 'templates/worklist.html',
            controller: 'WorklistCtrl'
          }
        }
      })

      .state('tab.worklistdetails', {
        url: '/worklistdetails/:workorderid/:workstate',
        views: {
          'tab-worklist': {
            templateUrl: 'templates/worklistdetails.html',
            controller: 'WorklistDetailsCtrl'
          }
        }
      })
      .state('tab.account', {
        url: '/account',
        cache:false,
        views: {
          'tab-account': {
            templateUrl: 'templates/account.html',
            controller: 'AccountCtrl'
          }
        }
      })

      .state('login', {
        url: '/login',
        cache:false,
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
      })

      .state('tab.guestlist', {
        url: '/guestlist',
        views: {
          'tab-account': {
            templateUrl: 'templates/guestlist.html',
            controller: 'GuestListCtrl'
          }
        }
      })

      .state('tab.guestlistdetails', {
        url: '/guestlistdetails/:customerid/:guestname/:gueststate/:phone/:address/:description/:count',
        views: {
          'tab-account': {
            templateUrl: 'templates/guestlistdetails.html',
            controller: 'GuestListDetailsCtrl'
          }
        }
      })

      .state('tab.guestlistvisitdetails', {
        url: '/guestlistvisitdetails',
        views: {
          'tab-account': {
            templateUrl: 'templates/guestlistvisitdetails.html',
            controller: 'GuestListVisitDetailsCtrl'
          }
        }
      })
      .state('search', {
        url: '/search',
        templateUrl: 'templates/search.html',
        controller: 'MainCtrl'
      })
    ;

    // if none of the above states are matched, use this as the fallback
    var role =localStorage.getItem('role');
    if(role==null){
      $urlRouterProvider.otherwise('/login');
    }else  if(role=='sales'){
      $urlRouterProvider.otherwise('/tab/main');
    } else  if(role=='operation'){
      $urlRouterProvider.otherwise('/tab/worklist');
    }


  });
