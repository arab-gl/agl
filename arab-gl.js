// myApp.js
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
		lc_user: {
        type: String,
        regEx: /^[a-z0-9_]{3,15}$/
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
};

// trim helper to remove all whitespace
var trimInput = function(val) {
	return val.replace(/^\s*|\s*$/g, "");
};

var checkPasswordLength = function(pw) {
	if (pw.length >= 6) {
		return true;
	}
	else {
		Notifications.warn('Password Error', 'Password needs to be atleast 6 characters length');
		return false;
	}
};


/**
  Add team's Reference ID to the members in that team.
**/
var addTeamToMembers = function(teamName) {
	var usr_obj;
	//alert(teamName);
	var team_obj = Teams.findOne({team_name: teamName });
	console.log(team_obj);

		//alert(team_obj );
	// loop through team members list
	console.log("team member length" + team_obj.team_members.length);
	for (var i=0;i < team_obj.team_members.length; i++) {
		console.log("team member name" + i + " " + team_obj.team_members[i]);

		//		alert("curret name is " + team_obj.team_members[i]);
		// currently this is a hack to simplfy for the time being, need to later add proper validation
		user_obj = Meteor.users.findOne({lc_user: team_obj.team_members[i].toLowerCase()});
		console.log("user name " + user_obj.username + "user name " + user_obj.teams.length);
		if (user_obj.teams.length < 9)
		{
			// add team_id to user team list and update it into db
		Meteor.users.update({_id: user_obj._id}, 
												{$push: {teams: team_obj.team_name}},  // shld i use team_name or team_lc_name ?
												function( error, affected_docs) {
								    			if ( error ) console.log ( error ); //info about what went wrong
								    			if ( affected_docs ) {  //the number of docs updated with new info
														console.log ( affected_docs ); 
													}
								  			});
		}
	}
};

/**
 remove team's Reference ID to the members in that team.
**/
var removeTeamFromMembers = function(teamId) {
	var usr_obj;
	//alert(teamName);
	var team_obj = Teams.findOne({_id: teamId });
	//console.log(team_obj);

	//alert(team_obj );
	// loop through team members list
	//console.log("team member length" + team_obj.team_members.length);
	for (var i=0;i < team_obj.team_members.length; i++) {
		console.log("team member name " + i + " " + team_obj.team_members[i]);

		//		alert("curret name is " + team_obj.team_members[i]);
		// currently this is a hack to simplfy for the time being, need to later add proper validation
		user_obj = Meteor.users.findOne({username: team_obj.team_members[i]});
		//console.log("user name " + user_obj.username + "user length " + user_obj.teams.length);
		if ( user_obj.teams.length > 0)
		{
			//alert("current user to be deleted is "+user_obj.username);
			// add team_id to user team list and update it into db
		Meteor.users.update({_id: user_obj._id}, 
												{$pull: {teams: team_obj.team_name}},  // shld i use team_name or team_lc_name ?
												function( error, affected_docs) {
								    			if ( error ) console.log ( error ); //info about what went wrong
								    			if ( affected_docs ) {  //the number of docs updated with new info
														console.log ( affected_docs ); 
													}
								  			});
		}
	}
};

/**
  when the user is deleted we need to remove him from the teams he is already enrolled in 
**/
var removeUserFromTeams = function(userId) {
	var team_obj;
	//alert(teamName);
	var user_obj = Meteor.users.findOne({_id: userId });
	//console.log(user_obj);

	// loop through user teams list
	//console.log("user team length" + user_obj.teams.length);
	for (var i=0;i < user_obj.teams.length; i++) {
		console.log("user team name " + i + " " + user_obj.teams[i]);

		//		alert("curret team is " + user_obj.teams[i]);
		// currently this is a hack to simplfy for the time being, need to later add proper validation
		team_obj = Teams.findOne({team_name: user_obj.teams[i]});
		//console.log("team name " + team_obj.team_name + "team member length " + team_obj.team_members.length);
		if ( team_obj.team_members.length > 0)
		{
			//alert("current team to be deleted is "+team_obj.team_name);
			// remove user_id from team member list and update it into db
		Teams.update( {_id: team_obj._id}, 
									{$pull: {team_members: user_obj.username}},  
									function( error, affected_docs) {
								  	if ( error ) console.log ( error ); //info about what went wrong
								  	if ( affected_docs ) {  //the number of docs updated with new info
											console.log ( affected_docs ); 
										}
								  });
		}
	}
};



var createTeam = function(name, type, game, members)
{
	// push into databse
	//alert("trying to get id");
	//alert("id is "+ name);
	Meteor.call("addTeam", name, type, game, members);
	Notifications.info('Insert success', 'Team inserted');
	console.log("team_id input into db + " + name);

	//event.target.text.value = "";
	clearValuesTeam();
	//alert("adding");
	// adding the team id to the members team list
	addTeamToMembers(name);
};

