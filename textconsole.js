'use strict';

/* "constants" */
var VGA =
{
   COLOR: [
      [   0,   0,   0 ],
      [   0,   0, 170 ],
      [   0, 170,   0 ],
      [   0, 170, 170 ],
      [ 170,   0,   0 ],
      [ 170,   0, 170 ],
      [ 170,  85,   0 ],
      [ 170, 170, 170 ],
      [  85,  85,  85 ],
      [  85,  85, 255 ],
      [  85, 255,  85 ],
      [  85, 255, 255 ],
      [ 255,  85,  85 ],
      [ 255,  85, 255 ],
      [ 255, 255,  85 ],
      [ 255, 255, 255 ]
   ],
   ATTR_FG_BLACK   : 0x00,
   ATTR_FG_BLUE    : 0x01,
   ATTR_FG_GREEN   : 0x02,
   ATTR_FG_CYAN    : 0x03,
   ATTR_FG_RED     : 0x04,
   ATTR_FG_MAGENTA : 0x05,
   ATTR_FG_BROWN   : 0x06,
   ATTR_FG_GRAY    : 0x07,
   ATTR_FG_DARKGRAY: 0x08,
   ATTR_FG_BBLUE   : 0x09,
   ATTR_FG_BGREEN  : 0x0A,
   ATTR_FG_BCYAN   : 0x0B,
   ATTR_FG_BRED    : 0x0C,
   ATTR_FG_BMAGENTA: 0x0D,
   ATTR_FG_YELLOW  : 0x0E,
   ATTR_FG_WHITE   : 0x0F,
   ATTR_BG_BLACK   : 0x00,
   ATTR_BG_BLUE    : 0x10,
   ATTR_BG_GREEN   : 0x20,
   ATTR_BG_CYAN    : 0x30,
   ATTR_BG_RED     : 0x40,
   ATTR_BG_MAGENTA : 0x50,
   ATTR_BG_BROWN   : 0x60,
   ATTR_BG_GRAY    : 0x70,
   ATTR_BLINK      : 0x80,
   foregroundColorFromAttribute: function(attr)
   {
      return (attr & 0x0F);
   },
   backgroundColorFromAttribute: function(attr)
   {
      return ((attr & 0x70) >> 4);
   }
};

function TextConsole(canvas, width, height)
{
   var self = this;

   this.canvas = canvas;
   this.width = width;
   this.height = height;
   this.screenText = new Uint8Array(width*height);
   this.screenAttr = new Uint8Array(width*height);
   this.fontImages = new Array(VGA.COLOR.length);
   this.characterWidth = 0;
   this.characterHeight = 0;

   this.onclick = function(event) {}

   this.canvas.addEventListener('click',
      function(event) {
         if (self.onclick)
         {
            /* compute the 'x' and 'y' cells */
            var canvasX = event.pageX - event.target.offsetLeft;
            var canvasY = event.pageY - event.target.offsetTop;

            /* now divide by the width/height, and add as cellX/cellY */
            event.cellX = Math.floor(canvasX * self.width / event.target.clientWidth);
            event.cellY = Math.floor(canvasY * self.height / event.target.clientHeight);

            self.onclick(event);
         }
      }, false);
}

TextConsole.prototype.getSpriteCoords = function(ord)
{
   if (ord < 0 || ord > 255)
      ord = 0;

   /* The sprite sheet is 32 characters wide, 8 tall. */
   var row = Math.floor(ord / 32);
   var col = ord % 32;

   return { 'y': row*this.characterHeight, 'x': col*this.characterWidth };
}

TextConsole.prototype.init = function(callback)
{
   this.loadFont("cp437.png", callback);
}

