<<<<<<< Updated upstream
﻿// myApp.js
Teams = new Mongo.Collection("teams");

//////// BEGIN User Data Model Schema Definition
Schema = {};

// the definitions in comments can help to create more complex validations for the data model
// that is why i am keeping them in the code for the time being as reference
/*
userSchema.UserCountry = new SimpleSchema({
    name: {
        type: String
    },
    code: {
        type: String,
        regEx: /^[A-Z]{2}$/
    }
});

userSchema.UserProfile = new SimpleSchema({
    firstName: {
        type: String,
        regEx: /^[a-zA-Z-]{2,25}$/,
        optional: true
    },
    lastName: {
        type: String,
        regEx: /^[a-zA-Z]{2,25}$/,
        optional: true
    },
    birthday: {
        type: Date,
        optional: true
    },
    gender: {
        type: String,
        allowedValues: ['Male', 'Female'],
        optional: true
    },
    organization : {
        type: String,
        regEx: /^[a-z0-9A-z .]{3,30}$/,
        optional: true
    },
    website: {
        type: String,
        regEx: SimpleSchema.RegEx.Url,
        optional: true
    },
    bio: {
        type: String,
        optional: true
    },
    country: {
        type: userSchema.UserCountry,
        optional: true
    }
});
*/
Schema.User = new SimpleSchema({
		_id: {
			type: String,
			optional: true
		},
    username: {
        type: String,
        regEx: /^[a-z0-9A-Z_]{3,15}$/
    },
    emails: {
        type: [Object],
        // this must be optional if you also use other login services like facebook,
        // but if you use only accounts-password, then it can be required
        optional: false
    },
    "emails.$.address": {
        type: String,
        regEx: SimpleSchema.RegEx.Email
    },
    "emails.$.verified": {
        type: Boolean
    },
    createdAt: {
        type: Date
    },
    profile: { // this is public and modifieable
        type: Object, // use either "Object" or "userSchema.UserProfile" if its defined above
        optional: true
    },
    services: {
        type: Object,
        optional: true,
        blackbox: true
    },
		teams: {
        type: [String],
        optional: true,
        blackbox: true
    },
		faction: {
			type: String,
			optional: true
		},
		latest_thread: {
			type: String,
			optional: true
		},

/*    
		// Add `roles` to your schema if you use the meteor-roles package.
    // Note that when using this package, you must also specify the
    // `Roles.GLOBAL_GROUP` group whenever you add a user to a role.
    // Roles.addUsersToRoles(userId, ["admin"], Roles.GLOBAL_GROUP);
    // You can't mix and match adding with and without a group since
    // you will fail validation in some cases.
    roles: {
        type: Object,
        optional: true,
        blackbox: true
    }
*/
});

// attaching the validation scheme with the user model so we have automatic input validation
// still need to find a way to get response from the validation when it fails/ passes
Meteor.users.attachSchema(Schema.User); 

//////// END User Data Model Schema Definition

// BEGIN Auxiliary helper functions

// clear input boxes for next expected input in Team table 
var clearValuesTeam = function() {
	$(".team_name").val("").focus();
	$(".team_type").val("");
	$(".team_game").val("");
	$(".team_members1").val("");
	$(".team_members2").val("");
	$(".team_members3").val("");
	$(".team_members4").val("");
	$(".team_members5").val("");
	$(".team_captain").val("");
}

// trim helper to remove all whitespace
  var trimInput = function(val) {
    return val.replace(/^\s*|\s*$/g, "");
  }

 var checkPasswordLength = function(pw) {
    if (pw.length >= 6) {
			return true;
		}
		else {
			Notifications.warn('Password Error', 'Password needs to be atleast 8 characters length');
			return false;
		}
  }

// END Auxiliary helper functions