var validateTeamDetails = function(name, type, game, members) 
{
	var i,j;
	// this is going to check for all lookup entries and will be case insensitive
	var searched_teamname = name.toLowerCase();
	//alert(members[0] + " " + members[1] + " " + members[2]+ " " + members[3]+ " " + members[4]);
	// WE WANT TO CHECK FOR A DUPLICATE TEAM
	//alert("existing team inc" + Teams.findOne({team_lc_name: searched_teamname } ));
	console.log("chcking team duplicate name");
	if ( ! ( Teams.findOne({team_lc_name: searched_teamname } ) === undefined))
	{
		Notifications.warn('team  already exists', 'choose different name'); 
		console.log("team name duplicate exists in db");
		//clear the boxes
		return false;
	}
	console.log("team name verfied unique");
	//alert("unique team name");
	//alert("finished checking team duplicate"); 

	console.log("checking duplicate members in team list");
	// the following code handles duplicate members in the team creation area
	for (i=0; i< members.length; i++)
	{
		//console.log("i loop " + i + " " + members[i] );
		for (j=i+1;j<members.length; j++)
		{
			//console.log("j loop " + i + " " + members[i] );
			if (members[i].localeCompare(members[j])===0)
			{
				console.log("duplicate found " + i + " " + members[i] + " and " + j + " " + members[j]);
				Notifications.warn('Duplicated member found', 'please make sure no duplicates exist');
				clearValuesTeam();
				return false;
			}
		}
	}
	console.log("all members in team list verfied unique");

	//alert("finished checking members duplicate"); 
	// NOTE: remember to move the validation to a verify function
	if ( Meteor.users.findOne({username: members[0]}) === undefined)
	{
		Notifications.warn('Member not found', 'The first member does not exist');
		return false;
	}
	else if ( Meteor.users.findOne({username: members[1]}) === undefined)
	{
		Notifications.warn('Member not found', 'The second member does not exist');
		return false;
	}
	else if ( Meteor.users.findOne({username: members[2]}) === undefined)
	{
		Notifications.warn('Member not found', 'The third member does not exist');
		return false;
	}
	else if ( Meteor.users.findOne({username: members[3]}) === undefined)
	{
		Notifications.warn('Member not found', 'The fourth member does not exist');
		return false;
	}
	else if ( Meteor.users.findOne({username: members[4]}) === undefined)
	{
		Notifications.warn('Member not found', 'The fifth member does not exist');
		return false;
	}
	// at this point we have 5 registered users and they have been validated along with exactly the team size 
	// we are supposed to use a for loop for one if statement repeated for number of members in specific game
	// if loop completes, all members are valid else a break in the loop means fail condition
	return true;
};

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
			
			// this is going to check for all lookup entries will be case insensitive
			var searched_username = username.toLowerCase();

			//alert("searchd = "+searched_username + " == " + (Meteor.users.findOne({lc_user: searched_username }) ));

			if ( ! ( Meteor.users.findOne({lc_user: searched_username } ) === undefined))
			{
					Notifications.warn('name already exists', 'choose different name'); 
					//clear the boxes
					return false;
				}

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
				
				// remember to sanitise input for security
				members[0]=$(".team_members1").val();
				members[1]=$(".team_members2").val();
				members[2]=$(".team_members3").val();
				members[3]=$(".team_members4").val();
				members[4]=$(".team_members5").val();

				// validate all the team details
				var check = validateTeamDetails(name, type, game, members); 
				console.log("check = " + check);
				if ( check )
				{
					createTeam(name, type, game, members);
				}
					// prevent default form submit			
					return false;
			},
			"click .delete_team": function (event) { // called when the cross button is clicked on next to a team entry
				event.preventDefault();
				console.log("team to delete : " + this.team_name);
				Meteor.call("deleteTeam", this._id);
				Notifications.success('Deletion Succesfull', 'The team has been deleted');
		  },
			"click .delete_user": function (event) { // called when the cross button is clicked on next to a user entry
				event.preventDefault();
				Meteor.call("deleteUser", this._id);
				Notifications.success('Deletion Succesfull', 'The user has been deleted');
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
				var users_cursor = Meteor.users.find({});
	      if (users_cursor) return users_cursor; // else do what ????
				//return ["a","b"];
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

		var lc_team = name.toLowerCase();
		var new_team_id = Teams.insert({
			team_name: name, // name of the team
			team_lc_name: lc_team, // lowercase name format of the team
			team_type: type, // whether the team is in faction (black/white) or esports
			team_game: game, // game in which the team is competing
			team_captain: members[0],
			team_members: members, // assuming its an array of strings for now,  need to put in feature of autocompleting first entry as logged in user later
			team_ranking: ranking // team ranking, 
			}, function( error, result) {
    			if ( error ) console.log ( error ); //info about what went wrong
    			if ( result ) {  //the _id of new object if successful
						console.log ( "team insert did " + result ); 
					}
  		});
			return new_team_id;
	},
	deleteTeam: function (teamId) {
		//var teamToDelete = Teams.findOne(teamId);
		/*if (teamToDelete.team_id != Meteor.userId()) {
		    throw new Meteor.Error("not-authorized");
				Notifications.warn('Not authorised', 'this team belongs to another user');
		}
		else */    // Note use this code later on for authorising deletion of teams belong ing to user only
		{
			removeTeamFromMembers(teamId);
			Teams.remove(teamId);
		}
	},
	deleteUser: function (userId) {
		//var userToDelete = Meteor.users.findOne(userId);
		removeUserFromTeams(userId);
		Meteor.users.remove(userId);
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
		user.lc_user = options.username.toLowerCase(); // it is the lowercase format of the username
		//nickname: "",  // what about username field ?
		user.faction = "false"; // boolean style or string style ?
		user.latest_thread = "blahblahblah";
// threads will have their own file in the database and will be replacing this value constantly based on user posting activity, the id will give back
// an href that we will display  (so meteor transform idea)
		user.teams = [ //teams ?
			"1",  // game name or game number ? also need check for team id
			"2",
			"3",
			"4",
			"5",
			"6"
			//{game9: "9"} //starting with 8 for now
			];	
	 	//user = _.extend(user, userData);  // this code is not needed for us but do research to see what does it do (might be useful in another place)
		return user;
	}); // END onCreateUser 

	Meteor.users.allow({
		'update': function (_id,teams) {
			/* _id and teams list made visible ,
			return true to allow update */
			return true; 
		}
	});

	Teams.allow({
		'update': function (_id,team_members) {
			/* _id and team_members list made visible ,
			return true to allow update */
			return true; 
		}
	});
} // END isServer
