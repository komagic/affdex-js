var detector = null;
$(document).ready(function(){
  // SDK Needs to create video and canvas nodes in the DOM in order to function
  // Here we are adding those nodes a predefined div.
  var width = 480;
  var height = 320;
  var faceMode = affdex.FaceDetectorMode.LARGE_FACES;

  var detector = new affdex.FrameDetector(faceMode);
    
  //Enable detection of all Expressions, Emotions and Emojis classifiers.
  detector.detectAllEmotions();
  detector.detectAllExpressions();
  detector.detectAllEmojis();
  detector.detectAllAppearance();
  log('#logs', 'starting');

  var startTimestamp;
  detector.start();

  //Add a callback to notify when the detector is initialized and ready for runing.
  detector.addEventListener("onInitializeSuccess", function() {
    //log('#logs', "The detector reports initialized");
    log('#logs', 'started');
    startTimestamp = (new Date()).getTime() / 1000;
    
  });



  detector.addEventListener("onInitializeFailure", function () {
    log('#logs', "init failed");
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
      //log('#logs', 'before process');
      if (detector && detector.isRunning) {
        detector.process(imageData, deltaTime);
        //log('#logs', 'processed');
      }
    }, 1000);
    
  }, false);

  v.addEventListener('pause', function () {
    detector.stop();
  });

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

      track();
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