if (Meteor.isClient) {
  // This code only runs on the client
	Meteor.subscribe("teams");
	Meteor.subscribe("users");
	Meteor.subscribe("teams_pub");

  Template.body.helpers({
		teamCount: function () {
			return Teams.find({}).count();
	  },
		userSchema: function() {
			return Schema.User;
		} 
	});

	Template.body.events( {
		"click .logout": function (event) {
			Meteor.logout();
		}
	});

/*	Accounts.ui.config({
		passwordSignupFields: "USERNAME_ONLY"
	});
*/

Template.login.events( { 
  'submit .login-form' : function(event, t){
		// this is the implementation of manual login checking rather than using the "accounts-ui" package from meteor
    event.preventDefault();
    // retrieve the input field values
    var email = t.find('#login-email').value
      , password = t.find('#login-password').value;

    // Trim and validate your fields here.... 
		email = trimInput(email);
				
    // If validation passes, supply the appropriate fields to the
    // Meteor.loginWithPassword() function.
		if ( checkPasswordLength(password) ) {
     	Meteor.loginWithPassword(email, password, function(err){
     		if (err) {
     		 	// The user might not have been found, or their passwword
     		  // could be incorrect. Inform the user that their
     		  // login attempt has failed. 
					console.log("login failed : " + err);
					Notifications.error('Login Failed', 'Error');
				}
       	else {
       	  // The user has been logged in.
					Notifications.success('Login Succesfull', 'You have been logged in');
				}
     	});
		}
    return false; 
 	}
});
	
	Template.register.events({
    'submit .register-form' : function(event, t) {
      event.preventDefault();
      var email = t.find('#account-email').value   // duplication is handled for email but try delete and add same email
        , password = t.find('#account-password').value
				, username = t.find('#account-username').value;
			
      // Trim and validate the input
			email = trimInput(email);

			if ( checkPasswordLength(password) ) {  /* also include other validations here*/ 
      	Accounts.createUser(
					{ 
						username : username, 
						email: email,
						password : password 
/*    profile  : {	//publicly visible fields like firstname goes here
							wins : 0,
							losses : 0,
							teams: [0],
							faction: "White" // for teams, no team is allowed another match till image is submitted  
						}*/
					}, 
					function(err){
		        if (err) {
  	        // Inform the user that account creation failed
						console.log("registration failed : " + err);
						Notifications.error('Registration Failed', 'Error');
  	      	} else {
  	      	  // Success. Account has been created and the user
  	      	  // has logged in successfully. 
							Notifications.info('Registration Succesfull', 'You have been registered');
  	        }
        	});
			}
      return false;
    }
  });


	Template.main.events ( {
		  "submit .input-team": function (event) {
				// This function is called when the new team form is submitted by pressing enter on the last textbox "faction"
				//var text_faction = event.target.text.value;
				//console.log(event);
				console.log("inputting team");
				var name = $(".team_name").val();
				var type = $(".team_type").val();
				var game = $(".team_game").val();
				var members = [];
				members[0]=$(".team_members1").val();
				members[1]=$(".team_members2").val();
				members[2]=$(".team_members3").val();
				members[3]=$(".team_members4").val();
				members[4]=$(".team_members5").val();
				Meteor.call("addTeam", name, type, game, members);
				//event.target.text.value = "";
				clearValuesTeam();
				// prevent deform form submit			
				return false;
			},
			"click .delete_team": function () { // called when the cross button is clicked on next to a team entry
				Meteor.call("deleteTeam", this._id);
		  	},
			"click .delete_user": function () { // called when the cross button is clicked on next to a team entry
				Meteor.call("deleteUser", this._id);
		  	},
			"click .delete_team": function () {
				console.log("team to delete : " + this);				
				//Meteor.call("deleteTeam", this._id);
		  	}
		}
	);

	Template.main.helpers({
		isOwner: function() {
			return this.owner === Meteor.userId();
		},
		teams_helper: function () {
	      // return all of the teams
	      return Teams.find({});
	 	},
		users: function () {
	      // return all of the users registered in database
	      return Meteor.users.find({});
	 	}/*,
		teams: function () {
	      // return all of the users registered in database
	      return Meteor.users.find({}, {fields: {'teams': 1}});    //{fields: {'username': 1, 'emails': 1, 'teams': 1, 'faction': 1, 'latest_thread': 1}});
		}*/
	});
}  // end isClient


