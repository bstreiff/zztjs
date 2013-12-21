'use strict';

/* Yay, browser quirks! */
window.requestAnimationFrame =
   window.requestAnimationFrame ||
   window.mozRequestAnimationFrame ||
   window.webkitRequestAnimationFrame ||
   window.msRequestAnimationFrame;

var game = {};

function gameInit(canvas)
{
   // gotta start somewhere.
   game.fps = 10;
   game.console = new TextConsole(canvas, 80, 25);
   game.debug = true;

   // Initialize the console.
   game.console.init(function() {
      game.console.resizeToScreen();
      game.console.redraw();

      // Resize the console when the window resizes.
      window.addEventListener("resize", function() {
         game.console.resizeToScreen();
      }, false);

      game.console.onclick = function(event)
      {
         if (game.debug)
         {
            if (event.cellX < 60 && game.world)
            {
               var board = game.world.board[game.world.playerBoard];
               // find the tile at this location
               var tile = board.tiles[event.cellY*60+event.cellX];
               console.log(tile);
               console.log(getNameForType(tile.etype));
               // find the object at this location, if one exists
               for (var i = 0; i < board.objects.length; ++i)
               {
                  if (board.objects[i].x == event.cellX &&
                     board.objects[i].y == event.cellY)
                  {
                     console.log(board.objects[i]);
                  }
               }
            }
         }
      }
   });

   game.audio = new ZZTAudio();

   gameLoad("worlds/town.zzt");
}

function gameLoad(url)
{
   game.worldurl = url;
   var worldLoader = new ZZTWorldLoader();
   worldLoader.init(game.worldurl, function(world) {
      game.world = world;
      gameTick();
   });
}

function drawTitleScreenStatusBar()
{
   game.console.setString(62, 7, " W ", VGA.ATTR_BG_CYAN);
   game.console.setString(66, 7, "World", VGA.ATTR_BG_BLUE|VGA.ATTR_FG_WHITE);

   game.console.setString(62, 11, " P ", VGA.ATTR_BG_GRAY);
   game.console.setString(66, 11, "Play", VGA.ATTR_BG_BLUE|VGA.ATTR_FG_WHITE);
   game.console.setString(62, 12, " R ", VGA.ATTR_BG_CYAN);
   game.console.setString(66, 12, "Restore game", VGA.ATTR_BG_BLUE|VGA.ATTR_FG_WHITE);
}

