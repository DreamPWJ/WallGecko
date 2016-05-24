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
        map.setCenter(lat, lag);

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

