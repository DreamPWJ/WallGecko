angular.module('starter.controllers', [])

  .controller('MainCtrl', function ($scope, $state, $rootScope, $ionicModal, $stateParams,$http,WallCecko) {

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
          $rootScope.lag = data.position.getLng();
          $rootScope.lat = data.position.getLat();
          map.setZoom(16);
          map.clearMap();  // 清除地图覆盖物
          var promise=$http({
            method: 'GET',
            url: WallCecko.api + '/mobile/map/cells',
            params: {
              q:'',
              city:'',
              token: encodeURI(localStorage.getItem('token')),
              longitude:$rootScope.lag,
              latitude:$rootScope.lat
            }
          })
          promise.success(function(data){
            console.log(data);
             $rootScope.city=data.city;
            $scope.cell_list=data.cell_list;

          })

          promise.then(function(){
            var markers = [
            ]
            for(var i= 0,len= $scope.cell_list.length;i<len;i++){
              markers.push({lnglats:[$scope.cell_list[i].longitude,$scope.cell_list[i].latitude],name:$scope.cell_list[i].name,address:$scope.cell_list[i].address})
            }

            var infoWindow = new AMap.InfoWindow({offset: new AMap.Pixel(0, -30)});

            for (var i = 0, marker; i < markers.length; i++) {
              var marker = new AMap.Marker({
                position: markers[i].lnglats,
                map: map
              });
              marker.content = '<strong>名称 :'+markers[i].name+' </strong><p>地址 : '+markers[i].address+'</p>';
              marker.on('click', markerClick);
              marker.emit('click', {target: marker});
            }
            function markerClick(e) {
              infoWindow.setContent(e.target.content);
              infoWindow.open(map, e.target.getPosition());
            }
            map.setFitView();

          })


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
  .controller('WorklistCtrl', function ($scope,WallCecko,$http) {
    var promise=$http({
      method: 'GET',
      url: WallCecko.api + '/mobile/operation/workorders',
      params: {
        token: encodeURI(localStorage.getItem('token')),
      }
    })
    promise.success(function(data){
      $scope.workorder_list=data.workorder_list;

    })
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
  .controller('LoginCtrl', function ($scope, $rootScope, $ionicPopup, WallCecko, $http, encodingService,$state) {
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
      var promise = $http({
          method: 'POST',
          url: WallCecko.api + '/mobile/user/login',
          data: {
            username: '销1',
            password: encodingService.md5('123')
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
      promise.then(function () {
        $http({
          method: 'GET',
          url: WallCecko.api + '/mobile/user/me',
          params: {
            token: encodeURI(localStorage.getItem('token')),
          }
        }).success(function (data) {
               console.log(data);
               //用户类型 销售 维修
              if(data.role=='sales'){
                $state.go("tab.main")
              }else  if(data.role=='operation'){
                $state.go("tab.worklist")
              }
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


