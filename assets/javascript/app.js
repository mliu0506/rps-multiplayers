// Initialize Firebase
var config = {
  apiKey: "AIzaSyBwPjM5Kv8fT__31xl4eLASmRisHVwYN7U",
  authDomain: "newfirebasedb-587db.firebaseapp.com",
  databaseURL: "https://newfirebasedb-587db.firebaseio.com",
  projectId: "newfirebasedb-587db",
  storageBucket: "newfirebasedb-587db.appspot.com",
  messagingSenderId: "222777807802"
};
firebase.initializeApp(config);
var database = firebase.database();
var chatRef = database.ref('chats');
var usersRef = database.ref('users/');
var gamesRef = database.ref('players/');

var name1 = "";
var wins1 = 0;
var losses1 = 0;
var name2 = "";
var wins2 = 0;
var losses2 = 0;
var choice1 = "";
var choice2 = "";
var userKey = "";
var photo ="";

function onSignIn(googleUser) {
  var profile = googleUser.getBasicProfile();
  console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
  console.log('Name: ' + profile.getName());
  console.log('Image URL: ' + profile.getImageUrl());
  console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
  var name = profile.getName();
  var ID = profile.getId();
  var email = profile.getEmail();
  //store the photo URL
  photo = profile.getImageUrl();
  initGame(name);
  usersRef.child(userKey).update({ID:ID,photo:photo,email:email});
}

function signOut() {
  $("#signout").on("click", function() {
    var auth2 = gapi.auth2.getAuthInstance();
        auth2.signOut().then(function () {
          console.log('User signed out.');
          location.reload();
        });
  });
}

function startGame() {
      $('#name-submit').on("click", function() {
        var name = $('#name-input').val().trim();    
      initGame(name);
    });
}

