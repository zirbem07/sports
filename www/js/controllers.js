angular.module('sports.controllers', [])

    .controller('LoginCtrl', function($scope, $state, User) {
        $scope.user = {email: "test@test.com", password: "test"};

        $scope.login = function() {
            Parse.User.logIn($scope.user.email, $scope.user.password,
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
                    $scope.user.email,
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
        $scope.closeModal = function() {
            $scope.modal.hide();
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
                            $scope.closeModal();
                        });
                }
            });
        }
    })

    .controller('ChatsCtrl', function($scope, myLeagues) {

        $scope.myLeagues = [];

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
            $scope.myLeagues.push(value.attributes);
        });

    })

    .controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
        $scope.chat = Chats.get($stateParams.chatId);
    })

    .controller('AccountCtrl', function($scope) {
        $scope.settings = {
            enableFriends: true
        };
    });
