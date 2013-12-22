'use strict';

var Direction = Object.freeze({
   NORTH : 0,
   SOUTH : 1,
   EAST : 2,
   WEST : 3,

   _opposites : [ this.SOUTH, this.NORTH, this.WEST, this.EAST ],
   _clockwise : [ this.EAST, this.WEST, this.SOUTH, this.NORTH ],

   opposite : function(dir)
   {
      return this._opposites[dir];
   },

   clockwise : function(dir)
   {
      return _clockwise[dir];
   },

   counterClockwise : function(dir)
   {
      return this._opposites[_clockwise[dir]];
   },

   random : function()
   {
      return Math.floor(Math.random()*4);
   }
});

var ObjectFlags = Object.freeze({
   NONE : 0,
   TEXT : 1
});

var SpinGlyph = Object.freeze([ 124, 47, 45, 92 ]);
var SpinGunGlyph = Object.freeze([ 27, 24, 26, 25 ]);

/* move object 'self' on board 'board' in direction 'dir' */
function objectMove(board, self, dir)
{
   var oldX = self.x;
   var oldY = self.y;
   var newX = self.x;
   var newY = self.y;

   if (dir == Direction.NORTH)
      --newY;
   else if (dir == Direction.SOUTH)
      ++newY;
   else if (dir == Direction.EAST)
      ++newX;
   else if (dir == Direction.WEST)
      --newX;

   if (newY < 0)
      newY = 0;
   else if (newY >= board.height)
      newY = board.height - 1;

   if (newX < 0)
      newX = 0;
   else if (newX >= board.width)
      newX = board.width - 1;

   if (board.get(newX, newY).name == "empty")
   {
      /* If where we're trying to move is an Empty, then just swap. */
      var tmp = board.get(newX, newY);

      self.x = newX;
      self.y = newY;
      board.set(newX, newY, self);

      tmp.x = oldX;
      tmp.y = oldY;
      board.set(oldX, oldY, tmp);

      return true;
   }

   return false;
}

function Empty() {}
Empty.prototype.glyph = 32;
Empty.prototype.name = "empty";

function Edge() {}
Edge.prototype.glyph = 69;
Edge.prototype.name = "";

function Player() {}
Player.prototype.glyph = 2;
Player.prototype.name = "player";
Player.prototype.color = VGA.ATTR_BG_BLUE|VGA.ATTR_FG_WHITE;

function Ammo() {}
Ammo.prototype.glyph = 132;
Ammo.prototype.name = "ammo";
Ammo.prototype.color = VGA.ATTR_FG_CYAN;

function Torch() {}
Torch.prototype.glyph = 157;
Torch.prototype.name = "torch";

function Gem() {}
Gem.prototype.glyph = 4;
Gem.prototype.name = "gem";

function Key() {}
Key.prototype.glyph = 12;
Key.prototype.name = "key";

function Door() {}
Door.prototype.glyph = 10;
Door.prototype.name = "door";

function Scroll() {}
Scroll.prototype.glyph = 232;
Scroll.prototype.name = "scroll";

function Passage() {}
Passage.prototype.setParams = function(status)
{
   this.destinationBoard = status.param3;
}
Passage.prototype.glyph = 240;
Passage.prototype.name = "passage";

function Duplicator() {}
Duplicator.prototype.setParams = function(status)
{
   this.srcRelX = status.xStep;
   this.srcRelY = status.yStep;
   this.rate = status.param2;
}
Duplicator.prototype.glyph = 250;
Duplicator.prototype.name = "duplicator";

function Bomb() {}
Bomb.prototype.glyph = 11;
Bomb.prototype.name = "bomb";

function Energizer() {}
Energizer.prototype.glyph = 127;
Energizer.prototype.name = "energizer";

function Throwstar() {}
Throwstar.prototype.setParams = function(status)
{
   this.xStep = status.xStep;
   this.yStep = status.yStep;
   this.cycle = status.cycle;
   this.playerOwned = (status.param1 == 0);
}
Throwstar.prototype.glyph = 47;
Throwstar.prototype.name = "star";

function CWConveyor()
{
   this.animIndex = 0;
}
CWConveyor.prototype.glyph = 179;
CWConveyor.prototype.name = "clockwise";
CWConveyor.prototype.update = function()
{
   this.animIndex++;
   this.animIndex %= 4;
   this.glyph = SpinGlyph[this.animIndex];

   /* also needs to rotate objects */   
}