function initGame(name) {    
    if (name1 === ""){
      name1 = name;
      userKey="one";
      $('.player-inputs').hide();
     usersRef.child(userKey).set({state:'connected'}); 
     gamesRef.child(userKey).set({name:name1,choice:'',wins:0,losses:0});

      $('.rock1').html('<i class="fas fa-hand-rock"></i>');
      $('.paper1').html('<i class="fas fa-hand-paper"></i>');
      $('.scissors1').html('<i class="fas fa-hand-scissors"></i>');
      
  } else if (name2 === "") {
      name2 = name;
      userKey="two";
      $('.player-inputs').hide();
      usersRef.child(userKey).set({state:'connected'}); 
      gamesRef.child(userKey).update({name:name2,choice:'',wins:0,losses:0});

      $('.rock2').html('<i class="fas fa-hand-rock"></i>');
      $('.paper2').html('<i class="fas fa-hand-paper"></i>');
      $('.scissors2').html('<i class="fas fa-hand-scissors"></i>');
  } 
  // Remove player if player1 or player2  disconnect
  usersRef.on('child_removed', function(childsnapshot) {
      var Key = childsnapshot.key;
      console.log("Disconnect : " + userKey);
      // if palyer1 disconnect, reset the player2 score
      if (Key === "one") {
        gamesRef.child("two").update({choice:'',wins:0,losses:0});
        name1 ="";
        $('.name-one').empty();
        $('.result-1').empty();
      // if palyer2 disconnect, reset the player1 score
      } else if (Key ==="two") {
        gamesRef.child("one").update({choice:'',wins:0,losses:0});
        name2 = "";
        $('.name-two').empty();
        $('.result-2').empty();
      }
      database.ref().update({
        turn : 0
      }); 
      $('.whos-turn').empty();
      $('.finalResult').empty();
      $('.player-1-choice').empty();
      $('.player-2-choice').empty();
      $('.restart-button').text("Other player left - Click to Restart.")
      $('.restart-button').append('<button class="btn btn-standard restart">Play Again</button>');
      $('.restart').on("click", function(){
        $('.restart-button').empty();
      });
  });

    // if player1 & player2 is ready
  if ((name1 !== "")&&(name2 !== "")) {
      //userKey = "other";  // this game only allow 2 players, who join in after that we assign "other" to them
      database.ref().update({turn : 1});
   }

    $('#name-input').val("");
  };


  function printResult() {
      $('.result-2').hide();
      // when ever the DB value is being update, the following function will be trigger
      database.ref().on("value",function(snapshot){
        if (snapshot.child('players').child('one').exists()){
          console.log(snapshot.val().players.one.name)
          name1 = snapshot.val().players.one.name;
          wins1 = snapshot.val().players.one.wins;
          losses1 = snapshot.val().players.one.losses;
          $('.name-one').text(name1);
          $('.result-1').text("Wins: " + wins1 + " || Losses: " + losses1);

        }
        if (snapshot.child('players').child('two').exists()){
          $('.result-2').show();
          console.log(snapshot.val().players.two.name)          
          name2 = snapshot.val().players.two.name;
          wins2 = snapshot.val().players.two.wins;
          losses2 = snapshot.val().players.two.losses;
          $('.name-two').text(name2);
          $('.result-2').text("Wins: " + wins2 + " || Losses: " + losses2);

        
          } 

          if (snapshot.child('players').child('one').exists() && snapshot.child('players').child('two').exists()){
            var turn = snapshot.val().turn; 
            $('.whos-turn').text('Player ' + turn + "'s turn!");
            $('.player-inputs').hide();
            //userKey = "other";  // this game only allow 2 players, who join in after that we assign "other" to them            
  
          console.log("turn: " + turn);

          if(turn === 1){
            $(".player-1").css("border-color","rgba(252, 176, 64, 1)");  //Player 1 turn
            $(".player-2").css("border-color","black"); 
            $('.option1').on('click', function(){
              choice1 = $(this).attr('data-id');   
              console.log(choice1); 
              gamesRef.child("one").update({choice:choice1});

              database.ref().update({
                turn : 2
              });
              $('.option1').off("click");  
            })
          }

          if(turn === 2){
            $(".player-2").css("border-color","rgba(252, 176, 64, 1)"); // Player 2 turn 
            $(".player-1").css("border-color","black"); 
            $('.option2').on('click', function(){
              choice2 = $(this).attr('data-id');
              console.log(choice2);
              
              gamesRef.child("two").update({choice:choice2});
              database.ref().update({
                turn : 1
              });    
              $('.option2').off("click");              
            })
          }

          choice1 = snapshot.val().players.one.choice
          choice2 = snapshot.val().players.two.choice

          if(snapshot.val().players.one.choice !== "" && snapshot.val().players.two.choice !== ""){
           
           $(".player-1-choice").html("<i class='fas fa-hand-" + choice1 + "'></i><BR><p class='lastActionFont'>Last Action</p>"); 
           $(".player-2-choice").html("<i class='fas fa-hand-" + choice2 + "'></i><BR><p class='lastActionFont'>Last Action</p>"); 
           compareResult();      
          }
        }  
    }, function(errorObject) {
        console.log("Errors handled: " + errorObject.code);
      });
    }

    function compareResult() {
      // Tie 
      if (choice1 === choice2) {  
          database.ref('players').child('one').update({
            choice : "",            
          })
          database.ref('players').child('two').update({
            choice : "",            
          })
          $('.finalResult').html('<h1>Tie!</h1>')     
      } // Player 2 Win
      else if (((choice1 ==='rock') && (choice2 == 'paper'))||((choice1 ==='paper') && (choice2 == 'scissors'))||((choice1 ==='scissors') && (choice2 == 'rock'))) {
        database.ref('players').child('one').update({
          choice : "",
          losses : losses1 + 1
        })
        database.ref('players').child('two').update({
          choice: "",
          wins : wins2 + 1
        })
        $('.finalResult').html('<h1>' + name2 +' Wins</h1>');
      }  //Player 1 Win
      else {
        database.ref('players').child('one').update({
          choice : "",            
          wins : wins1 + 1
        })
        database.ref('players').child('two').update({
          choice : "",            
          losses : losses2 + 1
        })
        $('.finalResult').html('<h1>'+ name1 +' Wins</h1>');

      }
      //Reset
      choice1 = "";
      choice2 = "";
    }



    function disconnect(){
      
      database.ref().on("value",function(snapshot){
      // only if palyer1 or player2 disconnect
      if ((userKey ==="one") || (userKey ==="two")) {
        console.log("userKey: "+ userKey);
        //remove the user on the userRef and gameRef, if he/she disconnect
        usersRef.child(userKey).onDisconnect().remove(); 
        gamesRef.child(userKey).onDisconnect().remove();
      }    
        

      });

    }
    function chatRoom() {
      $('#chat-submit').on("click",function(){
        var comment = $('.chat-input').val().trim();
        console.log(comment)
        if(comment !== ""){
          chatRef.push({user:userKey,message:comment,imageurl:photo});
          $('.chat-input').val(""); // empty the input text field
        }
      });

      chatRef.on("child_added",function(childSnapshot){
        var message = childSnapshot.val().message;
        var user = childSnapshot.val().user;
        var photo = childSnapshot.val().imageurl;
        var d = new Date();
        var n = d.toUTCString();
        if (user == userKey) {
          $('.chat-box').prepend('<ol class="discussion"> <li class="self"> <div class="avatar"><img src="' + photo +'"/> </div> <div class="messages"> <p> ' + message+ '</p> <time>'+ n +'</time>');
        
        } else {
          $('.chat-box').prepend('<ol class="discussion"> <li class="other"> <div class="avatar"><img src="' + photo +'"/> </div> <div class="messages"> <p> ' + message+ '</p> <time>'+ n +'</time>');
        }
      });
    
      $('#clear-all').on("click",function(){
        database.ref().set({});
        location.reload();
      });
    }
  

  $(document).ready(function(){
  startGame();
  printResult();
  chatRoom();
  disconnect();
})