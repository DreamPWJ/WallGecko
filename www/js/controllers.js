angular.module('starter.controllers', [])

  .controller('MainCtrl', function ($scope, $state, $rootScope, $ionicModal, $stateParams, $http, WallCecko, mapService) {
  
    if (!navigator.onLine) {
      //网络不正常工作
      $rootScope.showAlert("壁虎漫步", "为保证功能体验正常 请链接网络!");
    }
      $rootScope.usertype = localStorage.getItem('role');
      //定位地图复用方法
      $rootScope.fixLocationCommon = function (id, url) {
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
          var params = {};
          if (url == '/mobile/map/cells') {
            params = {
              q: '',
              city: '',
              token: encodeURI(localStorage.getItem('token')),
              longitude: $rootScope.lag,
              latitude: $rootScope.lat
            }
          } else {
            params = {
              city: $rootScope.city,
              token: encodeURI(localStorage.getItem('token'))
            }
          }

          var promise = $http({
            method: 'GET',
            url: WallCecko.api + url,
            params: params
          })
          promise.success(function (data) {
            $rootScope.city = data.city;
            $scope.cell_list = data.cell_list;

          })

          promise.then(function () {
            var markers = []
            for (var i = 0, len = $scope.cell_list.length; i < len; i++) {
              markers.push({
                lnglats: [$scope.cell_list[i].longitude, $scope.cell_list[i].latitude],
                name: $scope.cell_list[i].name,
                address: $scope.cell_list[i].address,
                count: $scope.cell_list[i].count
              })
            }

            var infoWindow = new AMap.InfoWindow({offset: new AMap.Pixel(0, -30)});

            for (var i = 0, marker; i < markers.length; i++) {
              var marker = new AMap.Marker({
                position: markers[i].lnglats,
                map: map
              });
              marker.content = '<strong>楼盘名 : ' + markers[i].name + ' </strong><br><span>地址 : ' + markers[i].address + '</span>' +
                '<br><span>位置点数 : ' + markers[i].count + '</span>';
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
      $rootScope.fixLocationCommon("gaode-map", "/mobile/map/cells");

      //点击搜索跳转搜索modal
      $ionicModal.fromTemplateUrl('templates/search.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function (modal) {
        $scope.modal = modal;
      });

    }
  )
  .controller('WorklistCtrl', function ($scope, WallCecko, $http, $rootScope) {
    if (!navigator.onLine) {
      //网络不正常工作
      $rootScope.showAlert("壁虎漫步", "为保证功能体验正常 请链接网络!");
    }
    $rootScope.usertype = localStorage.getItem('role');
    var promise = $http({
      method: 'GET',
      url: WallCecko.api + '/mobile/operation/workorders',
      params: {
        token: encodeURI(localStorage.getItem('token'))
      }
    })
    promise.success(function (data) {
      $scope.workorder_list = data.workorder_list;
      $rootScope.workorder_list_count = data.workorder_list.length;
    })
  })
  .controller('WorklistDetailsCtrl', function ($scope, $rootScope, mapService, $stateParams, WallCecko, $http, $ionicActionSheet, $cordovaImagePicker, $cordovaCamera) {
    $scope.workorderid = $stateParams.workorderid;
    $scope.workstate = $stateParams.workstate;
    var promise = $http({
      method: 'GET',
      url: WallCecko.api + '/mobile/operation/workorders/' + $scope.workorderid,
      params: {
        token: encodeURI(localStorage.getItem('token'))
      }
    })
    promise.success(function (data) {
      $scope.point_list = data.point_list;
    })

    $scope.locationlist = function () {
      $scope.cartype = 1;
    }
    $scope.locationmap = function () {
      $scope.cartype = 2;
      //定位地图复用方法
      $rootScope.fixLocationCommon = function (id, url) {
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
          var params = {};
          if (url == '/mobile/map/cells') {
            params = {
              q: '',
              city: '',
              token: encodeURI(localStorage.getItem('token')),
              longitude: $rootScope.lag,
              latitude: $rootScope.lat
            }
          } else {
            params = {
              city: $rootScope.city,
              token: encodeURI(localStorage.getItem('token'))
            }
          }

          var promise = $http({
            method: 'GET',
            url: WallCecko.api + url,
            params: params
          })
          promise.success(function (data) {
            $rootScope.city = data.city;
            $scope.cell_list = data.cell_list;

          })

          promise.then(function () {
            var markers = []
            for (var i = 0, len = $scope.cell_list.length; i < len; i++) {
              markers.push({
                lnglats: [$scope.cell_list[i].longitude, $scope.cell_list[i].latitude],
                name: $scope.cell_list[i].name,
                address: $scope.cell_list[i].address,
                count: $scope.cell_list[i].count
              })
            }

            var infoWindow = new AMap.InfoWindow({offset: new AMap.Pixel(0, -30)});

            for (var i = 0, marker; i < markers.length; i++) {
              var marker = new AMap.Marker({
                position: markers[i].lnglats,
                map: map
              });
              marker.content = '<strong>楼盘名 : ' + markers[i].name + ' </strong><br><span>地址 : ' + markers[i].address + '</span>' +
                '<br><span>位置点数 : ' + markers[i].count + '</span>';
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
      $rootScope.fixLocationCommon("gaode-map-1", "/mobile/map/workorders/" + $scope.workorderid);
    }

    //上传图片方法
    $scope.uploadimage = function () {
      $scope.images_list = [];


      //调用摄像头拍照
      $scope.appendByCamera = function () {
        navigator.camera.getPicture(function (result) {
          q.resolve(result);
        }, function (err) {
          q.reject(err);
        }, options);
      }
      //图片选择
      $scope.pickImage = function () {
        var options = {
          maximumImagesCount: 1,
          width: 800,
          height: 800,
          quality: 80
        };

        $cordovaImagePicker.getPictures(options)
          .then(function (results) {
            $scope.images_list.push(results[0]);

          }, function (error) {
            // error getting photos
          });
      }


      $ionicActionSheet.show({
        buttons: [
          {text: '相机'},
          {text: '图库'}
        ],
        cssClass: 'action-s',
        cancelText: '关闭',
        cancel: function () {
          return true;
        },
        buttonClicked: function (index) {
          switch (index) {
            case 0:
              $scope.appendByCamera();
              break;
            case 1:
              $scope.pickImage();
              break;
            default:
              break;
          }
          return true;
        }
      });
    }
  })
  .controller('AccountCtrl', function ($scope, $rootScope, WallCecko, $http, $state) {
    $scope.username = localStorage.getItem('username');
    $scope.role = localStorage.getItem('role');
    $scope.logout = function () {
      $http({
        method: 'POST',
        url: WallCecko.api + '/mobile/user/logout',
        params: {
          token: encodeURI(localStorage.getItem('token'))
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
      }).success(function () {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        //用户类型退出 路由到登录页面
        $state.go("login")
      }).error(function () {
        $rootScope.showAlert("壁虎漫步", "退出失败!");
      })
    }
  })
  .controller('LoginCtrl', function ($scope, $rootScope, $ionicPopup, WallCecko, $http, encodingService, $state) {
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

    if (!navigator.onLine) {
      //网络不正常工作
      $rootScope.showAlert("壁虎漫步", "为保证功能体验正常 请链接网络!");
    }

    $scope.user = {};//提前定义用户对象
    $scope.loginSubmit = function () {
      var promise = $http({
          method: 'POST',
          url: WallCecko.api + '/mobile/user/login',
          data: {
            username: $scope.user.username,
            password: encodingService.md5($scope.user.password)
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
            token: encodeURI(localStorage.getItem('token'))
          }
        }).success(function (data) {
          localStorage.setItem('username', data.name);
          localStorage.setItem('role', data.role);
          //用户类型 销售 维修
          if (data.role == 'sales') {
            $state.go("tab.main")
          } else if (data.role == 'operation') {
            $state.go("tab.worklist")
          }
        })
      })
    }

  })
  .controller('GuestListCtrl', function ($scope, WallCecko, $http) {
    var promise = $http({
      method: 'GET',
      url: WallCecko.api + '/mobile/sales/customers',
      params: {
        token: encodeURI(localStorage.getItem('token'))
      }
    })
    promise.success(function (data) {
      $scope.customer_list = data.customer_list;
    })
  })
  .controller('GuestListDetailsCtrl', function ($scope, $stateParams, WallCecko, $http, $rootScope) {
    $scope.customerid = $stateParams.customerid;
    $scope.guestname = $stateParams.guestname;
    $scope.gueststate = $stateParams.gueststate;
    $scope.phone = $stateParams.phone;
    $scope.address = $stateParams.address;
    $scope.description = $stateParams.description;
    $scope.count = $stateParams.count;
    //客户拜访
    $scope.guestvisits = function () {
      var promise = $http({
          method: 'POST',
          url: WallCecko.api + '/mobile/sales/customers/' + $scope.customerid + '>/visits',
          params: {
            token: encodeURI(localStorage.getItem('token'))
          },
          data: {
            address: $scope.address,
            longitude: $rootScope.lag,
            latitude: $rootScope.lat
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
        console.log(data);
        $rootScope.showAlert("壁虎漫步", "客户拜访成功!");
      }).error(function () {
        $rootScope.showAlert("壁虎漫步", "客户拜访失败!");
      })
    }

    $scope.guestvisitsrecord = function () {
      var promise = $http({
        method: 'GET',
        url: WallCecko.api + '/mobile/sales/customers/' + $scope.customerid + '/visits',
        params: {
          token: encodeURI(localStorage.getItem('token'))
        }
      })
      promise.success(function (data) {
        console.log(data);
      })
    }
  })
  .controller('GuestListVisitDetailsCtrl', function ($scope, $stateParams, WallCecko, $http, $rootScope) {

  })

  .controller('SearchCtrl', function ($scope) {

  })