function CCWConveyor()
{
   this.animIndex = 0;
}
CCWConveyor.prototype.glyph = 92;
CCWConveyor.prototype.name = "counter";
CCWConveyor.prototype.update = function()
{
   if (this.animIndex == 0)
      this.animIndex = 3;
   else
      this.animIndex--;
   this.glyph = SpinGlyph[this.animIndex];

   /* also needs to rotate objects */
}

function Bullet() {}
/* Bullets work the same way as stars. */
Bullet.prototype.setParams = Throwstar.prototype.setParams;
Bullet.prototype.glyph = 248;
Bullet.prototype.name = "bullet";

function Water() {}
Water.prototype.glyph = 176;
Water.prototype.name = "water";

function Forest() {}
Forest.prototype.glyph = 176;
Forest.prototype.name = "forest";

function SolidWall() {}
SolidWall.prototype.glyph = 219;
SolidWall.prototype.name = "solid";

function NormalWall() {}
NormalWall.prototype.glyph = 178;
NormalWall.prototype.name = "normal";

function BreakableWall() {}
BreakableWall.prototype.glyph = 177;
BreakableWall.prototype.name = "breakable";

function Boulder() {}
Boulder.prototype.glyph = 254;
Boulder.prototype.name = "boulder";

function SliderNS() {}
SliderNS.prototype.glyph = 18;
SliderNS.prototype.name = "sliderns";

function SliderEW() {}
SliderEW.prototype.glyph = 29;
SliderEW.prototype.name = "sliderew";

function FakeWall() {}
FakeWall.prototype.glyph = 178;
FakeWall.prototype.name = "fake";

function InvisibleWall() {}
InvisibleWall.prototype.glyph = 176;
InvisibleWall.prototype.name = "invisible";

function BlinkWall() {}
BlinkWall.prototype.glyph = 206;
BlinkWall.prototype.name = "blinkwall";

function Transporter() {}
Transporter.prototype.glyph = 60;
Transporter.prototype.name = "transporter";

function Line() {}
Line.prototype.glyph = 250;
Line.prototype.name = "line";

function Ricochet() {}
Ricochet.prototype.glyph = 42;
Ricochet.prototype.name = "ricochet";

function HorizBlinkWallRay() {}
HorizBlinkWallRay.prototype.glyph = 205;
HorizBlinkWallRay.prototype.name = "(horizontal blink wall ray)";

function Bear() {}
Bear.prototype.setParams = function(status)
{
   this.cycle = status.cycle;
   this.sensitivity = status.param1;
}
Bear.prototype.glyph = 153;
Bear.prototype.name = "bear";

function Ruffian() {}
Ruffian.prototype.setParams = function(status)
{
   this.cycle = status.cycle;
   this.intelligence = status.param1;
   this.restTime = status.param2;
}
Ruffian.prototype.glyph = 5;
Ruffian.prototype.name = "ruffian";

function ZObject() {}
ZObject.prototype.setParams = function(status)
{
   this.glyph = status.param1;
   this.code = status.code;
}
ZObject.prototype.glyph = 2;
ZObject.prototype.name = "object";

function Slime() {}
Slime.prototype.glyph = 42;
Slime.prototype.name = "slime";

function Shark() {}
Shark.prototype.glyph = 94;
Shark.prototype.name = "shark";

function SpinningGun()
{
   this.animIndex = 0;
}
SpinningGun.prototype.getParams = function(status)
{
   this.cycle = status.cycle;
   this.intelligence = status.param1;
   this.fireRate = status.param2 & 0x7F;
   this.fireStars = ((status.param2 & 0x80) == 0x80);
}
SpinningGun.prototype.glyph = 24;
SpinningGun.prototype.name = "spinninggun";
SpinningGun.prototype.update = function()
{
   this.animIndex++;
   this.animIndex %= 4;
   this.glyph = SpinGunGlyph[this.animIndex];

   /* also need to do some shootin' */
}

function Pusher() {}
Pusher.prototype.glyph = 31;
Pusher.prototype.name = "pusher";

function Lion() {}
Lion.prototype.glyph = 234;
Lion.prototype.name = "lion";
Lion.prototype.update = function(board)
{
   objectMove(board, this, Direction.random());
}

function Tiger() {}
Tiger.prototype.glyph = 227;
Tiger.prototype.name = "tiger";

function VertBlinkWallRay() {}
VertBlinkWallRay.prototype.glyph = 186;
VertBlinkWallRay.prototype.name = "(vertical blink wall ray)";

function CentipedeHead() {}
CentipedeHead.prototype.glyph = 233;
CentipedeHead.prototype.name = "head";

