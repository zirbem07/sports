angular.module('sports.controllers', [])

    .controller('LoginCtrl', function($scope, $state, User) {
        $scope.user = {};

        $scope.signUp = function(){
          $state.go('signUp');
        };

        $scope.login = function() {
            Parse.User.logIn($scope.user.username, $scope.user.password,
                {
                    success: function(user){
                        User.current = Parse.User.current();
                        $state.go('tab.dash');
                    },
                    error: function(user, error){
                        console.log(error);
                        alert("An Error occured :(");
                    }
                }
            )
        }
    })
    .controller('SignUpCtrl', function($scope, $state, User) {
        $scope.user = {};

        $scope.signUp = function(){

            if($scope.user.password === $scope.user.password2){
                Parse.User.signUp(
                    $scope.user.username,
                    $scope.user.password,
                    {
                        email: $scope.user.email,
                        balance: 100
                    },
                    {
                        success: function(user){
                            User.current = Parse.User.current();
                            $state.go('tab.dash');
                        },
                        error: function(user, error){
                            console.log(error);
                            alert("An Error occured :(");
                        }
                    }
                )
            } else {
                //    TODO: Passwords do not match error
            }

        }

    })
    .controller('RootCtrl', function($scope, GTD, User){

        var userID = User.current.id;
        $scope.badge = {};

        GTD.countGTDs(userID).then(function(count) {
            $scope.badge.gtdCount = count;
        }, function(reason) {
            alert('Failed: ' + reason);
        });

    })
    .controller('DashCtrl', function($scope, $state, openLeagues, Leagues, ActiveLeagues, $ionicModal, $ionicLoading, User) {

        $scope.leagues = [];

        angular.forEach(openLeagues, function(value){
            switch(value.attributes.sport) {
                case 'Football':
                    value.attributes.img = "img/football.png";
                    break;
                case 'Basketball':
                    value.attributes.img = "img/basketball.png";
                    break;
                case 'Baseball':
                    value.attributes.img = "img/baseball.png";
                    break;
                default:
                    value.attributes.img = "img/ionic.png";
            }
            value.attributes.id = value.id;
            $scope.leagues.push(value.attributes);
        });

        $ionicModal.fromTemplateUrl('templates/subscribeModal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
        });


        $scope.openModal = function(league) {
            $scope.selectedLeague = league;
            $scope.modal.show();
        };
        $scope.closeModal = function(response) {
            $scope.modal.hide();

            var message = response.message;
            $ionicLoading.show({
              noBackdrop: true,
              template: message,
              duration: 2000
            });
        };
        //Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function() {
            $scope.modal.remove();
        });
        // Execute action on hide modal
        $scope.$on('modal.hidden', function() {
            // Execute action
        });
        // Execute action on remove modal
        $scope.$on('modal.removed', function() {
            // Execute action
        });

        $scope.subscribe = function () {

            $ionicLoading.show({
                noBackdrop: true,
                templateUrl: 'templates/subscribing.html'
            });

            Leagues.enrollInLeague($scope.selectedLeague.id).then(function(data){
                if(data){
                    //TODO: add league to active leagues
                    ActiveLeagues.subscribeToLeague(User.current.id, $scope.selectedLeague.id, $scope.selectedLeague.name, $scope.selectedLeague.sport)
                        .then(function(data){

                            $scope.selectedLeague.enrollment++;
                            $ionicLoading.hide();
                            $scope.closeModal(data);
                        });
                }
            });
        }
    })

    .controller('ChatsCtrl', function($scope, myLeagues, GTD, User) {

        $scope.myLeagues = [];
        var userID = User.current.id;

        angular.forEach(myLeagues, function(value){
            switch(value.attributes.sport) {
                case 'Football':
                    value.attributes.img = "img/football.png";
                    break;
                case 'Basketball':
                    value.attributes.img = "img/basketball.png";
                    break;
                case 'Baseball':
                    value.attributes.img = "img/baseball.png";
                    break;
                default:
                    value.attributes.img = "img/ionic.png";
            }
            value.attributes.id = value.id;

            GTD.checkIfLeagueHasGTDs(userID, value.attributes.leagueID).then(function(count){

                value.attributes.hasGTD = count;
                $scope.myLeagues.push(value.attributes);
            });

        });

    })

    .controller('ChatDetailCtrl', function($scope, $stateParams ) {

    })

    .controller('AccountCtrl', function($scope) {
        $scope.settings = {
            enableFriends: true
        };
    });
