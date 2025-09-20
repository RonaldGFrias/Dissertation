import gorilla = require("gorilla/gorilla");

gorilla.ready(()=> {
    
    gorilla.populate('#gorilla', 'main', { });

    var saveThis = 'hidden'; // text fields that saves data should not be shown; can be shown in testing
    
    
    //audio 
    
    var explosion_audio = new Audio (gorilla.stimuliURL('explode.mp3'));
    var collection_audio = new Audio(gorilla.stimuliURL('collect.mp3'));
    //var inflate_audio = new Audio(gorilla.stimuliURL('inflate.mp3'));
  
    // initialize values
    var round = 0;
    var start_size = 100; // start value of widht & height of the image; must correspond to the value that is specified for the #ballon id in style.css
    var increase = 5; // number of pixels by which balloon is increased each pump
    var size; // start_size incremented by 'increase'
    var pumps; 
    var total = 0; // money that has been earned in total
    var rounds_played = 30;
    //var explode_array =  [31, 80,  63, 53, 20,  26, 60,  75, 89,  72,  88,  77, 43, 22,  83,  86,  57,  14, 9,  90,  56,  41,  56,  27, 98,  42, 76,  18,  43,  95];
    var explode_array =  [44, 32, 24, 33, 22, 23, 44, 22, 31, 20, 36, 40, 40, 45, 30, 22, 14, 36, 46, 13, 30, 32, 36, 55, 45, 57, 51, 17, 8, 25];
    var maximal_pumps = 64;
    var pumpmeup; // number pumps in a given round; is updated each round
    var number_pumps = []; // arrays for saving number of pumps
    var exploded = []; // array for saving whether ballon has exploded
    var explosion; // will an explosion occur? 1 = yes, 0 = no
    var last_win = 0; // initialize variable that contains the win of the previous round
    var current_value = 0;
    
    // initialize language
    var noOfTrials = 30;
    var label_press = 'Inflate Balloon';
    var label_collect = 'Collect Points';
    var label_balance = 'Total Points Earned:';
    var label_currency = ' Points';
    var label_header = 'Balloon Number ';
    var label_gonext1 = 'Start next round';
    var label_gonext2 = 'End game';
    var msg_explosion1 = '<p>The balloon burst at ';
    var msg_explosion2 = ' <p> You did not collect any points this round.</p>';
    
    var label_current_points = 'Points Earned: ';
    var label_current_pumps = 'Number of pumps: '
    
    var msg_collect1 = '<p>The balloon did not burst!</p><p>You have collected ';
    var msg_collect2 = ' points.</p><p> Your points are added to your total score.</p>';
    
    var msg_end1 = '<p>Well done, you earned ';
    var msg_end2 = ' points in total!. </p>';
    
    var err_msg = 'You need to inflate the balloon at least once in order to earn points. Press the inflate balloon button below"';
  
    
    // initialize labels
    $('#press').html(label_press); 
    $('#collect').html(label_collect);
    $('#total_term').html(label_balance);
    $('#total_value').html(total+label_currency);
    
    $('#current_points_label').html(label_current_points);
    $('#current_points_value').html(current_value+label_currency);
    
    $('#current_pumps_label').html(label_current_pumps);
    $('#current_pumps_value').html(pumps);
    
    // below: create functions that define game functionality
    
    // what happens when a new round starts
    var new_round = function() {
        console.log(number_pumps);
        console.log(exploded);
        $('#gonext').hide();
        $('#message').hide();  
        $('#collect').show();
        $('#press').show();
        round += 1;
        size = start_size;
        pumps = 0;
        $('#current_pumps_value').html(pumps);
        $('#current_points_value').html(pumps); // SW changed"current_value+label_currency" to "pumps" to reset current points at start of round
        $('#ballon').width(size); 
        $('#ballon').height(size);
        $('#ballon').show();
        $('#round').html('<h2>'+label_header+round+'/30<h2>');
    };
  
    // what happens when the game ends
    var end_game = function() {
        $('#total').remove();
        $('#collect').remove();
        $('#ballon').remove();
        $('#press').remove();
        $('#gonext').remove();
        $('#round').remove();
        $('#last_round').remove();
        $('#current_pumps_label').remove();
        $('#current_pumps_value').remove();
        $('#current_points_label').remove();
        $('#current_points_value').remove();
        $('#goOn').show();
        $('#message').html(msg_end1+total+msg_end2).show();
        // GORILLA SUPPORT - added in gorilla.finish call
        // NB I've put this inside an onclick function for the button that appears on
        // the end game screen
        $('#goOn').on('click', (event)=>{
             gorilla.finish();
        })
       
    };
    
  
    
    // message shown if balloon explodes
    var explosion_message = function() {
        $('#collect').hide();
        $('#press').hide();
        $('#message').html(msg_explosion1+pumpmeup+msg_explosion2).show();
    };
    
    // message shown if balloon does not explode
    var collected_message = function() {
        $('#collect').hide();
        $('#press').hide();    
        $('#message').html(msg_collect1+(pumpmeup*5)+msg_collect2).show();
    };  
    
    // animate explosion using jQuery UI explosion
    var balloon_explode = function() {

        // GORILLA SUPPORT - added in metric on balloon explosion
        gorilla.metric({
            pumps: pumps,
            round: round,
            exploded: explosion,
            event: 'Exploded'
        });
        // activate this if you have a sound file to play a sound
        // when the balloon explodes:
        
        explosion_audio.play();
    };  
    
    // show button that starts next round
    var gonext_message = function() {
        $('#ballon').hide();
        if (round < rounds_played) {
            $('#gonext').html(label_gonext1).show();
        } else {
            $('#gonext').html(label_gonext2).show();
        }
    };
    
    // add money to bank
    var increase_value = function() {
        $('#total_value').html(total+label_currency);
    };
    
    var show_last = function() {
        $('#last_value').html(last_win+label_currency);
    };
    
    
    //shuffle function 
    
    //Fisher Yates shuffle: 
    
    //function shuffle(array) {
    //    var currentIndex = array.length, temporaryValue, randomIndex;
    //
    //    // While there remain elements to shuffle...
    //    while (0 !== currentIndex) {
    //
    //        // Pick a remaining element...
    //        randomIndex = Math.floor(Math.random() * currentIndex);
    //        currentIndex -= 1;
    //
    //       // And swap it with the current element.
    //       temporaryValue = array[currentIndex];
    //        array[currentIndex] = array[randomIndex];
    //       array[randomIndex] = temporaryValue;
    //        }
    //
    //        return array;
    //    }


    
    // button functionalities
    
    // pump button functionality
    $('#press').click(function() {
        if (pumps >= 0 && pumps < maximal_pumps) { // interacts with the collect function, which sets pumps to -1, making the button temporarily unclickable
            explosion = 0; // is set to one if pumping goes beyond explosion point; see below
            pumps += 1;
            $('#current_pumps_value').html(pumps);
            
            current_value = (pumps*5);
            $('#current_points_value').html(current_value+label_currency);
            
            //inflate_audio.play();
            
            // GORILLA SUPPORT - added in metric on balloon pump
            gorilla.metric({
                pumps: pumps,
                round: round,
                exploded: explosion,
                event: 'Pumped'
            });
            
            if (pumps < explode_array[round-1]) {
	        size +=increase;
	        $('#ballon').width(size); 
                $('#ballon').height(size);
            } else {
	        last_win = 0;
	        pumpmeup = pumps;
	        pumps = -1; // makes pumping button unclickable until new round starts
	        explosion = 1; // save that balloon has exploded this round
	        balloon_explode();
	        exploded.push(explosion); // save whether balloon has exploded or not
	        number_pumps.push(pumpmeup); // save number of pumps
	        setTimeout(explosion_message, 1200);
	        setTimeout(gonext_message, 1200);
	        setTimeout(show_last, 1200);
            }
        }
    });
  
  
    // collect button: release pressure and hope for money
    $('#collect').click(function() {
        if (pumps === 0) {
	    alert(err_msg);
        } else if (pumps > 0) { // only works after at least one pump has been made
        
        // GORILLA SUPPORT - added in metric on balloon collect
        gorilla.metric({
            pumps: pumps,
            round: round,
            exploded: explosion,
            event: 'Collected'
        });
        
	    exploded.push(explosion); // save whether balloon has exploded or not
            // activate this if you have a sound file to play a sound
            // when the balloon does not explode:
            
	    collection_audio.play();
	    number_pumps.push(pumps); // save number of pumps
	    pumpmeup = pumps;
	    pumps = -1; // makes pumping button unclickable until new round starts
	    $('#ballon').hide();
	    collected_message();
	    gonext_message();
	    total += (pumpmeup * 5);
	    last_win = pumpmeup;
	    increase_value();
	    show_last();
        }
    });
    
    // click this button to start the next round (or end game when all rounds are played)
    $('#gonext').click(function() {
        // GORILLA SUPPORT - Amended to use noOfTrials rather than rounds played
        if (round < noOfTrials) {
            new_round();
        } else {
            end_game();
        }
    });
    
    // continue button is shown when the game has ended. This needs to be replaced
    // by a function that takes into account on which platform the BART runs (i.e.
    // how will the page be submitted?)
    $("#goOn").click(function() {
        $("form[name=f1]").submit();
    });
    
    // start the game!
    new_round();
});