TextConsole.prototype.loadFont = function(url, callback)
{
   var self = this;

   /* load the image that we use as the spritemap for the font. */
   var fontImage = new Image();
   fontImage.src = url;
   fontImage.onload = function() {
      /* once the image is loaded, use it as a template to generate all
         of the foreground colors. We only get pixel manipulation with
         a canvas, though, so we'll need a temporary canvas in order to
         get at the pixel data. And then we'll need to create a bunch
         of images or canvases, because an ImageData isn't a valid
         CanvasImageSource. ugggggh. */
      /* kinda wondering if it'd be easier just to base64-encode the image
         and insert it inline then having to deal with this all in an
         onload handler... */
      var canvas = document.createElement("canvas");
      canvas.width = fontImage.width;
      canvas.height = fontImage.height;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(fontImage, 0, 0);
      var sourceImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      /* sprite sheets are assumed to be 32 chars wide, 8 tall */
      self.characterWidth = Math.floor(canvas.width / 32);
      self.characterHeight = Math.floor(canvas.height / 8);

      for (var c = 0; c < VGA.COLOR.length; ++c)
      {
         self.fontImages[c] = document.createElement("canvas");
         self.fontImages[c].width = fontImage.width;
         self.fontImages[c].height = fontImage.height;
         /* Contrary to what you would expect, this doesn't copy,
            it just makes a new image data with the same width/height */
         var fontData = ctx.createImageData(sourceImageData);
         /* replace every black pixel with transparent,
            replace every white pixel with the color */
         var fontDataPixels = fontData.data;
         var srcDataPixels = sourceImageData.data;
         for (var i = 0; i < fontDataPixels.length; i += 4)
         {
            if (srcDataPixels[i] == 0)
            {
               fontDataPixels[i] = 0;
               fontDataPixels[i+1] = 0;
               fontDataPixels[i+2] = 0;
               fontDataPixels[i+3] = 0;
            }
            else
            {
               fontDataPixels[i] = VGA.COLOR[c][0];
               fontDataPixels[i+1] = VGA.COLOR[c][1];
               fontDataPixels[i+2] = VGA.COLOR[c][2];
               fontDataPixels[i+3] = 255;
            }
         }
         /* set it back on the convas */
         self.fontImages[c].getContext('2d').putImageData(fontData, 0, 0);
      }

      callback();
   }
}

TextConsole.prototype.resizeToScreen = function()
{
   var gameWidth = window.innerWidth;
   var gameHeight = window.innerHeight;
   var scaleToFitX = gameWidth / (this.width*this.characterWidth);
   var scaleToFitY = gameHeight / (this.height*this.characterHeight);
   var bestRatio = Math.min(scaleToFitX, scaleToFitY);
   this.canvas.style.width = (this.width*this.characterWidth) * bestRatio + "px";
   this.canvas.style.height = (this.height*this.characterHeight) * bestRatio + "px";
}

TextConsole.prototype.set = function(x, y, ch, attr)
{
   var index = y*this.width + x;
   this.screenText[index] = ch;
   this.screenAttr[index] = attr;
}

TextConsole.prototype.setString = function(x, y, str, attr)
{
   for (var i = 0; i < str.length; ++i)
      this.set(x+i, y, str.charCodeAt(i), attr);
}

TextConsole.prototype.redrawAt = function(x, y)
{
   var ctx = this.canvas.getContext('2d');

   /* cheat and blit a full-block instead of messing with fillStyle */
   var bgcell = this.getSpriteCoords(219);

   var index = y*this.width+x;
   var src = this.getSpriteCoords(this.screenText[index]);
   var attr = this.screenAttr[index];
   var bgcolor = VGA.backgroundColorFromAttribute(attr);
   var fgcolor = VGA.foregroundColorFromAttribute(attr);

   if (this.fontImages[bgcolor] == null || this.fontImages[fgcolor] == null)
   {
      console.log("trying to draw before images loaded!");
      return;
   }

   ctx.drawImage(this.fontImages[VGA.backgroundColorFromAttribute(attr)],
      bgcell.x, bgcell.y,
      this.characterWidth, this.characterHeight,
      x * this.characterWidth, y * this.characterHeight,
      this.characterWidth, this.characterHeight);
   ctx.drawImage(this.fontImages[VGA.foregroundColorFromAttribute(attr)],
      src.x, src.y,
      this.characterWidth, this.characterHeight,
      x * this.characterWidth, y * this.characterHeight,
      this.characterWidth, this.characterHeight);
}

TextConsole.prototype.redraw = function()
{

   for (var y = 0; y < this.height; y++)
   {
      for (var x = 0; x < this.width; x++)
      {
         this.redrawAt(x, y);
      }
   }
}

