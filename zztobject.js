'use strict';

var ObjectFlags = {
   NONE : 0,
   TEXT : 1
};

function Empty(status) {}
Empty.prototype.glyph = 32;
Empty.prototype.name = "empty";

function Edge(status) {}
Edge.prototype.glyph = 69;
Edge.prototype.name = "";

function Player(status) {}
Player.prototype.glyph = 2;
Player.prototype.name = "player";
Player.prototype.color = VGA.ATTR_BG_BLUE|VGA.ATTR_FG_WHITE;

function Ammo(status) {}
Ammo.prototype.glyph = 132;
Ammo.prototype.name = "ammo";
Ammo.prototype.color = VGA.ATTR_FG_CYAN;

function Torch(status) {}
Torch.prototype.glyph = 157;
Torch.prototype.name = "torch";

function Gem(status) {}
Gem.prototype.glyph = 4;
Gem.prototype.name = "gem";

function Key(status) {}
Key.prototype.glyph = 12;
Key.prototype.name = "key";

function Door(status) {}
Door.prototype.glyph = 10;
Door.prototype.name = "door";

function Scroll(status) {}
Scroll.prototype.glyph = 232;
Scroll.prototype.name = "scroll";

function Passage(status) {}
Passage.prototype.glyph = 240;
Passage.prototype.name = "passage";

function Duplicator(status) {}
Duplicator.prototype.glyph = 250;
Duplicator.prototype.name = "duplicator";

function Bomb(status) {}
Bomb.prototype.glyph = 11;
Bomb.prototype.name = "bomb";

function Energizer(status) {}
Energizer.prototype.glyph = 127;
Energizer.prototype.name = "energizer";

function Throwstar(status) {}
Throwstar.prototype.glyph = 47;
Throwstar.prototype.name = "star";

function CWConveyor(status) {}
CWConveyor.prototype.glyph = 179;
CWConveyor.prototype.name = "clockwise";

function CCWConveyor(status) {}
CCWConveyor.prototype.glyph = 92;
CCWConveyor.prototype.name = "counter";

function Bullet(status) {}
Bullet.prototype.glyph = 248;
Bullet.prototype.name = "bullet";

function Water(status) {}
Water.prototype.glyph = 176;
Water.prototype.name = "water";

function Forest(status) {}
Forest.prototype.glyph = 176;
Forest.prototype.name = "forest";

function SolidWall(status) {}
SolidWall.prototype.glyph = 219;
SolidWall.prototype.name = "solid";

function NormalWall(status) {}
NormalWall.prototype.glyph = 178;
NormalWall.prototype.name = "normal";

function BreakableWall(status) {}
BreakableWall.prototype.glyph = 177;
BreakableWall.prototype.name = "breakable";

function Boulder(status) {}
Boulder.prototype.glyph = 254;
Boulder.prototype.name = "boulder";

function SliderNS(status) {}
SliderNS.prototype.glyph = 18;
SliderNS.prototype.name = "sliderns";

function SliderEW(status) {}
SliderEW.prototype.glyph = 29;
SliderEW.prototype.name = "sliderew";

function FakeWall(status) {}
FakeWall.prototype.glyph = 178;
FakeWall.prototype.name = "fake";

function InvisibleWall(status) {}
InvisibleWall.prototype.glyph = 176;
InvisibleWall.prototype.name = "invisible";

function BlinkWall(status) {}
BlinkWall.prototype.glyph = 206;
BlinkWall.prototype.name = "blinkwall";

function Transporter(status) {}
Transporter.prototype.glyph = 60;
Transporter.prototype.name = "transporter";

function Line(status) {}
Line.prototype.glyph = 250;
Line.prototype.name = "line";

function Ricochet(status) {}
Ricochet.prototype.glyph = 42;
Ricochet.prototype.name = "ricochet";

function HorizBlinkWallRay(status) {}
HorizBlinkWallRay.prototype.glyph = 205;
HorizBlinkWallRay.prototype.name = "(horizontal blink wall ray)";

function Bear(status) {}
Bear.prototype.glyph = 153;
Bear.prototype.name = "bear";

function Ruffian(status) {}
Ruffian.prototype.glyph = 5;
Ruffian.prototype.name = "ruffian";

function ZObject(status)
{
   this.glyph = status.param1;
   this.code = status.code;
}
ZObject.prototype.glyph = 2;
ZObject.prototype.name = "object";

