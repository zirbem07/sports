angular.module('sports.services', [])
.factory('Leagues', function($q){
      var Leagues = Parse.Object.extend("League",{},
          {
            selectedLeague: {},

            getOpenLeagues: function () {

              var defer = $q.defer();
              var query = new Parse.Query(this);
              query.equalTo("open", true);
              query.find({
                success: function (leagues) {
                  defer.resolve(leagues);
                },
                error: function (error) {
                  defer.reject(error);
                }
              });

              return defer.promise;
            },

            enrollInLeague: function (leagueID) {

              var defer = $q.defer();
              var query = new Parse.Query(this);
              query.get(leagueID, {
                success: function (league) {
                  if(league.attributes.size > league.attributes.enrollment)
                  {
                    league.increment('enrollment');
                    league.save(null, {
                      success: function (league) {
                        defer.resolve(true);
                      },
                      error: function (error) {
                        defer.reject(error);
                      }
                    });
                  } else {
                    defer.reject("Error: League is Full");
                  }
                },
                error: function (object, error) {
                  // error is an instance of Parse.Error.
                  console.log(error);
                  defer.reject(error);
                }
              });

              return defer.promise;
            }
      });

      return Leagues;
})
.factory('ActiveLeagues', function($q){
   var ActiveLeague = Parse.Object.extend("ActiveLeague", {},
       {
         subscribeToLeague: function(userID, leagueID, leagueName, sport){

           var defer = $q.defer();

           var query = new Parse.Query(this);
           query.equalTo("userID", userID);
           query.equalTo("leagueID", leagueID);
           query.count({
             success: function (count) {
               if(count < 1){
                 var activeLeague = new ActiveLeague();

                 activeLeague.set("userID", userID);
                 activeLeague.set("leagueID", leagueID);
                 activeLeague.set("leagueName", leagueName);
                 activeLeague.set("sport", sport);
                 activeLeague.set("score", 0);
                 activeLeague.save(null,{
                   success: function (league) {
                     defer.resolve({type: "success", message: "Success"});
                   },
                   error: function (error) {
                     defer.reject(error);
                   }
                 });
               } else {
                 defer.resolve({type: "error", message: "Error: you are already subscribed to this league!"})
               }
             },
             error: function (error) {
               defer.reject(error);
             }
           });

           return defer.promise;
         },

         getMyLeagues: function(userID) {

             var defer = $q.defer();

             var query = new Parse.Query(this);
             query.equalTo("userID", userID);
             query.find({
                 success: function (leagues) {
                     defer.resolve(leagues);
                 },
                 error: function (error) {
                     defer.reject(error);
                 }
             });

             return defer.promise;
         }
       }
   );

   return ActiveLeague;
})
.factory('GTD', function($q){
    var GTD = Parse.Object.extend("GTD", {},
        {
            countGTDs: function(userID) {

                var defer = $q.defer();
                var query = new Parse.Query(this);

                query.equalTo("userID", userID);
                query.count({
                    success: function (count) {
                        defer.resolve(count);
                    },
                    error: function (error) {
                        defer.reject(error);
                    }
                });

                return defer.promise;
            },

            checkIfLeagueHasGTDs: function(userID, leagueID) {

                var defer = $q.defer();
                var query = new Parse.Query(this);

                query.equalTo("userID", userID);
                query.equalTo("leagueID", leagueID);
                query.count({
                    success: function (count) {
                        defer.resolve(count);
                    },
                    error: function (error) {
                        defer.reject(error);
                    }
                });

                return defer.promise;
            },

            getGTD: function(userID, leagueID) {

                alert(leagueID);
                var defer = $q.defer();

                var query = new Parse.Query(this);
                alert(userID);
                query.equalTo("userID", userID);
                query.equalTo("leagueID", leagueID);
                query.find({
                    success: function(GTD){
                        console.log(GTD);
                        defer.resolve(GTD);
                    },
                    error: function(error){
                        defer.reject(error);
                    }
                });

                return defer.promise;
            }
        }
    );

    return GTD;
})
.factory('User', function() {
  return {
    current: {}
  };

});
