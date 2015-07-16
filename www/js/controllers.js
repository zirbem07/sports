angular.module('sports.controllers', [])

    .controller('LoginCtrl', function($scope, $state, $ionicUser, User) {
        $scope.user = {};

        $scope.signUp = function(){
          $state.go('signUp');
        };

        $scope.login = function() {
            Parse.User.logIn($scope.user.username, $scope.user.password,
                {
                    success: function(user){
                        $ionicUser.identify({
                            user_id: user.id,
                            name: user.attributes.username,
                            message: 'User Login'
                        });
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
    .controller('SignUpCtrl', function($scope, $state, $ionicUser, User) {
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
                            $ionicUser.identify({
                                user_id: user.id,
                                name: user.attributes.username,
                                message: 'User SignUp'
                            });
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
            $scope.balance = User.current.attributes.balance;
            $scope.modal.show();
        };

        $scope.closeModal = function(response) {
            $scope.modal.hide();
            if(response){
                var message = response.message;
                $ionicLoading.show({
                    noBackdrop: true,
                    template: message,
                    duration: 2000
                });
            }

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
                    ActiveLeagues.subscribeToLeague(
                        User.current.id, $scope.selectedLeague.id,
                        $scope.selectedLeague.name, $scope.selectedLeague.sport,
                        User.current.attributes.username
                    )
                        .then(function(data){

                            $scope.selectedLeague.enrollment++;
                            $ionicLoading.hide();
                            $scope.closeModal(data);
                        });
                }
            }, function(error){

              $scope.closeModal({message: error});

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

    .controller('ChatDetailCtrl', function($scope, $stateParams, User, ActiveLeagues, GTD, ActiveGTD, $ionicModal, $ionicLoading) {

        var userID = User.current.id;

        ActiveLeagues.getScoreboard($stateParams.leagueID).then(function (scoreboard) {
            console.log(scoreboard);
            $scope.scoreboard = scoreboard;
        });

        $ionicModal.fromTemplateUrl('templates/GTDModal.html', {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function(modal) {
          $scope.modal = modal;
        });

        $scope.openModal = function(GTD) {
          $scope.GTD = GTD.attributes;
          $scope.GTD.id = GTD.id;
          $scope.modal.show();
        };

        $scope.closeModal = function() {
          $scope.modal.hide();
        };

        $scope.GTDs = GTD.getGTD(userID, $stateParams.leagueID).then(function(data){
            if(data.length > 0){
              $scope.openModal(data[0])
            }
        });

        $scope.submit = function(){

            $ionicLoading.show({
                noBackdrop: true,
                templateUrl: 'templates/subscribing.html'
            });

           var GTDResponse = {
             userID: userID,
             leagueGTD: $scope.GTD.leagueID,
             activeLeagueID: $scope.GTD.activeLeagueID,
             GTDID: $scope.GTD.id,
             answer: $scope.GTD.choice
           };

          ActiveGTD.submitGTD(GTDResponse).then(function(response){
              GTD.updateAnswered($scope.GTD.id).then(function(){
                  $ionicLoading.hide();
                  $scope.closeModal();
              });
          }, function(reason){
            alert(reason);
          });

        }
    })

    .controller('AccountCtrl', function($scope, $state, $ionicPopup) {

      $scope.logout = function(){
        Parse.User.logOut();
        $state.go('login')
      };


      $scope.addFunds = function() {
        $scope.data = {};

        // An elaborate, custom popup
        var myPopup = $ionicPopup.show({
          template: '<input type="number" ng-model="data.amount">',
          title: 'Add Funds',
          subTitle: 'How much moneys you want bruh',
          scope: $scope,
          buttons: [
            { text: 'Cancel' },
            {
              text: '<b>Add Funds</b>',
              type: 'button-balanced',
              onTap: function(e) {
                if (!$scope.data.amount) {
                  //don't allow the user to close unless he enters wifi password
                  e.preventDefault();
                } else {
                  return $scope.data.amount;
                }
              }
            }
          ]
        });
        myPopup.then(function(res) {
          console.log('Tapped!', res);
        });
      };
    });