Meteor.methods ({	
	addTeam: function (name, type, game, members) {
		// make sure the user is logged in before inserting the entry
		if (! Meteor.userId()) {
			throw new Meteor.Error("Not Authorised");
		}
		var ranking;
		if (type === "esports")
		{
				// check for placement and check for previous rank and math
				ranking = 0;
		}
		else {
			ranking = -900;
		}


		Teams.insert({
			team_name: name, // name of the team
			team_type: type, // whether the team is in faction (black/white) or esports
			team_game: game, // game in which the team is competing
			team_captain: members[0],
			team_members: members, // assuming its an array of strings for now,  need to put in feature of autocompleting first entry as logged in user later
			team_ranking: ranking // team ranking, 
			}, function( error, result) { 
    			if ( error ) console.log ( error ); //info about what went wrong
    			if ( result ) {  //the _id of new object if successful
						console.log ( result ); 
						Notifications.info('Insert success', 'Team inserted');
					}
  		});
	},
	deleteTeam: function (teamId) {
		var teamToDelete = Teams.findOne(teamId);
		if (teamToDelete.team_id != Meteor.userId()) {
		    throw new Meteor.Error("not-authorized");
				Notifications.warn('Not authorised', 'this team belongs to another user');
		}
		else {
			Teams.remove(teamId);
			Notifications.success('Deletion Succesfull', 'The team has been deleted');
		}
	},
	deleteUser: function (userId) {
		var userToDelete = Meteor.users.findOne(userId);
		Meteor.users.remove(userId);
		Notifications.success('Deletion Succesfull', 'The user has been deleted');
	}
});

if (Meteor.isServer) {
	Meteor.publish( "teams", function () {
		return Teams.find();
	});

	Meteor.publish( "users", function () {
		//return Meteor.users.find({}, {fields:{_id: true, profile: true, emails: true, username: true}});
		return Meteor.users.find();
	});

	Meteor.publish( "teams_pub", function () {
		//return Meteor.users.find({}, {fields:{_id: true, profile: true, emails: true, username: true}});
return Meteor.users.find({}, {fields: {'teams': 1}});
	});
// 'faction': 1, 'latest_thread': 1

	Accounts.onCreateUser(function(options, user) {
		user.profile = options.profile || {};
		//nickname: "",  // what about username field ?
		user.faction = "false"; // boolean style or string style ?
		user.latest_thread = "blahblahblah";
// threads will have their own file in the database and will be replacing this value constantly based on user posting activity, the id will give back
// an href that we will display  (so meteor transform idea)
		user.teams = [ //teams ?
			"askjhd",  // game name or game number ? also need check for team id
			"2",
			"3",
			"4",
			"5",
			"6",
			"7",
			"8"
			//{game9: "9"}
			];	
	 	//user = _.extend(user, userData);
		return user;
	}); // END onCreateUser 
} // END isServer
=======
// index.js
Players = new Mongo.Collection("players");

//////// BEGIN User Data Model Schema Definition
Schema = {};

// the definitions in comments can help to create more complex validations for the data model
// that is why i am keeping them in the code for the time being as reference

