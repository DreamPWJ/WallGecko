angular.module('starter.controllers', [])

  .controller('MainCtrl', function ($scope, $ionicPopup, $rootScope) {
    // 一个提示对话框
    $rootScope.showAlert = function (title, template) {
      var alertPopup = $ionicPopup.alert({
        title: title,
        template: template
      });
      alertPopup.then(function (res) {
        console.log(res);
      });
    };

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
          icon: 'http://webapi.amap.com/theme/v1.3/markers/n/mark_b1.png',
          position: [$rootScope.lag-0.0011,$rootScope.lat+0.0005]
        }, {
          icon: 'http://webapi.amap.com/theme/v1.3/markers/n/mark_b2.png',
          position: [$rootScope.lag+0.002, $rootScope.lat+0.002]
        }, {
          icon: 'http://webapi.amap.com/theme/v1.3/markers/n/mark_b3.png',
          position: [$rootScope.lag-0.002, $rootScope.lat-0.002]
        }, {
          icon: 'http://webapi.amap.com/theme/v1.3/markers/n/mark_b4.png',
          position: [$rootScope.lag-0.001, $rootScope.lat-0.001]
        }, {
          icon: 'http://webapi.amap.com/theme/v1.3/markers/n/mark_b5.png',
          position: [$rootScope.lag+0.002, $rootScope.lat-0.002]
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
  }
)
  .controller('WorklistCtrl', function ($scope, $ionicPopup) {

  })
  .controller('WorklistDetailsCtrl', function ($scope, $ionicPopup,$rootScope) {
    $scope.locationlist=function(){
      $scope.cartype=1;
    }
    $scope.locationmap=function(){
      $scope.cartype=2;
      //调用地图定位
      $rootScope.fixLocationCommon("gaode-map-1");
    }
  })
  .controller('AccountCtrl', function ($scope, $ionicPopup) {

  })
  .controller('LoginCtrl', function ($scope, $ionicPopup) {

  })
  .controller('GuestListCtrl', function ($scope, $ionicPopup) {

  })
  .controller('GuestListDetailsCtrl', function ($scope, $ionicPopup,$stateParams) {
        $scope.guestname=$stateParams.guestname;
        $scope.gueststate=$stateParams.gueststate;
  })
