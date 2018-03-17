$(document).ready(function () {

    // Array for keys
    var childKeys = [];

    // Used for timer
    var countdown;

    // Used for setting values
    var name;
    var destination;
    var frequency;
    var link;
    var firstTrain;

    // Used for updating values
    var newName;
    var newDestination;
    var newFrequency;
    var newLink;
    var newFirstTrain;
    var childID;

    // Used for time calcs
    var timePassed;
    var timeSince;
    var waitTime;
    var nextDeparture;

    // Hides update button and content on load
    $("#submit").show();
    $("#update").hide();
    $("#cancel").hide();
    $("#content").hide();
    
    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyAGkEkc-mF1CZKlPuED9HkzQHt3TLiP_64",
        authDomain: "test-activities.firebaseapp.com",
        databaseURL: "https://test-activities.firebaseio.com",
        projectId: "test-activities",
        storageBucket: "test-activities.appspot.com",
        messagingSenderId: "964997701233"
    };
    firebase.initializeApp(config);

    var database = firebase.database();

    // Time calculations
    function timeCalcs(){
        
        // Checks if the first train is in the future
        if(moment(firstTrain, "h:mm a") > moment()){
            nextDeparture = firstTrain;
            waitTime = moment(firstTrain, "h:mm a").diff(moment(), "minutes");
        } else {
            
            // Time between first train and the current time
            timePassed = moment().diff(moment(firstTrain, "h:mm a"), "minutes");
            console.log("Total Time Passed: " + timePassed);

            // Uses mod to find how many minutes have passed since the last departure
            // The remainder (i.e. mod) is how much time has passed since the last departure 
            timeSince = timePassed % parseInt(frequency);
            console.log("Time Since: " + timeSince);

            // Calculates next departure and wait time using frequenacy and last departure
            waitTime = frequency - timeSince;
            console.log("Wait Time: " + waitTime);

            nextDeparture = moment(moment().add(waitTime, "minutes")).format("h:mm a");
            console.log("Next Departure: " + nextDeparture);
        }
    }

    // Adds HTML form data to Firebase using the sync function
    $("#submit").on("click", function (event) {
        
        event.preventDefault();

        // Grabs the user entered values from the html
        name = $("#name").val().trim();
        destination = $("#destination").val().trim();
        firstTrain = $("#firstTrain").val().trim();
        frequency = $("#frequency").val().trim();
        link = $("#src-link").val().trim();

        // Clears html values from form after submit
        $("#name").val("");
        $("#destination").val("");
        $("#firstTrain").val("");
        $("#frequency").val("");
        $("#src-link").val("");

        console.log(name, destination, frequency, link, firstTrain);

        // Saving local vars into firebase as new nodes
        database.ref("trainScheduler").push({
            name: name,
            destination: destination,
            firstTrain: firstTrain,
            frequency: frequency,
            link: link,
            dateAdded: firebase.database.ServerValue.TIMESTAMP
        });
    });

    
    // EVENT - Queries Firebase on page load and each time a child is added - retuns last 20 listings. 
    database.ref("trainScheduler").orderByChild("dateAdded").limitToLast(20).on("child_added", function (snapshot) {

        // Saves data from Firebase into local vars
        name = snapshot.val().name;
        destination = snapshot.val().destination;
        frequency = snapshot.val().frequency;
        link = snapshot.val().link;
        firstTrain = snapshot.val().firstTrain;
        
        // Stores the child's Key ID
        childID = snapshot.key;
        console.log("Child ID: " + childID);

        // Stores child key's in array
        if (childKeys.indexOf(childID) === -1){
            childKeys.push(childID);
        }

        // Runs time calculations
        timeCalcs();

        // Adds updated vars to html with jQuery
        // Child ID is added to each item so we can manipulate later
        var newRow = $("<tr>");
        $("#tableRows").append(newRow);
        
        var newName = $("<td>").html(name);
        newName.attr("class", "name");
        newName.attr("id", "name" + childID);
        newRow.append(newName);
        
        var newDestination = $("<td>").html(destination);
        newDestination.attr("class", "destination");
        newDestination.attr("id", "destination" + childID);
        newRow.append(newDestination);
        
        var newFrequency = $("<td>").html(frequency);
        newFrequency.attr("class", "frequency");
        newFrequency.attr("id", "frequency" + childID);
        newRow.append(newFrequency);
        
        var nextArrival = $("<td>").html(nextDeparture);
        nextArrival.attr("class", "next-arrival");
        nextArrival.attr("id", "next-arrival" + childID);
        newRow.append(nextArrival);
        
        var newWaitTime = $("<td>").html(waitTime);
        newWaitTime.attr("class", "wait-time");
        newWaitTime.attr("id", "wait-time" + childID);
        newRow.append(newWaitTime);
       
        var newSelectButton = $("<button>").html("Select");
        newSelectButton.attr("data", nextDeparture);
        newSelectButton.attr("childID", childID);
        newSelectButton.attr("class", "btn select my-1 mx-1");
        newRow.append(newSelectButton);
       
        var newDeleteButton = $("<button>").html("Delete");
        newDeleteButton.attr("childID", childID);
        newDeleteButton.attr("class", "btn delete my-1 mx-1");
        newRow.append(newDeleteButton);

        var newEditButton = $("<button>").html("Edit");
        newEditButton.attr("childID", childID);
        newEditButton.attr("class", "btn edit my-1 mx-1");
        newRow.append(newEditButton);

    });


    // EVENT - Starts timer and media for selected train
    $(document).on("click", ".select", function () {
        
        $("#header").hide();
        $("#content").show();
    
        // Clears any prior intervals
        clearInterval(countdown);

        // Stores departure time from attr 
        var selectedDepartTime = $(this).attr("data");
        console.log("Selected Depart Time: " + selectedDepartTime);
        
        // Calculate seconds until departure
        var secondsRemaining = moment(selectedDepartTime, "h:mm a").diff(moment(), "seconds");
        console.log("Seconds Remaining: " + secondsRemaining);

        // Updates the HTML
        $("#wait-time").text(secondsRemaining);

        // Starts countdown timer
        countdown = setInterval(function () {
            timer();
            }, 1000);

        // Timer countdown function
        function timer() {
            secondsRemaining--;
            $("#wait-time").text(secondsRemaining);
        }

        // Looks up child key
        childID = $(this).attr("childID");
        console.log("Select: " + childID);

        // Queries the child node so we can save the values to a local var    
        database.ref("trainScheduler/"+childID).once("value", function(snapshot){
            link = snapshot.val().link;
        });

        // Set iFrame in HTML from link var
        $("#video").html(link);

    });
    

    // EVENT - Deletes a child node
    $(document).on("click", ".delete", function () {
        childID = $(this).attr("childID");
        console.log("Delete: " + childID);
        database.ref().child("trainScheduler").child(childID).remove();
        alert("Removed");

        // Hides row on HTML
        $(this).parent().hide();
    });


    // EVENT - Edits a child node
    $(document).on("click", ".edit", function () {
    childID = $(this).attr("childID");
    console.log("Edit: " + childID);

        // Queries the child node so we can save the values to a local var    
        database.ref("trainScheduler/"+childID).once("value", function(snapshot){
            newName = snapshot.val().name;
            newDestination = snapshot.val().destination;
            newFrequency = snapshot.val().frequency;
            newLink = snapshot.val().link;
            newFirstTrain = snapshot.val().firstTrain;
            console.log(newName,newDestination,newFrequency,newLink,newFirstTrain)
        
            // Push local var to HTML with JQ
            $("#name").val(newName);
            $("#destination").val(newDestination);
            $("#firstTrain").val(newFirstTrain);
            $("#frequency").val(newFrequency);
            $("#src-link").val(newLink);

            // Change input box
            $("#addTrainsHeader").text("Edit Train Information");
            // $("#addTrainsForm).css( "background-color", "red" );


            $("#submit").hide();
            $("#update").show();
            $("#cancel").show();
        });
    });


    // EVENT - Updates the selected row's train information
    $(document).on("click", "#update", function (event) {
    
        event.preventDefault();

        // Grabs the user entered values from the html
        name = $("#name").val().trim();
        destination = $("#destination").val().trim();
        firstTrain = $("#firstTrain").val().trim();
        frequency = $("#frequency").val().trim();
        link = $("#src-link").val().trim();

        // blank out forms after submit
        $("#name").val("");
        $("#destination").val("");
        $("#firstTrain").val("");
        $("#frequency").val("");
        $("#src-link").val("");

        console.log(name, destination, frequency, link, firstTrain);

        // saves local vars into firebase as new nodes
        database.ref("trainScheduler/"+childID).update({
            name: name,
            destination: destination,
            firstTrain: firstTrain,
            frequency: frequency,
            link: link,
            dateAdded: firebase.database.ServerValue.TIMESTAMP
        });

        // Change input box
        $("#addTrains").text("Add Train And Inspiration");
        $("#submit").show();
        $("#update").hide();
        $("#cancel").hide();

        alert("Train Updated");

        // Runs time claculations
        timeCalcs();
    
        // jQuery to display the updated info on html
        $("#name" + childID).html(name);
        $("#destination" + childID).html(destination);
        $("#frequency" + childID).html(frequency);
        $("#next-arrival" + childID).html(nextDeparture);
        $("#wait-time" + childID).html(waitTime);

    });


    // EVENT - Cancel the update
    $(document).on("click", "#cancel", function (event) {
        
        event.preventDefault();

        // Clears the HTML form
        $("#name").val("");
        $("#destination").val("");
        $("#firstTrain").val("");
        $("#frequency").val("");
        $("#src-link").val("");    
        
        // Change input box
        $("#addTrains").text("Add Train And Inspiration");
        $("#submit").show();
        $("#update").hide();
        $("#cancel").hide();

    });

    // EVENT - Pick random video
    $("#shuffle").on("click", function () {

        if(childKeys.length<1){
            alert("No Videos To Display");
        } else {
            var luck = Math.floor(Math.random() * childKeys.length);
            // maybe add while loop to prevent two back to back picks of same number

            console.log("Luck Picked Array Spot: " + luck);
            var luckChildID = childKeys[luck]; 

            database.ref("trainScheduler/"+luckChildID).once("value", function(snapshot){
                var video = snapshot.val().link;
            });

            $("#video").html(video);

        }
        // See if array is empty
        // Generate random number based on array lenght 
        // Use random number to select a random child key
        // Store link from firebase in local var
        // Set var to html with JQ

    });



});
