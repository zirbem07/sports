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
         subscribeToLeague: function(userID, leagueID, leagueName){

           var defer = $q.defer();
           var activeLeague = new ActiveLeague();

           activeLeague.set("userID", userID);
           activeLeague.set("leagueID", leagueID);
           activeLeague.set("leagueName", leagueName);
           activeLeague.save(null,{
             success: function (league) {
               defer.resolve(league);
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
.factory('User', function() {
  return {
    current: {}
  };

})
.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
  },{
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'https://pbs.twimg.com/profile_images/598205061232103424/3j5HUXMY.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'https://pbs.twimg.com/profile_images/578237281384841216/R3ae1n61.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
});
