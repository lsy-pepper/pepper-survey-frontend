// <script src="/libs/qi/2/qi.js"></script>
// <script src="https://www.promisejs.org/polyfills/promise-6.0.0.min.js"></script>
//

var tts;
var isReadyToSaySomething = true;
var tabletService;
var behaviorManager;

var baseUrl = "http://pepper-survey.herokuapp.com/survey";

var goodMessages = ['Cool, das freut mich. Viel Spaß weiterhin!',
  'Danke für die positive Bewertung.',
  'Danke! Hoffentlich sehen wir uns bald wieder!',
  // 'Gut? Vielen Dank.',
  'Oh wau. Ich bin geschmeichelt.',
  'Wunderbar. Gerne kannst du deine Erfahrungen an die Kudo Wand hängen.'];

var badMessages = ['Vielen Dank für deine Bewertung.',
  'Vielen Dank für deine Meinung.',
  // 'Wir versuchen, uns das nächste mal zu bessern.',
  'Schade. Gerne kannst du deine Erfahrungen an die Kudo Wand hängen.',
  'Wir freuen uns über Fiedbäck an der Kudo Wand.',
  'Wenn du Ideen zur Verbesserung hast, dann kannst du diese gerne an die Kudo Wand hängen.'];

function pleaseTalkToAProjectMember(code) {
  swal({
    type: 'error',
    title: 'Oops...',
    text: "Bitte kontaktieren Sie einen Projekt Mitarbeiter. Code: " + code
  });
}

function initALTextToSpeech(session, callback) {
  session.service("ALTextToSpeech").then(function(_tts) {
    tts = _tts;
    callback();
  }, function(error) {
    pleaseTalkToAProjectMember("tts0");
  });
}

function initALTabletService(session) {
  session.service("ALTabletService").then(function(_tabletService) {
    tabletService = _tabletService;
  }, function(error) {
    pleaseTalkToAProjectMember("ts0");
  });
}

function initALBehaviorManager(session) {
  session.service("ALBehaviorManager").then(function(_behaviorManager) {
    behaviorManager = _behaviorManager;
    // behaviorManager.stopAllBehaviors();
    // behaviorManager.isBehaviorRunning("lsy_survey/behavior_1").then(function(a) {
    //   alert(JSON.stringify(a));
    // });
    // behaviorManager.stopBehavior("lsy_survey/behavior_1").then(function(a) {
    //     // alert(JSON.stringify(a));
    // }, function(error) {
    //   pleaseTalkToAProjectMember();
    // });
    // behaviorManager.getInstalledBehaviors().then(function(a) {
    //   alert(JSON.stringify(a));
    // });
  }, function(error) {
    pleaseTalkToAProjectMember("bm0");
  });
}

function initQiSession(callback) {

  console.log("\n\n\nHello I am Pepper.\n\n\n\n")
  QiSession(function(session) {
    console.log("connected!");

    initALBehaviorManager(session);
    initALTabletService(session);
    initALTextToSpeech(session, callback);
  }, function() {
    console.log("disconnected");

    pleaseTalkToAProjectMember("qi0");
  });
}

function tryAgain() {
  isReadyToSaySomething = true;
  swal({
    type: 'Warning',
    title: 'Oops...',
    text: "Bitte versuchen Sie es erneut."
  });
}

function sayBad() {
  var message = badMessages[Math.floor(Math.random()*badMessages.length)]
  req('/down', message, 3);
}

function sayGood() {
  var message = goodMessages[Math.floor(Math.random()*goodMessages.length)]
  req('/up', message, 3)
}

function req(path, text, sec) {
  if (!isReadyToSaySomething) {
    return
  }
  isReadyToSaySomething = false;

  var http = new XMLHttpRequest();
  var url = baseUrl + path;


  http.open('POST', url, true);
  http.setRequestHeader('Content-type', 'text/plain');

  http.onreadystatechange = function() { //Call a function when the state changes.
    if (http.readyState == XMLHttpRequest.DONE && http.status == 200) {
      say(text, sec);
    } else if (http.readyState == XMLHttpRequest.DONE) {
      tryAgain();
    }
  };

  http.timeout = 5000;
  http.ontimeout = function () { tryAgain(); }

  http.send();
}

function closeApplication() {
  behaviorManager.stopAllBehaviors();
}

function say(text, sec) {
  tts.say(text);

  swal({
    title: 'Danke für deine Meinung!',
    type: 'success',
    timer: sec * 1000,
    onOpen: function() {
      swal.showLoading()
    }
  });


  wait(sec);
}

function wait(sec) {
  setTimeout(function() {
    isReadyToSaySomething = true;
    // closeApplication();
  }, sec * 1000);
}