/*
userSchema.UserCountry = new SimpleSchema({
    name: {
        type: String
    },
    code: {
        type: String,
        regEx: /^[A-Z]{2}$/
    }
});

userSchema.UserProfile = new SimpleSchema({
    firstName: {
        type: String,
        regEx: /^[a-zA-Z-]{2,25}$/,
        optional: true
    },
    lastName: {
        type: String,
        regEx: /^[a-zA-Z]{2,25}$/,
        optional: true
    },
    birthday: {
        type: Date,
        optional: true
    },
    gender: {
        type: String,
        allowedValues: ['Male', 'Female'],
        optional: true
    },
    organization : {
        type: String,
        regEx: /^[a-z0-9A-z .]{3,30}$/,
        optional: true
    },
    website: {
        type: String,
        regEx: SimpleSchema.RegEx.Url,
        optional: true
    },
    bio: {
        type: String,
        optional: true
    },
    country: {
        type: userSchema.UserCountry,
        optional: true
    }
});
*/
Schema.User = new SimpleSchema({
    username: {
        type: String,
        regEx: /^[a-z0-9A-Z_]{3,15}$/
    },
    emails: {
        type: [Object],
        // this must be optional if you also use other login services like facebook,
        // but if you use only accounts-password, then it can be required
        optional: false
    },
    "emails.$.address": {
        type: String,
        regEx: SimpleSchema.RegEx.Email
    },
    "emails.$.verified": {
        type: Boolean
    },
    createdAt: {
        type: Date
    },
    profile: {
        type: Object, // use either "Object" or "userSchema.UserProfile" if its defined above
        optional: true
    },
    services: {
        type: Object,
        optional: true,
        blackbox: true
    }

/*    
		// Add `roles` to your schema if you use the meteor-roles package.
    // Note that when using this package, you must also specify the
    // `Roles.GLOBAL_GROUP` group whenever you add a user to a role.
    // Roles.addUsersToRoles(userId, ["admin"], Roles.GLOBAL_GROUP);
    // You can't mix and match adding with and without a group since
    // you will fail validation in some cases.
    roles: {
        type: Object,
        optional: true,
        blackbox: true
    }
*/
});

// attaching the validation scheme with the user model so we have automatic input validation
// still need to find a way to get response from the validation when it fails/ passes
Meteor.users.attachSchema(Schema.User); 

//////// END User Data Model Schema Definition

// BEGIN Auxiliary helper functions

// clear input boxes for next expected input in Player table 
var clearValuesPlayer = function() {
	$(".player_nickname").val("").focus();
	$(".player_email").val("");
	$(".player_pw").val("");
	$(".player_teams").val("");
	$(".player_faction").val("");
}

// trim helper to remove all whitespace
  var trimInput = function(val) {
    return val.replace(/^\s*|\s*$/g, "");
  }

 var checkPasswordLength = function(pw) {
    if (pw.length >= 6) {
			return true;
		}
		else {
			Notifications.warn('Password Error', 'Password needs to be atleast 8 characters length');
			return false;
		}
  }

// END Auxiliary helper functions

