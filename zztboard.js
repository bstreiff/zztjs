'use strict';

function ZZTBoard() {}

ZZTBoard.prototype.get = function(x, y)
{
   return this.tiles[y * this.width + x];
}

ZZTBoard.prototype.set = function(x, y, obj)
{
  this.tiles[y * this.width + x] = obj;
}

ZZTBoard.prototype.update = function()
{
   var self = this;

   /* Make sure everybody's where they think they are. */
   for (var y = 0; y < this.height; ++y)
   {
      for (var x = 0; x < this.width; ++x)
      {
         var tile = this.get(x, y);
         if (tile.x != x || tile.y != y)
         {
            console.log("object at [" + x + ", " + y +
               "] thinks it's at [" + tile.x + ", " + y + "], fixing.");
            tile.x = x;
            tile.y = y;
         }
      }
   }   

   /* Now, update them. */
   for (var y = 0; y < this.height; ++y)
   {
      for (var x = 0; x < this.width; ++x)
      {
         var tile = this.get(x, y);

         if (tile.update && tile.hasUpdated == false)
         {
            tile.update(this);
            tile.hasUpdated = true;
         }
      }
   }

   /* clear the update flag */
   for (var y = 0; y < this.height; ++y)
   {
      for (var x = 0; x < this.width; ++x)
      {
         var tile = this.get(x, y);
         tile.hasUpdated = false;
      }
   }
}

ZZTBoard.prototype.draw = function(textconsole)
{
   for (var y = 0; y < this.height; ++y)
   {
      for (var x = 0; x < this.width; ++x)
      {
         var tile = this.get(x, y);

         var inf = getTileRenderInfo(tile);
         textconsole.set(x, y, inf.glyph, inf.color);
      }
   }

   if (this.messageTimer > 0)
   {
      /* TODO: actually work out how to make this multiline */
      textconsole.setString(
         Math.floor((this.width / 2) - (this.onScreenMessage.length / 2)),
         24,
         this.onScreenMessage,
         (this.messageTimer % 6) + VGA.ATTR_FG_BBLUE);
      --this.messageTimer;
   }
}

ZZTBoard.prototype.setMessage = function(msg)
{
   /* TODO: actually work out how to make this multiline */
   if (msg.length >= (this.width - 2))
   {
      msg = msg.substr(0, (this.width - 2))
   }
   this.onScreenMessage = " " + msg + " ";
   this.messageTimer = 24;
}

var _ZZTBoard_LineGlyphs =
[
   /* NESW */
   /* 0000 */ 249,
   /* 0001 */ 181,
   /* 0010 */ 210,
   /* 0011 */ 187,
   /* 0100 */ 198,
   /* 0101 */ 205,
   /* 0110 */ 201,
   /* 0111 */ 203,
   /* 1000 */ 208,
   /* 1001 */ 188,
   /* 1010 */ 186,
   /* 1011 */ 185,
   /* 1100 */ 200,
   /* 1101 */ 202,
   /* 1110 */ 204,
   /* 1111 */ 206
];

/* Update the glyphs of all line characters on the board.

   We only need to do this whenever one of them changes. */
ZZTBoard.prototype.updateLines = function()
{
   for (var y = 0; y < this.height; ++y)
   {
      for (var x = 0; x < this.width; ++x)
      {
         var tile = this.get(x, y);
         if (tile.name == "line")
         {
            var glyphIndex = 0;

            if ((y == 0) || (this.get(x, y-1).name == "line"))
               glyphIndex += 8;

            if ((x == this.width-1) || (this.get(x+1, y).name == "line"))
               glyphIndex += 4;

            if ((y == this.height-1) || (this.get(x, y+1).name == "line"))
               glyphIndex += 2;

            if ((x == 0) || (this.get(x-1, y).name == "line"))
               glyphIndex += 1;

            tile.glyph = _ZZTBoard_LineGlyphs[glyphIndex];
         }
      }
   }
}
