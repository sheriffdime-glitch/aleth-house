/* Render decorative films into sealed, non-video frames. */
(function(){
  'use strict';

  window.ALETHFilmFrame = function(video, canvas){
    if (!video || !canvas) return null;
    var context = canvas.getContext('2d', { alpha: false });
    if (!context) return null;

    var frameRequest = 0;
    var videoFrameRequest = 0;
    var running = false;

    function resize(){
      var rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      var density = Math.min(window.devicePixelRatio || 1, 1.5);
      var width = Math.max(1, Math.round(rect.width * density));
      var height = Math.max(1, Math.round(rect.height * density));
      if (canvas.width !== width) canvas.width = width;
      if (canvas.height !== height) canvas.height = height;
      draw();
    }

    function draw(){
      if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) return;
      if (video.paused && !canvas.classList.contains('is-ready')) return;
      if (!canvas.width || !canvas.height) resize();
      var sourceRatio = video.videoWidth / video.videoHeight;
      var frameRatio = canvas.width / canvas.height;
      var sx = 0;
      var sy = 0;
      var sw = video.videoWidth;
      var sh = video.videoHeight;

      if (sourceRatio > frameRatio){
        sw = video.videoHeight * frameRatio;
        sx = (video.videoWidth - sw) / 2;
      } else if (sourceRatio < frameRatio) {
        sh = video.videoWidth / frameRatio;
        sy = (video.videoHeight - sh) / 2;
      }

      context.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      canvas.classList.add('is-ready');
    }

    function cancel(){
      if (frameRequest){
        window.cancelAnimationFrame(frameRequest);
        frameRequest = 0;
      }
      if (videoFrameRequest && video.cancelVideoFrameCallback){
        video.cancelVideoFrameCallback(videoFrameRequest);
      }
      videoFrameRequest = 0;
      running = false;
    }

    function schedule(){
      if (!running || document.hidden || video.paused || video.ended){
        cancel();
        return;
      }
      if (video.requestVideoFrameCallback){
        videoFrameRequest = video.requestVideoFrameCallback(function(){
          draw();
          schedule();
        });
      } else {
        frameRequest = window.requestAnimationFrame(function(){
          draw();
          schedule();
        });
      }
    }

    function sync(){
      if (!video.paused && !video.ended && !document.hidden){
        if (!running){
          running = true;
          schedule();
        }
      } else {
        cancel();
      }
    }

    video.addEventListener('loadeddata', function(){ resize(); });
    video.addEventListener('play', sync);
    video.addEventListener('pause', cancel);
    video.addEventListener('ended', cancel);
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pageshow', function(){ resize(); sync(); });

    if ('ResizeObserver' in window){
      var observer = new ResizeObserver(resize);
      observer.observe(canvas);
    }

    resize();
    sync();
    return { draw: draw, resize: resize, sync: sync, cancel: cancel };
  };
})();
