var PIXEL_OFFSET = 4;


// ドラッグ要素がドロップ要素に重なっている間
window.addEventListener('dragover', function(evt) {
  evt.preventDefault();  // ブラウザのデフォルトの画像表示処理をOFF
}, false);

// ドロップ時
window.addEventListener('drop', function(evt) {
  var canvas = document.getElementById('myCanvas');
  var ctx = canvas.getContext('2d');

  evt.preventDefault();  // ブラウザのデフォルトの画像表示処理をOFF
  var file = evt.dataTransfer.files[0];

  if (!file.type.match(/^image\/(png|jpeg|gif)$/)) return;

  var image = new Image();
  var reader = new FileReader();

  reader.onload = function(evt) {
    image.onload = function() {
      ctx.drawImage(image, 0, 0);
    }
    image.src = evt.target.result;
  }
  reader.readAsDataURL(file);
});


function monochromize() {
  var canvas = document.getElementById('myCanvas');
  var ctx = canvas.getContext('2d');

  // get imageData object from canvas
  var imagedata = ctx.getImageData(0, 0, canvas.width, canvas.height);
  // get pixelArray from imagedata object
  var data = imagedata.data;

  var pixelIndex = 0;
  for (var i = 0; i < imagedata.height; i++) {
    for (var j = 0; j < imagedata.width; j++) {
      var y = ((77 * data[pixelIndex] + 150 * data[pixelIndex + 1] + 29 * data[pixelIndex + 2]) >> 8);
      data[pixelIndex]     = y;
      data[pixelIndex + 1] = y;
      data[pixelIndex + 2] = y;
      data[pixelIndex + 3] = 255;
      pixelIndex += PIXEL_OFFSET;
    }
  }
  ctx.putImageData(imagedata, 0, 0);
}


function laplacianFilter() {
  var canvas = document.getElementById('myCanvas');
  var ctx = canvas.getContext('2d');
  var imagedata = ctx.getImageData(0, 0, canvas.width, canvas.height);
  var data = imagedata.data;
  var filter = [
    [-1, -1, -1],
    [-1,  8, -1],
    [-1, -1, -1]
  ];
  ctx.putImageData(filtering(imagedata, filter), 0, 0);
}

function filtering(imagedata, filter) {
  var dstData = imagedata.data;
  var srcData = new Array(dstData.length);
  for (var i = 0; i < dstData.length; i++) {
    srcData[i] = dstData[i];
  }

  var filterWidth  = filter[0].length;
  var filterHeight = filter.length;
  var offsetW = Math.floor(filterWidth / 2);
  var offsetH = Math.floor(filterHeight / 2);
  // console.log(filterWidth);
  // console.log(filterHeight);
  // console.log(offsetW);
  // console.log(offsetH);

  var pixelIndex = 0;
  for (var i = offsetH; i < imagedata.height - offsetH; i++) {
    for (var j = offsetW; j < imagedata.width - offsetW; j++) {
      var sum = 0;
      for (var fi = 0; fi < filterHeight; fi++) {
        for (var fj = 0; fj < filterHeight; fj++) {
          sum += srcData[((i + fi - offsetH) * imagedata.width + j + fj - offsetW) * PIXEL_OFFSET] * filter[fi][fj];
        }
      }
      if (sum < 0) {
        sum = 0;
      } else if (sum > 255) {
        sum = 255;
      }
      dstData[(i * imagedata.width + j) * PIXEL_OFFSET]     = sum;
      dstData[(i * imagedata.width + j) * PIXEL_OFFSET + 1] = sum;
      dstData[(i * imagedata.width + j) * PIXEL_OFFSET + 2] = sum;
      dstData[(i * imagedata.width + j) * PIXEL_OFFSET + 3] = 255;
    }
  }
  imagedata.data = dstData;
  return imagedata;
}
