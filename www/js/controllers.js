angular.module('starter.controllers', [])
  .config(function ($httpProvider) {
    //$http模块POST请求类型编码转换 统一配置
    $httpProvider.defaults.transformRequest = function (obj) {
      var str = [];
      for (var p in obj) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]))
      }
      return str.join("&")
    }
    $httpProvider.defaults.headers.post = {
      'Content-Type': 'application/x-www-form-urlencoded'
    }

    $httpProvider.defaults.headers.put = {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
  .controller('TabCtrl', function ($scope, $state, $rootScope, $ionicModal, $http, WallCecko, $ionicLoading, commonService) {

    //定位地图复用方法
    $rootScope.fixLocationCommon = function (id, url, query) {
      //加载动画
      $ionicLoading.show({
        template: '<ion-spinner icon="bubbles" class="spinner-balanced"></ion-spinner>',
        animation: 'fade-in',
        showBackdrop: false
      });

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
            q: query,
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
          if (data.cell_list.length == 0) {
            commonService.showAlert("壁虎漫步", "没有获取到相关的信息!");
          }
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

          $ionicLoading.hide();//隐藏加载动画
          for (var i = 0; i < markers.length; i++) {
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
        commonService.showAlert("壁虎漫步", "壁虎漫步地理位置获取失败!");
      }
    }
  })
  .controller('MainCtrl', function ($scope, $state, $rootScope, $ionicModal, $stateParams, $http, WallCecko, $ionicLoading) {

      $rootScope.usertype = localStorage.getItem('role');

      //调用地图定位
      $rootScope.fixLocationCommon("gaode-map", "/mobile/map/cells");

      //点击搜索跳转搜索modal
      $ionicModal.fromTemplateUrl('templates/search.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function (modal) {
        $scope.modal = modal;
      });
      //查询参数
      $scope.search = {};
      $scope.searchmap = function () {
        $rootScope.fixLocationCommon("gaode-map", "/mobile/map/cells", $scope.search.searchquery);
        $scope.modal.hide();
      }
    }
  )
  .controller('WorklistCtrl', function ($scope, WallCecko, $http, $rootScope, commonService) {
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
  .controller('WorklistDetailsCtrl', function ($scope, $rootScope, $state, $stateParams, WallCecko, $http, $ionicLoading, commonService) {
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

      //调用地图定位
      $rootScope.fixLocationCommon("gaode-map-1", "/mobile/map/workorders/" + $scope.workorderid);
    }

    //更改工单状态
    $scope.updateworkordersstatus = function () {
      var orderstatus = "完成";
      var promise = $http({
        method: 'PUT',
        url: WallCecko.api + '/mobile/operation/workorders/' + $scope.workorderid,
        params: {
          token: encodeURI(localStorage.getItem('token')),
          status: encodeURI(orderstatus)
        }
      })
      promise.success(function () {
        commonService.showAlert("壁虎漫步", "工单状态更新成功!");
        //跳转到工单列表中
        $state.go("tab.worklist")
      }).error(function () {
        commonService.showAlert("壁虎漫步", "工单状态更新失败!");
      })
    }
    //更改位置点状态
    $scope.updatepointsstatus = function (pointsid, orderstatus) {
      var promise = $http({
        method: 'PUT',
        url: WallCecko.api + '/mobile/operation/points/' + pointsid,
        params: {
          token: encodeURI(localStorage.getItem('token')),
          status: encodeURI(orderstatus)
        }
      })
      promise.success(function () {
        angular.element(document.querySelector("#point" + pointsid)).text("已维修");
        commonService.showAlert("壁虎漫步", "位置点状态更新成功!");
      }).error(function () {
        commonService.showAlert("壁虎漫步", "位置点状态更新失败!");
      })
    }


    // 获得七牛云上传图片令牌
    $scope.qiniuuploadtoken = function (filename, pointid) {
      var promise = $http({
        method: 'POST',
        url: WallCecko.api + '/mobile/qiniu/upload/tokens',
        params: {
          token: encodeURI(localStorage.getItem('token'))
        },
        data: {
          point_id: pointid,
          filename: filename
        }
      })
      promise.success(function (data) {
        $scope.qiniutoken = data.token;
        $scope.qiniukey = data.key;
      }).error(function () {
        commonService.showAlert("壁虎漫步", "获得七牛云上传图片令牌失败!");
      })
      return promise;
    }

    // 图片上传七牛云
    $scope.qiniuuploadfile = function (qiniutoken, qiniukey, file) {
      $ionicLoading.show({
        template: '正在上传图片',
        animation: 'fade-in',
        showBackdrop: false
      });
      var promise = $http({
        method: 'POST',
        url: 'http://upload.qiniu.com',
        data: {
          token: qiniutoken,
          key: qiniukey,
          file: file
        },
        headers: {
          'Content-Type': undefined
        },
        transformRequest: function (data) {
          var formData = new FormData();
          formData.append('token', data.token);
          formData.append('key', data.key);
          formData.append('file', data.file);
          return formData;
        }
      })
      promise.success(function (data) {
        $ionicLoading.hide();
        commonService.showAlert("壁虎漫步", "上传图片成功!");
      }).error(function () {
        commonService.showAlert("壁虎漫步", "上传图片失败!");
      });
      return promise;
    }

    // 图片上传七牛云成功通知
    $scope.qiniuuploadinfo = function (filename, pointid) {
      $http({
        method: 'POST',
        url: WallCecko.api + '/mobile/qiniu/upload/images',
        params: {
          token: encodeURI(localStorage.getItem('token'))
        },
        data: {
          filename: filename,
          point_id: pointid
        }
      }).success(function () {
        commonService.showAlert("壁虎漫步", "七牛云上传图片成功!");
      }).error(function () {
        commonService.showAlert("壁虎漫步", "七牛云上传图片失败!");
      })
    }
    //上传文件
    $scope.selectFiles = [];
    //开始上传
    var start = function (index, selectFilesItem) {
      $scope.qiniuuploadfile($scope.qiniutoken, $scope.qiniukey, selectFilesItem.file)
    };
    //选择文件
    $scope.onFileSelect = function ($files,pointid) {
      var offsetx = $scope.selectFiles.length;
      for (var i = 0; i < $files.length; i++) {
        $scope.selectFiles[i + offsetx] = {
          file: $files[i]
        };
        var selectFilesItem = $scope.selectFiles[i];
        var promise = $scope.qiniuuploadtoken($scope.selectFiles[i].file.name, pointid);
        promise.then(function () {
          start(i + offsetx, selectFilesItem);
        })

      }
    };

  })
  .controller('AccountCtrl', function ($scope, $rootScope, WallCecko, $http, $state, commonService) {
    $scope.username = localStorage.getItem('username');
    $scope.role = localStorage.getItem('role');
    $scope.logout = function () {
      $http({
        method: 'POST',
        url: WallCecko.api + '/mobile/user/logout',
        params: {
          token: encodeURI(localStorage.getItem('token'))
        }
      }).success(function () {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        //用户类型退出 路由到登录页面
        $state.go("login")
      }).error(function () {
        commonService.showAlert("壁虎漫步", "退出失败!");
      })
    }
  })
  .controller('LoginCtrl', function ($scope, $rootScope, WallCecko, $http, encodingService, $state, commonService) {

    $scope.user = {};//提前定义用户对象
    $scope.loginSubmit = function () {
      var promise = $http({
          method: 'POST',
          url: WallCecko.api + '/mobile/user/login',
          data: {
            username: $scope.user.username,
            password: encodingService.md5($scope.user.password)
          }
        }
      )
      promise.success(function (data) {
        localStorage.setItem('token', data.token);
      })
      promise.error(function () {
        commonService.showAlert("壁虎漫步", "登录失败!");
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
  .controller('GuestListDetailsCtrl', function ($scope, $stateParams, WallCecko, $http, $rootScope, commonService) {
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
          url: WallCecko.api + '/mobile/sales/customers/' + $scope.customerid + '/visits',
          params: {
            token: encodeURI(localStorage.getItem('token'))
          },
          data: {
            address: $scope.address,
            longitude: $rootScope.lag,
            latitude: $rootScope.lat
          }
        }
      )
      promise.success(function (data) {
        commonService.showAlert("壁虎漫步", "客户拜访成功!");
      }).error(function () {
        commonService.showAlert("壁虎漫步", "客户拜访失败!");
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