function drawGameStatusBar()
{
   var yellowOnBlue = VGA.ATTR_BG_BLUE|VGA.ATTR_FG_YELLOW;

   game.console.set(62,  7, 2,   VGA.ATTR_BG_BLUE|VGA.ATTR_FG_WHITE);
   game.console.set(62,  8, 132, VGA.ATTR_BG_BLUE|VGA.ATTR_FG_BCYAN);
   game.console.set(62,  9, 157, VGA.ATTR_BG_BLUE|VGA.ATTR_FG_BROWN);
   game.console.set(62, 10, 4,   VGA.ATTR_BG_BLUE|VGA.ATTR_FG_BCYAN);
   game.console.set(62, 12, 12,  VGA.ATTR_BG_BLUE|VGA.ATTR_FG_WHITE);

   game.console.setString(64,  7, " Health:" + game.world.playerHealth, yellowOnBlue);
   game.console.setString(64,  8, "   Ammo:" + game.world.playerAmmo, yellowOnBlue);
   game.console.setString(64,  9, "Torches:" + game.world.playerTorches, yellowOnBlue);
   game.console.setString(64, 10, "   Gems:" + game.world.playerGems, yellowOnBlue);
   game.console.setString(64, 11, "  Score:" + game.world.playerScore, yellowOnBlue);
   game.console.setString(64, 12, "   Keys:", yellowOnBlue);

   var keyColors = [
      VGA.ATTR_FG_BBLUE,
      VGA.ATTR_FG_BGREEN,
      VGA.ATTR_FG_BCYAN,
      VGA.ATTR_FG_BRED,
      VGA.ATTR_FG_BMAGENTA,
      VGA.ATTR_FG_YELLOW,
      VGA.ATTR_FG_WHITE ];

   for (var i = 0; i < 7; ++i)
   {
      game.console.set(72+i, 12,
         (game.world.playerKeys[i] ? 12 : 0),
         VGA.ATTR_BG_BLUE|keyColors[i]);
   }

   game.console.setString(62, 14, " T ", VGA.ATTR_BG_GRAY);
   game.console.setString(66, 14, "Torch", VGA.ATTR_BG_BLUE|VGA.ATTR_FG_WHITE);
   game.console.setString(62, 15, " B ", VGA.ATTR_BG_CYAN);
   game.console.setString(66, 15, "Be quiet", VGA.ATTR_BG_BLUE|VGA.ATTR_FG_WHITE);
   game.console.setString(62, 16, " H ", VGA.ATTR_BG_GRAY);
   game.console.setString(66, 16, "Help", VGA.ATTR_BG_BLUE|VGA.ATTR_FG_WHITE);

   // UDRL arrows are chars 24-27.
   game.console.set(67, 18, 0, VGA.ATTR_BG_CYAN);
   for (var i = 0; i < 4; ++i)
      game.console.set(68+i, 18, 24+i, VGA.ATTR_BG_CYAN);
   game.console.setString(73, 18, "Move", VGA.ATTR_BG_BLUE|VGA.ATTR_FG_WHITE);
   game.console.setString(61, 19, " Shift ", VGA.ATTR_BG_GRAY);
   for (var i = 0; i < 4; ++i)
      game.console.set(68+i, 19, 24+i, VGA.ATTR_BG_GRAY);
   game.console.setString(73, 19, "Shoot", VGA.ATTR_BG_BLUE|VGA.ATTR_FG_WHITE);

   game.console.setString(62, 21, " S ", VGA.ATTR_BG_GRAY);
   game.console.setString(66, 21, "Save game", VGA.ATTR_BG_BLUE|VGA.ATTR_FG_WHITE);
   game.console.setString(62, 22, " P ", VGA.ATTR_BG_CYAN);
   game.console.setString(66, 22, "Pause", VGA.ATTR_BG_BLUE|VGA.ATTR_FG_WHITE);
   game.console.setString(62, 23, " Q ", VGA.ATTR_BG_GRAY);
   game.console.setString(66, 23, "Quit", VGA.ATTR_BG_BLUE|VGA.ATTR_FG_WHITE);

}

function drawStatusBar()
{
   /* fill everything with a blue background */
   for (var y = 0; y < 25; ++y)
   {
      for (var x = 60; x < 80; ++x)
      {
         game.console.set(x, y, 32, VGA.ATTR_BG_BLUE);
      }
   }

   game.console.setString(62, 0, "   - - - - -   ", VGA.ATTR_BG_BLUE|VGA.ATTR_FG_WHITE);
   game.console.setString(62, 1, "      ZZT      ", VGA.ATTR_BG_GRAY);
   game.console.setString(62, 2, "   - - - - -   ", VGA.ATTR_BG_BLUE|VGA.ATTR_FG_WHITE);

   if (game.world.playerBoard == 0)
      drawTitleScreenStatusBar();
   else
      drawGameStatusBar();
}

function gameTick()
{
   setTimeout(function() {
      /* queue up the next tick */
      window.requestAnimationFrame(gameTick);

      /* if we're actually playing, handle player-related timeouts */
      if (game.world.playerBoard > 0)
      {
         if (game.world.torchCycles > 0)
         {
            game.world.torchCycles--;
            // draw the torch darkness stuff
            if (game.world.torchCycle == 0)
            {
               //game.audio.play(game.audio.SFX_TORCH_DEAD);
            }
         }

         if (game.world.timeLeft > 0)
         {
            // display the timer
         }

         // handle player health
         // handle timer
      }

      // now, iterate through all objects on the board and update them

      drawStatusBar();
      game.world.drawBoard(game.console);

      game.console.redraw();
   }, 1000 / game.fps);
}