function CentipedeBody() {}
CentipedeBody.prototype.glyph = 79;
CentipedeBody.prototype.name = "segment";

function BlueText() {}
BlueText.prototype.name = "(blue text)";
BlueText.prototype.color = VGA.ATTR_BG_BLUE|VGA.ATTR_FG_WHITE;
BlueText.prototype.flags = ObjectFlags.TEXT;

function GreenText() {}
GreenText.prototype.name = "(green text)";
GreenText.prototype.color = VGA.ATTR_BG_GREEN|VGA.ATTR_FG_WHITE;
GreenText.prototype.flags = ObjectFlags.TEXT;

function CyanText() {}
CyanText.prototype.name = "(cyan text)";
CyanText.prototype.color = VGA.ATTR_BG_CYAN|VGA.ATTR_FG_WHITE;
CyanText.prototype.flags = ObjectFlags.TEXT;

function RedText() {}
RedText.prototype.name = "(red text)";
RedText.prototype.color = VGA.ATTR_BG_RED|VGA.ATTR_FG_WHITE;
RedText.prototype.flags = ObjectFlags.TEXT;

function PurpleText() {}
PurpleText.prototype.name = "(purple text)";
PurpleText.prototype.color = VGA.ATTR_BG_MAGENTA|VGA.ATTR_FG_WHITE;
PurpleText.prototype.flags = ObjectFlags.TEXT;

function YellowText() {}
YellowText.prototype.name = "(yellow text)";
YellowText.prototype.color = VGA.ATTR_BG_BROWN|VGA.ATTR_FG_WHITE;
YellowText.prototype.flags = ObjectFlags.TEXT;

function WhiteText() {}
WhiteText.prototype.name = "(white text)";
WhiteText.prototype.color = VGA.ATTR_BG_WHITE|VGA.ATTR_FG_WHITE;
WhiteText.prototype.flags = ObjectFlags.TEXT;

var BoardObjects = [
   Empty,
   Edge,
   null, // 02 is unused
   null, // 03 is unused
   Player,
   Ammo,
   Torch,
   Gem,
   Key,
   Door,
   Scroll,
   Passage,
   Duplicator,
   Bomb,
   Energizer,
   Throwstar,
   CWConveyor,
   CCWConveyor,
   Bullet,
   Water,
   Forest,
   SolidWall,
   NormalWall,
   BreakableWall,
   Boulder,
   SliderNS,
   SliderEW,
   FakeWall,
   InvisibleWall,
   BlinkWall,
   Transporter,
   Line,
   Ricochet,
   HorizBlinkWallRay,
   Bear,
   Ruffian,
   ZObject,
   Slime,
   Shark,
   SpinningGun,
   Pusher,
   Lion,
   Tiger,
   VertBlinkWallRay,
   CentipedeHead,
   CentipedeBody,
   null, /* unused */
   BlueText,
   GreenText,
   CyanText,
   RedText,
   PurpleText,
   YellowText,
   WhiteText,
   null
];

function makeBoardObject(boardObjectType, color)
{
   if (boardObjectType < 0 ||
       boardObjectType > BoardObjects.length ||
       BoardObjects[boardObjectType] == null)
   {
      console.log("invalid board object type " + boardObjectType);
      return null;
   }

   var obj = new BoardObjects[boardObjectType]({});
   obj.objectTypeID = boardObjectType;
   obj.color = color;
   obj.hasUpdated = false;
   return obj;
}

function getTileRenderInfo(tile)
{
   if (tile.objectTypeID > BoardObjects.length)
      console.log("invalid element type");

   /* specific check for zero here because town.zzt has some 'empty' cells marked w/color,
      possible editor corruption? */
   if (BoardObjects[tile.objectTypeID] == null || tile.objectTypeID == 0)
      return { glyph: BoardObjects[0].prototype.glyph, color: BoardObjects[0].prototype.color }

   if (BoardObjects[tile.objectTypeID].prototype.flags & ObjectFlags.TEXT)
   {
      /* For text, the tile's 'color' is the glyph, and the element type determines the color. */
      return { glyph: tile.color, color: BoardObjects[tile.objectTypeID].prototype.color };
   }
   else
   {
      return { glyph: tile.glyph, color: tile.color }
   }
}

function getNameForType(objectTypeID)
{
   if (objectTypeID > BoardObjects.length)
      console.log("invalid element type");

   if (BoardObjects[objectTypeID] == null)
      return "(unknown)";
   else
      return BoardObjects[objectTypeID].prototype.name;
}
