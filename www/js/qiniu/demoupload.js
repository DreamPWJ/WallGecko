/**
 * 个人中心-->评价商品
 * Created by geshuo on 2015/6/25.
 */
cdfg.module.controller('remarkGoodsController', ['$scope', '$http', '$ionicHistory', '$ionicPopup', '$stateParams', '$state',
    '$ionicLoading', 'userService', 'popupService', '$rootScope', '$timeout', 'remarkGoodsService','$ionicActionSheet','$ionicModal', '$cordovaImagePicker', '$cordovaCamera',
    function ($scope, $http, $ionicHistory, $ionicPopup, $stateParams, $state, $ionicLoading, userService, popupService,$rootScope, $timeout, remarkGoodsService,$ionicActionSheet,$ionicModal,$cordovaImagePicker, $cordovaCamera) {

        var orderId = $stateParams.orderId;
        var itemId = $stateParams.itemId;
        var orderType = 1;
        var imageSuccessCount = 0;
        var isUploadSuccess = true;
        var uploadImageUrl = cdfg.getImgUploader();//'/upload';

        $scope.isAnonymity = true;
        angular.extend($scope, {
            data :{
                goodsData : []    //商品信息
            }
        });

        /*方法定义*/
        $scope.loadData = loadData;//加载数据
        $scope.checkAnonymity = checkAnonymity;//checkbox点击
        $scope.submitRemark = submitRemark;//提交评价

        var mallLevels = [{
            label: '商品满意度：',
            value: 0
        },
            {
                label: '商品包装满意度：',
                value: 0
            }];
        var shopLevels = [{
            label: '商品满意度：',
            value: 0
        },
            {
                label: '服务满意度：',
                value: 0
            },
            {
                label: '商品包装满意度：',
                value: 0
            }];




        //页面显示的评分数据
        $scope.ratingData = {
            ratingText: '',
            isAnonymity: true
        };

        loadData();
        //初始化数据
        function loadData() {
            //var getGoodsUrl = UrlService.getUrl('ORDER_DETAIL');
            //上传图片
            $scope.imageList = [];
            $scope.evidencePicUrl = '';
            $scope.pickImage = pickImage;//从本地相册选择图片
            $scope.takePicture = takePicture;//拍照
            var getGoodsParams = {
                orderId: orderId
            };
            //获取评论是否有奖
            remarkGoodsService.getCommentPrize().success(function(response){
                if(response && response.code == 1 && response.data){
                    $scope.comPrize = {
                        display : !!response.data.prize,
                        descTxt : response.data.descTxt
                    };
                }
            });
            //$http.post(getGoodsUrl,getGoodsParams)
            remarkGoodsService.getOrderDetail(getGoodsParams)
                .success(function (response) {
                    $scope.$broadcast('scroll.refreshComplete');
                    //网络异常、服务器出错
                    if (!response) {
                        return;
                    }
                    if (response && response.code == 1) {
                        orderType = response.data.orderType;
                        $scope.ratingData.ratingBars = (orderType == 1) ? mallLevels : shopLevels;
                        if (response.data.items.length != 0) {
                            for (var i = 0, len = response.data.items.length; i < len; i++) {
                                if (itemId == response.data.items[i].id) {
                                    $scope.data.goodsData = response.data.items[i];
                                    break;
                                }
                            }
                        } else {
                            var errorNoData = response.data ? response.data : '获取数据失败';
                            popupService.toastr(errorNoData)
                        }
                    } else {
                        var errorText = response.data ? response.data : '获取数据失败';
                        popupService.toastr(errorText);
                    }
                }).error(function (response) {
                    $scope.$broadcast('scroll.refreshComplete');
                    popupService.toastr(cdfg.getMsg('NETWORK_ERROR'));
                }).finally(function(){

                });
        }

        /** 评价页面提交 */
        function isSubmit(){
            var user = userService.getUser();
            var params = {
                order: orderId,
                prodId: $scope.data.goodsData.prodId,
                sku: $scope.data.goodsData.skuId + '',
                loginName: user.loginName,
                nickName: user.nickName,
                goodsRate: $scope.ratingData.ratingBars[0].value,
                content: $scope.ratingData.ratingText,
                isAnonymous: $scope.ratingData.isAnonymity,
                pics:$scope.evidencePicUrl//图片路径
            };
            if (orderType == 1) {
                params.packageRate = $scope.ratingData.ratingBars[1].value;//快递到家方式对包装的评价满意度
            } else {
                params.serviceRate = $scope.ratingData.ratingBars[1].value;//免税店自取方式对服务的评价满意度
                params.packageRate = $scope.ratingData.ratingBars[2].value;//免税店自取方式对包装的评价满意度
            }
            //$http.post(url,params)
            remarkGoodsService.getRemarkGoods(params)
                .success(function (response) {
                    //网络异常、服务器出错
                    if (!response) {
                        return;
                    }
                    if (response.code == 1) {
                        if($scope.comPrize && $scope.comPrize.display && response.data.txt){
                            popupService.toastr(response.data.txt);
                        }else{
                            popupService.toastr('评价成功');
                        }
                        $rootScope.$broadcast("order:refreshOrderList");//刷新订单列表
                        $rootScope.goBack();
                    } else {
                        var errorText = response.data.txt ? response.data.txt : '评价失败';
                        popupService.toastr(errorText);
                    }
                }).error(function (response) {
                    popupService.toastr(cdfg.getMsg('NETWORK_ERROR'));
                }).finally(function(){
                });
        }

        //提交评价
        function submitRemark() {
            //页面逻辑判断
            if ($scope.ratingData.ratingBars[0].value == 0) {
                popupService.toastr('请完成商品满意度评分');
                return;
            } else {
                if (orderType == 1) {
                    if ($scope.ratingData.ratingBars[1].value == 0) {
                        popupService.toastr('请完成商品包装满意度评分');
                        return;
                    }
                } else {
                    if ($scope.ratingData.ratingBars[1].value == 0) {
                        popupService.toastr('请完成服务满意度评分');
                        return;
                    } else if ($scope.ratingData.ratingBars[2].value == 0) {
                        popupService.toastr('请完成商品包装满意度评分');
                        return;
                    }
                }
            }
            if ($scope.ratingData.ratingText.length < 10) {
                popupService.toastr('评价内容不能少于10个字');
                return;
            } else if ($scope.ratingData.ratingText.length > 500) {
                popupService.toastr('评价内容不能多于500个字');
                return;
            }else{
                if ($scope.imageList.length == 0) {
                    isSubmit();//提交数据
                } else {
                    isUploadSuccess = true;
                    $ionicLoading.show({template: '正在上传图片...'});
                    //上传图片
                    for (var i = 0, len = $scope.imageList.length; i < len; i++) {
                        if (isUploadSuccess) {
                            uploadImage($scope.imageList[i]);
                        }
                    }
                }
            }

        }

        //checkbox选择
        function checkAnonymity() {
            $scope.ratingData.isAnonymity = !$scope.ratingData.isAnonymity;
        }

        /*上传图片*/
        $scope.addImage = function () {

            // Show the action sheet
            var hideSheet = $ionicActionSheet.show({
                titleText: '<b>上传图片</b>',
                buttons: [
                    {text: '拍摄照片'},
                    {text: '从相册中选择'}
                ],
                buttonClicked: function (index) {
                    switch (index) {
                        case 0:
                            $scope.takePicture();
                            break;
                        case 1:
                            $scope.pickImage();
                            break;
                    }
                    return true;
                },
                cancelText: '取消',
                cancel: function () {
                    // add cancel code..
                }
            });


        };

        //从本地相册选择图片
        function pickImage() {
            var options = {
                maximumImagesCount: 5-$scope.imageList.length,
                width: 800,
                height: 800,
                quality: 80
            };
            $cordovaImagePicker.getPictures(options).then(function (results) {
                for (var i = 0, len = results.length; i < len; i++) {
                    $scope.imageList.push(results[i]);
                }
            }, function (error) {
                popupService.toastr('获取图片失败');
            });
        }


        //拍照
        function takePicture() {
            //$cordovaCamera.cleanup();
            var options = {
                quality: 100,
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType.CAMERA,
                encodingType: Camera.EncodingType.JPEG
            };

            $cordovaCamera.getPicture(options).then(function (imageUrl) {
                $scope.imageList.push(imageUrl);
            }, function (err) {
                // An error occured. Show a message to the user
                popupService.toastr('获取照片失败');
            });

        }

        // 将图片上传到服务器
        function uploadImage(imageURI) {
            var fileOptions = new FileUploadOptions(); //文件参数选项
            fileOptions.fileKey = "file";//向服务端传递的file参数的parameter name
            fileOptions.fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);//文件名
            fileOptions.mimeType = "image/jpeg";//文件格式，默认为image/jpeg

            var fileTransfer = new FileTransfer();//文件上传类
            fileTransfer.onprogress = function (progressEvt) {//显示上传进度条

            };
            fileTransfer.upload(imageURI, encodeURI(uploadImageUrl), uploadSuccess, uploadFail, fileOptions);
        }

        //图片上传成功
        function uploadSuccess(result) {
            isUploadSuccess = true;
            var response = JSON.parse(result.response);
            if (response.code == 1) {
                if ($scope.evidencePicUrl == '') {
                    $scope.evidencePicUrl += response.rid;
                } else {
                    $scope.evidencePicUrl += (',' + response.rid);
                }
                imageSuccessCount++;

                //最后一个图片成功提交后
                if (imageSuccessCount == $scope.imageList.length) {
                    $ionicLoading.hide();
                    isSubmit();//提交数据
                }
            } else {
                popupService.toastr('图片上传失败');
            }
        }

        //图片上传失败
        function uploadFail(error) {
            isUploadSuccess = false;
            $ionicLoading.hide();
            popupService.toastr('图片上传失败');
        }



        // 点击图片放大
        $scope.toZoomImages = function(index){
            $ionicModal.fromTemplateUrl('templates/personal/order/image-zoom.html',{
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal){
                $scope.modalImageZoom = modal;
                $scope.modalImageZoom.show();
                $scope.indexObj = {'index':index}; //当前索引
                $scope.clearDel = true;  //是否显示删除按钮
                $scope.urlImg = true;
            });
        }

    }]);