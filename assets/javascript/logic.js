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

    $("#submit").on("click", function(event){

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
        

        console.log(name,destination,frequency,link,firstTrain);
        
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
        currentTime = moment();
        console.log(currentTime);
        // (cur time - start time)mod frequency

        // get number of months since start - note you set the format for your input in the area right after we list the date
        var months = moment().diff(moment(firstTrain, "h:mm a"), "minutes");
        
        // 


        // put new local vars into html with JQ
        var newRow = $("<tr>");
            $("#tableRows").append(newRow);
        var newName = $("<td>").html(name);
            newRow.append(newName);
        var newDestination = $("<td>").html(destination);
            newRow.append(newDestination);
        var newFrequency = $("<td>").html(frequency);
            newRow.append(newFrequency);
        var nextArrival = $("<td>").html("");
            newRow.append(nextArrival);
        var waitTime = $("<td>").html("");
            newRow.append(waitTime);
        var selectButton = $("<td>").html("Select");
            selectButton.attr("data-src", link);
            newRow.append(selectButton);

        });