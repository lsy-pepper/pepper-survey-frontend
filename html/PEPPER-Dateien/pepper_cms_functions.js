/*--------------------------------------------- STARTING NAOQI SESSION --------------------------------------------------------------*/
var aTextToSpeech = null;
var memory = null;
var isConnected = false;
var bSentenceFinished = false;
var timer = 0;
if (typeof QiSession !== 'undefined') {
    QiSession(function (session) {
        console.log("connected!");
        session.service("ALAnimatedSpeech").then(function (tts) {
            aTextToSpeech = tts;
        }, function (error) {
            console.log("An error occurred:", error);
        });
        session.service("ALMemory").then(function (ALMemory) {
            memory = ALMemory;
            checkIfSentenceIsFinished(); // init signal
        });
        isConnected = true;
    }, function () {
        console.log("disconnected");
    });
}
//var aTextToSpeech = null;
//var memory = null;
//var isConnected = false;
//session = null;
////QiSession(connected, disconnected, location.host);
////using qimessaging v2
//function connected(s) {
//    session = s
//    session.service("ALAnimatedSpeech").then(function (atts) {
//        aTextToSpeech = atts;
//    }, function (error) {
//        console.log("An error occurred:", error);
//    });
//    session.service("ALMemory").then(function (ALMemory) {
//        memory = ALMemory;
//    }, function (error) {
//        console.log("An error occurred:", error);
//    });
//    isConnected = true;
//    console.log("connected");
//}
//
//function disconnected(error) {
//    console.log("disconnected");
//}
//QiSession(connected, disconnected, location.host);
/*--------------------------------------------- CALLING BUTTONS --------------------------------------------------------------*/
function button(id) {
    if (memory) {
        var substring = "/";

        if (id.indexOf(substring) !== -1) {
            memory.raiseEvent("onStartBehavior", id);
            console.log("onStartBehavior: " + id);
        } else {
            memory.raiseEvent(id, true);
            console.log("using normal trigger: " + id);
        }
    }
}
/*--------------------------------------------- CHANGE LANGUAGE --------------------------------------------------------------*/
function switchLanguage(language) {
    if (memory) {
        memory.raiseEvent("onSetRobotLanguage", language)
    }
}
/*--------------------------------------------- SAYING SENTENCES --------------------------------------------------------------*/
//function saySentence(sentence) {
////    if (memory == null) {
////        QiSession.service("ALMemory").then(function (ALMemory) {
////            memory = ALMemory;
////        });
////    }
//    if (memory) {
//        memory.raiseEvent("sendSpeechToRobot", sentence);
//    }
//    // if (aTextToSpeech) { // aTextToSpeech.say(sentence); // }
//}
function stopSpeech() {
    if (aTextToSpeech) {
        aTextToSpeech._stopAll(true);
    }
}

function goHome() {
    memory.raiseEvent('onSendHome', true).then(function () {
        console.log("home send");
    });
}

function saySentence(sentence) {
    bSentenceFinished = false;
    if (sentence) {
        console.log("say: " + sentence);
        if (aTextToSpeech) {
            toggleSpeechFunctions();
            memory.raiseEvent("sendSpeechToRobot", sentence);
            /*
            timer = setInterval(function () {
                if (bSentenceFinished == false) {
                    //                    clearInterval(timer);
                }
                checkIfSentenceIsFinished();
            }, 200);
            */
            //textToSpeech.say(sentence);
        }
    } else {
        bSentenceFinished = true;
    }
}
var varToggleFunctions = 0;

function toggleSpeechFunctions(status) {
    if (status == "on") {
        if (memory) {
            memory.raiseEvent("varBlockSolitary", 0);
            memory.raiseEvent("onStartPepperDialog", 1);
            varToggleFunctions = 1;
        }
    } else if (status == "off") {
        if (memory) {
            memory.raiseEvent("varBlockSolitary", 1);
            memory.raiseEvent("onStopPepperDialog", 1);
            varToggleFunctions = 0;
        }
    }
}
/*--------------------------------------------- CHECKING SENTENCE FINISHED --------------------------------------------------------------*/
function checkIfSentenceIsFinished() {
    if (memory) {
        memory.subscriber("sentenceFinished").then(function (subscriber) {
            subscriber.signal.connect(function (state) {
                bSentenceFinished = true;
                //aTextToSpeech.say("fertig");
                console.log("fertig");
                //clearInterval(timer);
                //timer = 0;
            });
        });
    }
}
/*--------------------------------------------- LOGGING FUNCTION --------------------------------------------------------------*/
function cmsAnalytics(id, type, title) {
    if (memory) {
        memory.raiseEvent("cms_analytics", JSON.stringify({
            id: id,
            title: title,
            type: type
        }));
    }
}
/*--------------------------------------------- HELPER FUNCTIONS --------------------------------------------------------------*/
/*--------------------------------------------- FIXING VIEWPORT --------------------------------------------------------------*/
viewport = document.querySelector("meta[name=viewport]");
if (viewport != null) {
    var legacyWidth = 1280;
    var windowWidth = window.screen.width;
    var scale = (windowWidth / legacyWidth).toFixed(3);
    init_str = "initial-scale=".concat(scale.toString());
    min_str = "minimum-scale=".concat(scale.toString());
    max_str = "maximum-scale=".concat(scale.toString());
    viewport.setAttribute("content", init_str.concat(",").concat(min_str).concat(",").concat(max_str));
}
/*--------------------------------------------- CALLING HIDDEN MENU --------------------------------------------------------------*/
function passWord() {
    //setTimeout(function () {
    //    return " ";
    //}, 3000);
    var testV = 1;
    var pass1 = prompt('Bitte Passwort eingeben', ' ');
    while (testV < 3) {
        if (!pass1) history.go(-1);
        if (pass1.toLowerCase() == "1234") {
            button("onShowHiddenMenu");
            break;
        }
        testV += 1;
        var pass1 = prompt('Zugang verweigert - Passwort nicht korrekt, Bitte nochmal versuchen.', 'Passwort');
    }
    if (pass1.toLowerCase() != "password" & testV == 3) history.go(-1);
    return " ";
}
/*--------------------------------------------- MAKING BUTTONS CLICKABLE --------------------------------------------------------------*/
$(document).ready(function () {
    $(".branding-container-dark").click(function () {
        passWord();
    });
    $(".branding-container-white").click(function () {
        passWord();
    });
    $(".logo-container").click(function () {
        button("onShowCustomerLogo");
    });
    $(".home-icon").click(function () {
        console.log("go home");
        aTextToSpeech._stopAll(true);
        goHome();
    });
    $(".back-icon").click(function () {
        console.log("go home");
        aTextToSpeech._stopAll(true);
        //goHome();
    });
});
