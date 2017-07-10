var detector = null;
$(document).ready(function(){

  var faceMode = affdex.FaceDetectorMode.LARGE_FACES;
  // var faceMode = affdex.FaceDetectorMode.SMALL_FACES;
  
  var detector = new affdex.FrameDetector(faceMode);
    
  //Enable detection of all Expressions, Emotions and Emojis classifiers.
  detector.detectAllEmotions();
  detector.detectAllExpressions();
  detector.detectAllEmojis();
  detector.detectAllAppearance();
  console.log("starting now...");
  var startTimestamp;
  detector.start();

  //Add a callback to notify when the detector is initialized and ready for runing.
  detector.addEventListener("onInitializeSuccess", function() {
    console.log("started");
    startTimestamp = (new Date()).getTime() / 1000;
    localStorage.clear();    
  });



  detector.addEventListener("onInitializeFailure", function () {
    console.log("init failed");
  });

  v = document.getElementById("video1");
  v.addEventListener('play', function () {
    if (!detector.isRunning) {
      detector.start();
      startTimestamp = (new Date()).getTime() / 1000;

    }

    var i = window.setInterval(function () {
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

  v.addEventListener('pause', function () {
    detector.stop();
    detector.reset();
  });

  var result = new Array();

  var cnt = 0;
  detector.addEventListener("onImageResultsSuccess", function (faces, image, timestamp) {  
    $('#results').html("");
    log('#results', "Timestamp: " + timestamp.toFixed(2));
    log('#results', "Number of faces found: " + faces.length);
    if (faces.length > 0) {
      log('#results', "Appearance: " + JSON.stringify(faces[0].appearance));
      log('#results', "Emotions: " + JSON.stringify(faces[0].emotions, function(key, val) {
        return val.toFixed ? Number(val.toFixed(0)) : val;
      }));
      log('#results', "Expressions: " + JSON.stringify(faces[0].expressions, function(key, val) {
       return val.toFixed ? Number(val.toFixed(0)) : val;
      }));
      log('#results', "Emoji: " + faces[0].emojis.dominantEmoji);
      log('#results', "Points: " + JSON.stringify(faces[0].featurePoints, function(key, val) {
          return val.toFixed ? Number(val.toFixed(0)) : val;
      }));
      drawFeaturePoints(image, faces[0].featurePoints);

      var jsonData = {
        'time': timestamp.toFixed(2), 'emotion': JSON.stringify(faces[0].emotions, function (key, val) {
          return val.toFixed ? Number(val.toFixed(0)) : val;
        }), 'Points': JSON.stringify(faces[0].featurePoints, function (key, val) {
          return val.toFixed ? Number(val.toFixed(0)) : val;
        }) };
      localStorage.setItem(cnt, JSON.stringify(jsonData));
      cnt = cnt + 1;
      

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
});

function log(node_name, msg) {
  $(node_name).append("<span>" + msg + "</span><br />")
}

