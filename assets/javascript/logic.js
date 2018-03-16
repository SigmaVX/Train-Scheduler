$(document).ready(function () {

    // used for timer
    var countdown;

    // used for updating values
    var newName;
    var newDestination;
    var newFrequency;
    var newLink;
    var newFirstTrain;

    // hides update button on load
    $("#submit").show();
    $("#update").hide();
    $("#cancel").hide();
    

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

    $("#submit").on("click", function (event) {

        event.preventDefault();

        // grabs the user entered values from the html
        var name = $("#name").val().trim();
        var destination = $("#destination").val().trim();
        var firstTrain = $("#firstTrain").val().trim();
        var frequency = $("#frequency").val().trim();
        var link = $("#src-link").val().trim();

        // blank out forms after submit
        $("#name").val("");
        $("#destination").val("");
        $("#firstTrain").val("");
        $("#frequency").val("");
        $("#src-link").val("");


        console.log(name, destination, frequency, link, firstTrain);

        // saving local vars into firebase as new nodes
        database.ref("trainScheduler").push({
            name: name,
            destination: destination,
            firstTrain: firstTrain,
            frequency: frequency,
            link: link,
            dateAdded: firebase.database.ServerValue.TIMESTAMP
        });
    });

    // query firebase for each page load and child added - retun last 10 listings. 
    database.ref("trainScheduler").orderByChild("dateAdded").limitToLast(10).on("child_added", function (snapshot) {

        // save date from firebase into local vars
        name = snapshot.val().name;
        destination = snapshot.val().destination;
        frequency = snapshot.val().frequency;
        link = snapshot.val().link;
        firstTrain = snapshot.val().firstTrain;
        childID = snapshot.key;
        console.log("Child ID: " + childID);

        // total amount of time between first train of the day and the current time
        var timePassed = moment().diff(moment(firstTrain, "h:mm a"), "minutes");
        console.log("Total Time Passed: " + timePassed);

        // used mod to find how many minutes have passed since the last departure
        // calculates how many departures have happened using the frequency
        // the remainder (i.e. mod) is how much time has passed since the last departure 
        var timeSince = timePassed % parseInt(frequency);
        console.log("Time Since: " + timeSince);

        // calculates wait time using frequenacy and the amount of tiem passed since last train left
        var waitTime = frequency - timeSince;
        console.log("Wait Time: " + waitTime);

        var nextDeparture = moment(moment().add(waitTime, "minutes")).format("h:mm a");
        console.log("Next Departure: " + nextDeparture);

        // put new local vars into html with JQ
        var newRow = $("<tr>");
        $("#tableRows").append(newRow);
        var newName = $("<td>").html(name);
        newRow.append(newName);
        var newDestination = $("<td>").html(destination);
        newRow.append(newDestination);
        var newFrequency = $("<td>").html(frequency);
        newRow.append(newFrequency);
        var nextArrival = $("<td>").html(nextDeparture);
        newRow.append(nextArrival);
        var newWaitTime = $("<td>").html(waitTime);
        newRow.append(newWaitTime);
       
        var newSelectButton = $("<button>").html("Select");
        newSelectButton.attr("data", nextDeparture);
        newSelectButton.attr("class", "btn select");
        newRow.append(newSelectButton);
       
        var newDeleteButton = $("<button>").html("Delete");
        newDeleteButton.attr("childID", childID);
        newDeleteButton.attr("class", "btn delete");
        newRow.append(newDeleteButton);

        var newEditButton = $("<button>").html("Edit");
        newEditButton.attr("childID", childID);
        newEditButton.attr("class", "btn edit");
        newRow.append(newEditButton);

    });


    $(document).on("click", ".select", function () {

        // store depart time from attr 
        var selectedDepartTime = $(this).attr("data");
        console.log("Selected Depart Time: " + selectedDepartTime);
        // calculate seconds until departure
        var secondsRemaining = moment(selectedDepartTime, "h:mm a").diff(moment(), "seconds");

        // var secondsRemaining = moment(selectedDepartTime, "h:mm a").fromNow();
        console.log("Seconds Remaining: " + secondsRemaining);
        // set counter to seconds


        // Clears Any Prior Intervals
        clearInterval(countdown);

        $("#wait-time").text(secondsRemaining);

        // Sets Countdown Timer Using The Nested Function Below
        countdown = setInterval(function () {
            timer()
        }, 1000);

        // Transition Screen Timer Countdown
        function timer() {
            secondsRemaining--;
            // Adds Updated Counter To Screen
            $("#wait-time").text(secondsRemaining);
        }

    });
    
    // Deletes a child node
    $(document).on("click", ".delete", function () {
        var childId = $(this).attr("childId");
        console.log("Delete: " + childId);
        database.ref().child("trainScheduler").child(childId).remove();
        alert("Removed");

        // update html


    });


    // Edits a child node
    $(document).on("click", ".edit", function () {
    var childId = $(this).attr("childId");
    console.log("Edit: " + childId);

        // Queries child node so we can save the values to a local var    
        database.ref("trainScheduler/"+childId).once("value", function(snapshot){
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
            $("#addTrains").text("Edit Train Information");
            $("#submit").hide();
            $("#update").show();
            $("#cancel").show();
        });
    });

    $(document).on("click", "#update", function (event) {
    
        event.preventDefault();

        // grabs the user entered values from the html
        var name = $("#name").val().trim();
        var destination = $("#destination").val().trim();
        var firstTrain = $("#firstTrain").val().trim();
        var frequency = $("#frequency").val().trim();
        var link = $("#src-link").val().trim();

        // blank out forms after submit
        $("#name").val("");
        $("#destination").val("");
        $("#firstTrain").val("");
        $("#frequency").val("");
        $("#src-link").val("");


        console.log(name, destination, frequency, link, firstTrain);

        // saving local vars into firebase as new nodes
        database.ref("trainScheduler/"+childId).update({
            name: name,
            destination: destination,
            firstTrain: firstTrain,
            frequency: frequency,
            link: link,
            dateAdded: firebase.database.ServerValue.TIMESTAMP
        });

            // change input box
            $("#addTrains").text("Add Train And Inspiration");

            $("#submit").show();
            $("#update").hide();
            $("#cancel").hide();

            alert("Train Updated");
    
    });

    $(document).on("click", "#cancel", function () {
        
        // blank out forms
        $("#name").val("");
        $("#destination").val("");
        $("#firstTrain").val("");
        $("#frequency").val("");
        $("#src-link").val("");    
        
        // change input box
        $("#addTrains").text("Add Train And Inspiration");
        $("#submit").show();
        $("#update").hide();
        $("#cancel").hide();

    });

});
