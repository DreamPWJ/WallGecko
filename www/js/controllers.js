angular.module('starter.controllers', [])

  .controller('MainCtrl', function ($scope, $state, $rootScope, $ionicModal, $stateParams) {
      //用户类型 销售 维修
      /*      $rootScope.usertype = $stateParams.usertype;
       if ($rootScope.usertype == 2) {
       $state.go("tab.worklist")
       }*/


      //定位地图复用方法
      $rootScope.fixLocationCommon = function (id) {
        var map = new AMap.Map(id, {
          resizeEnable: true,
          zoom: 12
        });

        map.plugin('AMap.Geolocation', function () {
          geolocation = new AMap.Geolocation({
            enableHighAccuracy: true,//是否使用高精度定位，默认:true
            timeout: 10000,          //超过10秒后停止定位，默认：无穷大
            buttonOffset: new AMap.Pixel(15, 30),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
            zoomToAccuracy: true,      //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
            buttonPosition: 'RB'
          });

          map.addControl(geolocation);
          geolocation.getCurrentPosition();
          AMap.event.addListener(geolocation, 'complete', onComplete);//返回定位信息
          AMap.event.addListener(geolocation, 'error', onError);      //返回定位出错信息
        });
        //解析定位结果
        function onComplete(data) {
          $rootScope.lat = data.position.getLat();
          $rootScope.lag = data.position.getLng();
          map.setZoom(16);
          map.clearMap();  // 清除地图覆盖物
          var markers = [{
            icon: 'img/baner.png',
            position: [$rootScope.lag - 0.0011, $rootScope.lat + 0.0005]
          }, {
            icon: 'img/baner.png',
            position: [$rootScope.lag + 0.002, $rootScope.lat + 0.002]
          }, {
            icon: 'img/baner.png',
            position: [$rootScope.lag - 0.002, $rootScope.lat - 0.002]
          }, {
            icon: 'img/baner.png',
            position: [$rootScope.lag - 0.001, $rootScope.lat - 0.001]
          }, {
            icon: 'img/baner.png',
            position: [$rootScope.lag + 0.002, $rootScope.lat - 0.002]
          }];
          // 添加一些分布不均的点到地图上,地图上添加三个点标记，作为参照
          markers.forEach(function (marker) {
            new AMap.Marker({
              map: map,
              icon: marker.icon,
              position: [marker.position[0], marker.position[1]]
            });
          });

        }

        //解析定位错误信息
        function onError(data) {
          $rootScope.showAlert("壁虎漫步", "壁虎漫步地理位置获取失败!");
        }
      }
      //调用地图定位
      $rootScope.fixLocationCommon("gaode-map");

      //点击搜索跳转搜索modal
      $ionicModal.fromTemplateUrl('templates/search.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function (modal) {
        $scope.modal = modal;
      });

    }
  )
  .controller('WorklistCtrl', function ($scope) {

  })
  .controller('WorklistDetailsCtrl', function ($scope, $rootScope, $stateParams) {
    $scope.workstate = $stateParams.workstate;
    $scope.locationlist = function () {
      $scope.cartype = 1;
    }
    $scope.locationmap = function () {
      $scope.cartype = 2;
      //调用地图定位
      $rootScope.fixLocationCommon("gaode-map-1");
    }
  })
  .controller('AccountCtrl', function ($scope) {

  })
  .controller('LoginCtrl', function ($scope, $rootScope, $ionicPopup, WallCecko, $http) {
    // 一个提示对话框
    $rootScope.showAlert = function (title, template) {
      var alertPopup = $ionicPopup.alert({
        title: title,
        template: template,
        okText: '确定',
        okType: 'button-balanced'
      });
      alertPopup.then(function (res) {
        console.log(res);
      });
    };

    $scope.user = {};//提前定义用户对象
    $scope.loginSubmit = function () {

      var  promise=$http({
          method: 'POST',
          url: WallCecko.api + '/mobile/user/login',
          data: {
            username: '%e9%94%801',
            password: '202cb962ac59075b964b07152d234b70'
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          transformRequest: function (obj) {
            var str = [];
            for (var p in obj) {
              str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]))
            }
            return str.join("&")
          }
        }
      )
      promise.success(function (data) {
        localStorage.setItem('token', data.token);
      })
      promise.error(function () {
        $rootScope.showAlert("壁虎漫步", "登录失败!");
      })
      promise.then(function(){
        $http({
            method: 'GET',
            url: WallCecko.api +'/mobile/user/me',
            params: {
              token: localStorage.getItem('token'),
            }
          }).success(function(data){

           console.log(data)
        })
      })
    }

  })
  .controller('GuestListCtrl', function ($scope) {

  })
  .controller('GuestListDetailsCtrl', function ($scope, $stateParams) {
    $scope.guestname = $stateParams.guestname;
    $scope.gueststate = $stateParams.gueststate;
  })
  .controller('SearchCtrl', function ($scope) {

  })