function Slime(status) {}
Slime.prototype.glyph = 42;
Slime.prototype.name = "slime";

function Shark(status) {}
Shark.prototype.glyph = 94;
Shark.prototype.name = "shark";

function SpinningGun(status) {}
SpinningGun.prototype.glyph = 24;
SpinningGun.prototype.name = "spinninggun";

function Pusher(status) {}
Pusher.prototype.glyph = 31;
Pusher.prototype.name = "pusher";

function Lion(status) {}
Lion.prototype.glyph = 234;
Lion.prototype.name = "lion";
Lion.prototype.update = function() {
   this.glyph = Math.floor(Math.random()*256);
}

function Tiger(status) {}
Tiger.prototype.glyph = 227;
Tiger.prototype.name = "tiger";

function VertBlinkWallRay(status) {}
VertBlinkWallRay.prototype.glyph = 186;
VertBlinkWallRay.prototype.name = "(vertical blink wall ray)";

function CentipedeHead(status) {}
CentipedeHead.prototype.glyph = 233;
CentipedeHead.prototype.name = "head";

function CentipedeBody(status) {}
CentipedeBody.prototype.glyph = 79;
CentipedeBody.prototype.name = "segment";

function BlueText(status) {}
BlueText.prototype.name = "(blue text)";
BlueText.prototype.color = VGA.ATTR_BG_BLUE|VGA.ATTR_FG_WHITE;
BlueText.prototype.flags = ObjectFlags.TEXT;

function GreenText(status) {}
GreenText.prototype.name = "(green text)";
GreenText.prototype.color = VGA.ATTR_BG_GREEN|VGA.ATTR_FG_WHITE;
GreenText.prototype.flags = ObjectFlags.TEXT;

function CyanText(status) {}
CyanText.prototype.name = "(cyan text)";
CyanText.prototype.color = VGA.ATTR_BG_CYAN|VGA.ATTR_FG_WHITE;
CyanText.prototype.flags = ObjectFlags.TEXT;

function RedText(status) {}
RedText.prototype.name = "(red text)";
RedText.prototype.color = VGA.ATTR_BG_RED|VGA.ATTR_FG_WHITE;
RedText.prototype.flags = ObjectFlags.TEXT;

function PurpleText(status) {}
PurpleText.prototype.name = "(purple text)";
PurpleText.prototype.color = VGA.ATTR_BG_MAGENTA|VGA.ATTR_FG_WHITE;
PurpleText.prototype.flags = ObjectFlags.TEXT;

function YellowText(status) {}
YellowText.prototype.name = "(yellow text)";
YellowText.prototype.color = VGA.ATTR_BG_BROWN|VGA.ATTR_FG_WHITE;
YellowText.prototype.flags = ObjectFlags.TEXT;

function WhiteText(status) {}
WhiteText.prototype.name = "(white text)";
WhiteText.prototype.color = VGA.ATTR_BG_WHITE|VGA.ATTR_FG_WHITE;
WhiteText.prototype.flags = ObjectFlags.TEXT;

var Objects = [
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

function constructObjectFromStatusElement(elementType, color, status)
{
   if (elementType > Objects.length)
      console.log("invalid element type");

   if (Objects[elementType] == null)
      return null;

   var obj = new Objects[elementType](status);

   obj.x = status.x;
   obj.y = status.y;
   obj.xStep = status.xStep;
   obj.yStep = status.yStep;
   obj.cycle = status.cycle;
   obj.color = color;

   return obj;
}

function getTileRenderInfo(tile)
{
   if (tile.etype > Objects.length)
      console.log("invalid element type");

   /* specific check for zero here because town.zzt has some 'empty' cells marked w/color,
      possible editor corruption? */
   if (Objects[tile.etype] == null || tile.etype == 0)
      return { glyph: Objects[0].prototype.glyph, color: Objects[0].prototype.color }

   if (Objects[tile.etype].prototype.flags & ObjectFlags.TEXT)
   {
      /* For text, the tile's 'color' is the glyph, and the element type determines the color. */
      return { glyph: tile.color, color: Objects[tile.etype].prototype.color };
   }
   else
   {
      return { glyph: Objects[tile.etype].prototype.glyph, color: tile.color }
   }
}

function getNameForType(etype)
{
   if (etype > Objects.length)
      console.log("invalid element type");

   if (Objects[etype] == null)
      return "(unknown)";
   else
      return Objects[etype].prototype.name;
}
