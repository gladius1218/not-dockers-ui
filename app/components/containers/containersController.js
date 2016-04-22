angular.module('containers', [])
    .controller('ContainersController', ['$scope', '$http', 'Container', 'Settings', 'Messages', 'ViewSpinner',
        function ($scope, $http, Container, Settings, Messages, ViewSpinner) {
            $scope.sortType = 'Created';
            $scope.sortReverse = true;
            $scope.toggle = false;
            $scope.displayAll = Settings.displayAll;

            $scope.order = function (sortType) {
                $scope.sortReverse = ($scope.sortType === sortType) ? !$scope.sortReverse : false;
                $scope.sortType = sortType;
            };

            var update = function (data) {
                ViewSpinner.spin();
                Container.query(data, function (d) {
                    $scope.containers = d.map(function (item) {
                        return new ContainerViewModel(item);
                    });
                    ViewSpinner.stop();
                });
            };

            var batch = function (items, action, msg) {
                ViewSpinner.spin();
                var counter = 0;
                var complete = function () {
                    counter = counter - 1;
                    if (counter === 0) {
                        ViewSpinner.stop();
                        update({all: Settings.displayAll ? 1 : 0});
                    }
                };
                angular.forEach(items, function (c) {
                    if (c.Checked) {
                        if (action === Container.start) {
                            Container.get({id: c.Id}, function (d) {
                                c = d;
                                counter = counter + 1;
                                action({id: c.Id, HostConfig: c.HostConfig || {}}, function (d) {
                                    Messages.send("Container " + msg, c.Id);
                                    var index = $scope.containers.indexOf(c);
                                    complete();
                                }, function (e) {
                                    Messages.error("Failure", e.data);
                                    complete();
                                });
                            }, function (e) {
                                if (e.status === 404) {
                                    $('.detail').hide();
                                    Messages.error("Not found", "Container not found.");
                                } else {
                                    Messages.error("Failure", e.data);
                                }
                                complete();
                            });
                        }
                        else {
                            if(action == Container.scan){
                                alert("test: scan function activated")
                                var request_string = 'http://10.10.10.11:9999/scan/' + c.Id
                                console.log(request_string)
                                $http.get(request_string).then(function(result){
                                    console.log(result);
                                    alert('Container scnaed, please go to elastic plugin to see result');
                                });
                                action({id: c.Id}, function (d) {
                                    Messages.send("Container " + msg, c.Id);
                                    var index = $scope.containers.indexOf(c);
                                    complete();
                                }, function (e) {
                                    Messages.error("Failure", e.data);
                                    complete();
                                });
                            }
                            else{
                                action({id: c.Id}, function (d) {
                                    Messages.send("Container " + msg, c.Id);
                                    var index = $scope.containers.indexOf(c);
                                    complete();
                                }, function (e) {
                                    Messages.error("Failure", e.data);
                                    complete();
                                });
                            }
                        }
                    }
                });
                if (counter === 0) {
                    ViewSpinner.stop();
                }
            };

            $scope.toggleSelectAll = function () {
                angular.forEach($scope.filteredContainers, function (i) {
                    i.Checked = $scope.toggle;
                });
            };

            $scope.toggleGetAll = function () {
                Settings.displayAll = $scope.displayAll;
                update({all: Settings.displayAll ? 1 : 0});
            };

            $scope.startAction = function () {
                batch($scope.containers, Container.start, "Started");
            };

            $scope.stopAction = function () {
                batch($scope.containers, Container.stop, "Stopped");
            };

            $scope.restartAction = function () {
                batch($scope.containers, Container.restart, "Restarted");
            };

            $scope.killAction = function () {
                batch($scope.containers, Container.kill, "Killed");
            };

            $scope.pauseAction = function () {
                batch($scope.containers, Container.pause, "Paused");
            };

            $scope.unpauseAction = function () {
                batch($scope.containers, Container.unpause, "Unpaused");
            };

            $scope.removeAction = function () {
                batch($scope.containers, Container.remove, "Removed");
            };
            $scope.scanAction = function () {
                batch($scope.containers, Container.scan, "Scaned");
                };

            update({all: Settings.displayAll ? 1 : 0});
        }]);