if (Meteor.isClient) {
  // This code only runs on the client
	Meteor.subscribe("players");
	Meteor.subscribe("users");

  Template.body.helpers({
		playerCount: function () {
			return Players.find({}).count();
	  },
		userSchema: function() {
			return Schema.User;
		} 
	});

	Template.body.events( {
		"click .logout": function (event) {
			Meteor.logout();
		}
	});

/*	Accounts.ui.config({
		passwordSignupFields: "USERNAME_ONLY"
	});
*/

Template.login.events( { 
  'submit .login-form' : function(event, t){
		// this is the implementation of manual login checking rather than using the "accounts-ui" package from meteor
    event.preventDefault();
    // retrieve the input field values
    var email = t.find('#login-email').value
      , password = t.find('#login-password').value;

    // Trim and validate your fields here.... 
		email = trimInput(email);
				
    // If validation passes, supply the appropriate fields to the
    // Meteor.loginWithPassword() function.
		if ( checkPasswordLength(password) ) {
     	Meteor.loginWithPassword(email, password, function(err){
     		if (err) {
     		 	// The user might not have been found, or their passwword
     		  // could be incorrect. Inform the user that their
     		  // login attempt has failed. 
					console.log("login failed : " + err);
					Notifications.error('Login Failed', 'Error');
				}
       	else {
       	  // The user has been logged in.
					Notifications.success('Login Succesfull', 'You have been logged in');
				}
     	});
		}
    return false; 
 	}
});
	
	Template.register.events({
    'submit .register-form' : function(event, t) {
      event.preventDefault();
      var email = t.find('#account-email').value   // duplication is handled for email but try delete and add same email
        , password = t.find('#account-password').value
				, username = t.find('#account-username').value;
			
      // Trim and validate the input
			email = trimInput(email);

			if ( checkPasswordLength(password) ) {  /* also include other validations here*/ 
      	Accounts.createUser(
					{ 
						username : username, 
						email: email,
						password : password, 
						profile  : {	//publicly visible fields like firstname goes here
							wins : 0,
							losses : 0,
							teams: [0],
							faction: "White" // for teams, no team is allowed another match till image is submitted
						}
					}, 
					function(err){
		        if (err) {
  	        // Inform the user that account creation failed
						console.log("registration failed : " + err);
						Notifications.error('Registration Failed', 'Error');
  	      	} else {
  	      	  // Success. Account has been created and the user
  	      	  // has logged in successfully. 
							Notifications.info('Registration Succesfull', 'You have been registered');
  	        }
        	});
			}
      return false;
    }
  });


	Template.main.events ( {
		  "submit .input-player": function (event) {
				// This function is called when the new player form is submitted by pressing enter on the last textbox "faction"
				//var text_faction = event.target.text.value;
				//console.log(event);
				console.log("inputtting player");
				var nick = $(".player_nickname").val();
				var email = $(".player_email").val();
				var pw = $(".player_pw").val();
				var teams = $(".player_teams").val();
				var faction = $(".player_faction").val(); 
				Meteor.call("addPlayer", nick, email, pw, teams, faction);
				//event.target.text.value = "";
				clearValuesPlayer();
				// prevent deform form submit			
				return false;
			},
			"click .delete_player": function () { // called when the cross button is clicked on next to a player entry
				Meteor.call("deletePlayer", this._id);
		  	},
			"submit .input-team": function (event) {
				// This function is called when the new team form is submitted by pressing enter on the last textbox "team members"
				//var text_members = event.target.text.value;
				//console.log(event);
				var name = $("#team_name").val();
				var game = $("#team_game").val();
				var captain = $("#team_captain").val();
				var faction = $("#team_faction").val();
				var members = $("#team_members").val();
				Meteor.call("addTeam", name, game, captain, members, faction);
				//event.target.text.value = "";
				clearValuesTeam();
				// prevent deform form submit			
				return false;
			},
			"click .delete_team": function () {
				console.log("team to delete : " + this);				
				//Meteor.call("deleteTeam", this._id);
		  	}
		}
	);

	Template.main.helpers({
		isOwner: function() {
			return this.owner === Meteor.userId();
		},
		players: function () {
	      // return all of the players
	      return Players.find({});
	 	},
		users: function () {
	      // return all of the users registered in database
	      return Meteor.users.find({});
	 	}
	});

}  // end isClient


Meteor.methods ({	
	addPlayer: function (nick, email, pw, teams, faction) {
		// make sure the user is logged in before inserting the entry
		if (! Meteor.userId()) {
			throw new Meteor.Error("Not Authorised");
		}
		
		Players.insert({
			player_id: Meteor.userId(), // id of the player i.e. the logged in user
			player_username: Meteor.user().username, // username of logged in user/player
			player_nickname: nick, 
			player_email: email, // Email of the player
			player_pw: pw, // pw of player, yeah i know, its stupid for the timebeing
			player_teams: teams, // assuming its a single string for now, need to put support for list later
			player_faction: faction // player faction, since it has only 2 choices, maybe make it boolean later
			}, function( error, result) { 
    			if ( error ) console.log ( error ); //info about what went wrong
    			if ( result ) {  //the _id of new object if successful
						console.log ( result ); 
						Notifications.info('title', 'message');
					}
  		});
	},
	deletePlayer: function (playerId) {
		var playerToDelete = Players.findOne(playerId);
		if (playerToDelete.player_id != Meteor.userId()) {
		    throw new Meteor.Error("not-authorized");
				Notifications.warn('Not authorised', 'this player belongs to another user');
		}
		else {
			Players.remove(playerId);
			Notifications.success('Deletion Succesfull', 'The player has been deleted');
		}
	}
});

if (Meteor.isServer) {
	Meteor.publish( "players", function () {
		return Players.find();
	});

	Meteor.publish( "users", function () {
		//return Meteor.users.find({}, {fields:{_id: true, profile: true, emails: true, username: true}});
		return Meteor.users.find();
	});
}
>>>>>>> Stashed changes
