var detector = null;
var db = openDatabase('myDB', '1.0', 'xx', 5 * 1024 * 1024);
var folder = 2; 
var no = 1;
var itv;
var startTimestamp;

db.transaction(function (tx) {
  tx.executeSql("create table if not exists emotions" + folder.toString() + '_' + no.toString() + "(time unique, nums, joy, sadness, disgust, contempt, anger, fear, surprise, valence, engagement)"); 
});

$(document).ready(function(){

  var faceMode = affdex.FaceDetectorMode.LARGE_FACES;
  // var faceMode = affdex.FaceDetectorMode.SMALL_FACES;
  detector = new affdex.FrameDetector(faceMode);

  v = document.getElementById("video1");    
  //Enable detection of all Expressions, Emotions and Emojis classifiers.
  detector.detectAllEmotions();
  detector.detectAllExpressions();
  //detector.detectAllEmojis();
  //detector.detectAllAppearance();

  log("#logs","starting now...");
  detector.start();

  v.addEventListener('play', function () {
    detector.reset();
    startTimestamp = (new Date()).getTime() / 1000;
    
    itv = window.setInterval(function () {
      var aCanvas = document.getElementById('canvas1');
      var context = aCanvas.getContext('2d');
      var imageData = context.getImageData(0, 0, 480, 320);
      var now = (new Date()).getTime() / 1000;
      var deltaTime = now - startTimestamp;
      if (detector && detector.isRunning) {
        detector.process(imageData, deltaTime);
      }
    }, 500);
    
  }, false);
  
  v.addEventListener('ended', function () {
    window.clearInterval(itv);
    console.log("clearITV");
    nextVideo();
    v.play();

    db.transaction(function (tx) {
      tx.executeSql("create table if not exists emotions"+ folder.toString() + '_' + no.toString() + "(time unique, nums, joy, sadness, disgust, contempt, anger, fear, surprise, valence, engagement)"); 
    });
  })

  //Add a callback to notify when the detector is initialized and ready for runing.
  detector.addEventListener("onInitializeSuccess", function() {
    log("#logs", "started");
    v.play();
  });

  detector.addEventListener("onInitializeFailure", function () {
    log("#logs", "init failed, restarting now...");
  });

  detector.addEventListener("onImageResultsSuccess", function (faces, image, timestamp) {  
    $('#results').html("");
    log('#results', "Timestamp: " + timestamp.toFixed(2));
    log('#results', "Number of faces found: " + faces.length);
    if (faces.length > 0) {
      //log('#results', "Appearance: " + JSON.stringify(faces[0].appearance));
      log('#results', "Emotions: " + JSON.stringify(faces[0].emotions, function(key, val) {
        return val.toFixed ? Number(val.toFixed(0)) : val;
      }));
      // log('#results', "Expressions: " + JSON.stringify(faces[0].expressions, function(key, val) {
      //  return val.toFixed ? Number(val.toFixed(0)) : val;
      // }));
      log('#results', "Emoji: " + faces[0].emojis.dominantEmoji);
      // log('#results', "Points: " + JSON.stringify(faces[0].featurePoints, function(key, val) {
      //     return val.toFixed ? Number(val.toFixed(0)) : val;
      // }));
      drawFeaturePoints(image, faces[0].featurePoints);
      //console.log(faces[0].emotions["joy"]);

      db.transaction(function (tx) {
        tx.executeSql("insert into emotions" + folder.toString() + '_' + no.toString() + " values(?,?,?,?,?,?,?,?,?,?,?)", [
          v.currentTime,
          1,
          faces[0].emotions["joy"],
          faces[0].emotions["sadness"],
          faces[0].emotions["disgust"],
          faces[0].emotions["contempt"],
          faces[0].emotions["anger"],
          faces[0].emotions["fear"],
          faces[0].emotions["surprise"],
          faces[0].emotions["valence"],
          faces[0].emotions["engagement"],
        ]
        )
      });
      

    } else {
      db.transaction(function (tx) {
        tx.executeSql("insert into emotions"+folder.toString()+'_'+no.toString()+" values(?,0,0,0,0,0,0,0,0,0,0)", [v.currentTime]);
      });
    }
  });

  //Draw the detected facial feature points on the image  
  function drawFeaturePoints(img, featurePoints) {
    var contxt = $('#canvas1')[0].getContext('2d');

    var hRatio = contxt.canvas.width / img.width;
    var vRatio = contxt.canvas.height / img.height;
    var ratio = Math.min(hRatio, vRatio);

    contxt.strokeStyle = "#FFFFFF";
    for (var id in featurePoints) {
      contxt.beginPath();
      contxt.arc(featurePoints[id].x,
        featurePoints[id].y, 2, 0, 2 * Math.PI);
      contxt.stroke();

    }
  }

  function nextVideo() {
    no += 1;
    $("#video1").attr("src", "./hci/Sessions/"+folder.toString()
      + '/' + no.toString() + ".mp4");
    
    $("#logs").append("<span>" + "./hci/Sessions/"+folder.toString()
      + '/' + no.toString() + ".mp4" + "</span><br />");
    
    if(no == 5){
      no = 1;
      folder += 1;
    }
    if(folder > 2){
      alert("done");
      v.pause();
      detector.stop();
    }  
  }
});

function log(node_name, msg) {
   $(node_name).append("<span>" + msg + "</span><br />") 
}



