// playerDB.js
Tasks = new Mongo.Collection("tasks");
Players = new Mongo.Collection("players");
Teams = new Mongo.Collection("teams");

var clearValuesPlayer = function() {
	$("#player_nickname").val("").focus();
	$("#player_email").val("");
	$("#player_pw").val("");
	$("#player_teams").val("");
	$("#player_faction").val("");
}

var clearValuesTeam = function() {
	$("#team_name").val("").focus();
	$("#team_game").val("");
	$("#team_captain").val("");
	$("#team_members").val("");
}

if (Meteor.isClient) {
  // This code only runs on the client
	Meteor.subscribe("tasks");
	Meteor.subscribe("players");
	Meteor.subscribe("teams");

  Template.body.helpers({
	  tasks: function () {
	      // Otherwise, return all of the tasks
	      return Tasks.find({}, {sort: {createdAt: -1}});
	  },
	  incompleteCount: function () {
		return Tasks.find({checked: {$ne: true}}).count();
	  }
	});

	Template.body.events( {
		"submit .new-task": function (event) {
			// This function is called when the new task form is submitted
			var text = event.target.text.value;
			console.log(event);
			Meteor.call("addTask", text);
			event.target.text.value = "";
			// prevent deform form submit			
			return false;
		} 
	});

	Template.task.events({

	});

	Template.task.helpers({
		isOwner: function() {
			return this.owner === Meteor.userId();
		}
	});

	Accounts.ui.config({
		passwordSignupFields: "USERNAME_ONLY"
	});


	// Function Definitions for the "main" template
	// these 2 functions are client side code and thus technically is insecure
	// in order to make them work, install insecure package in meteor and uncomment them
	/*
	Template.main.players = function() {
			return Players.find();
		}

	Template.main.teams = function() {
			return Teams.find();
		}
	*/
	
	Template.main.events (
		/*okCancelEvents ( "#brand",
			{
				ok: function(text, evt ){
					var make = $("#make").val();
					var model = $("#model").val();
					CarBrands.insert({make:make, model:model, brand:text});
					clearValues();
				}
			})*/
		{
		  "submit .input-player": function (event) {
				// This function is called when the new player form is submitted by pressing enter on the last textbox "faction"
				//var text_faction = event.target.text.value;
				//console.log(event);
				console.log("inputtting player");
				var nick = $("#player_nickname").val();
				var email = $("#player_email").val();
				var pw = $("#player_pw").val();
				var teams = $("#player_teams").val();
				var faction = $("#player_faction").val();
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
		playerCount: function () {
			return Players.find({}).count();
	  	},
		players: function () {
	      // return all of the players
	      return Players.find({});
	 	},
		teams: function () {
	      // Otherwise, return all of the teams
	      return Teams.find({});
	 	}
	});

}  // end isClient


Meteor.methods ({
	addTask: function (text) {
		// make sure the user is logged in before inserting the task
		if (! Meteor.userId()) {
			throw new Meteor.Error("Not Authorised");
		}
		
		Tasks.insert({
			text: text, 
			createdAt: new Date(), // Current time
			owner: Meteor.userId(), // id of logged in user
			username: Meteor.user().username // username of logged in user
		});
	},
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
    			if ( result ) console.log ( result ); //the _id of new object if successful
  		});
	},
	addTeam: function (name, game, captain, members, faction) {
		// make sure the user is logged in before inserting the team
		if (! Meteor.userId()) {
			throw new Meteor.Error("Not Authorised");
		}
		
		Teams.insert({
			team_name: name, // Name of the team
			team_game: game, // Game in which team is participating
			team_captain: captain, // creator of team, need to put logic to automatically fill based on which user created team entry in DB
			team_members: members, // assuming its a single string for now, need to put support for list later
			team_faction: faction // just like before, since it has only 2 choices, maybe make it boolean later
		}, function( error, result) { 
		    if ( error ) console.log ( error ); //info about what went wrong
		    if ( result ) console.log ( result ); //the _id of new object if successful
		});
	},
	deletePlayer: function (playerId) {
		var playerToDelete = Players.findOne(playerId);
		if (playerToDelete.player_id != Meteor.userId()) {
		    throw new Meteor.Error("not-authorized");
		}
		Players.remove(playerId);
	},
	deleteTeam: function (teamName) {
		var teamToDelete = Teams.findOne(teamName);
		console.log(teamToDelete);
		/*if (teamToDelete.team_id != Meteor.userId()) {
		    throw new Meteor.Error("not-authorized");
		}*/  // need logic fix
		Teams.remove(teamName);
	}
});

if (Meteor.isServer) {
	Meteor.publish( "tasks", function () {
		return Tasks.find({owner: this.userId });
	});

	Meteor.publish( "players", function () {
		return Players.find();
	});

	Meteor.publish( "teams", function () {
		return Teams.find();
	});
}
