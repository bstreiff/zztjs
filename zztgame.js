'use strict';

/* parse out key-value pairs from the fragment identifier.
   http://.../blorp#!abc&def=blah

   The first entry without a '=' is returned as 'world'.

   If the string is empty, returns {world:""}.
*/
function parseFragmentParams()
{
   var kvs = {};

   /* split on '&' */
   var str = window.location.hash;
   var hashes = str.slice(str.indexOf("#!") + 2).split('&');

   for (var i = 0; i < hashes.length; i++)
   {
      var hash = hashes[i].split('=');

      if (hash.length > 1)
      {
         /* there is a key and there is a value */
         kvs[hash[0]] = hash[1];
      }
      else
      {
         /* if we haven't declared 'world', the first entry with no '=' is it. */
         if (!("world" in kvs))
         {
            kvs["world"] = hash[0];
         }
         else
         {
            kvs[hash[0]] = true;
         }
      }
   }

   return kvs;
}

/* Yay, browser quirks! */
window.requestAnimationFrame =
   window.requestAnimationFrame ||
   window.mozRequestAnimationFrame ||
   window.webkitRequestAnimationFrame ||
   window.msRequestAnimationFrame;

var game = {
   inputEvent: 0,
   quiet: false,
   fps: 9.1032548384,
   debug: true,
   dialog: null,
   tick: 0
};

var ZInputEvent = Object.freeze({
   USE_TORCH : 1,
   HELP : 3,
   SAVE : 4,
   PAUSE : 5,
   QUIT : 6,
   WALK_NORTH : 7,
   SHOOT_NORTH : 8,
   WALK_EAST : 9,
   SHOOT_EAST : 10,
   WALK_SOUTH : 11,
   SHOOT_SOUTH : 12,
   WALK_WEST : 13,
   SHOOT_WEST : 14
});

function getWorldList(callback)
{
   var request = new XMLHttpRequest();
   request.open("GET", "worlds/index.json", true);
   request.onload = function(e)
   {
      var worlds = {};
      if (this.status == 200)
      {
         console.log(this.response);
         var resp = JSON.parse(this.response);
         worlds = resp.worlds;
      }
      callback(worlds);
   }
   request.send();
}

function mainMenuKeyDown(event)
{
   if (event.keyCode == 87) /* "W" */
   {
      /* select world */
      getWorldList(function(worlds) {
         var entries = [];
         var filenames = [];
         for (var i = 0; i < worlds.length; ++i)
         {
            entries.push(worlds[i].shortname);
            filenames.push(worlds[i].file);
         }
         entries.push("Exit");
         filenames.push(null);
         game.dialog = new ZZTDialog("ZZT Worlds", entries);
         game.dialog.filenames = filenames;

         game.dialog.callback = function(ev)
         {
            if (!ev.cancelled && ev.dialog.filenames[ev.line])
            {
               var filename = ev.dialog.filenames[ev.line];
               window.location.hash = "#!" + filename;
               gameLoad("worlds/" + filename);
               return true;
            }
            return false;
         }
      });
   }
   else if (event.keyCode == 80) /* "P" */
   {
      /* play game */
      game.world.currentBoard = game.world.board[game.world.playerBoard];
      game.atTitleScreen = false;
   }
   else if (event.keyCode == 82) /* "R" */
   {
      /* restore game, does nothing right now */
   }
}

function inGameKeyDown(event)
{
   if (event.keyCode == 84) /* "T" */
   {
      game.inputEvent = ZInputEvent.USE_TORCH;
      return true;
   }
   else if (event.keyCode == 66) /* "B" */
   {
      /* toggling sound doesn't alter the game state at all, so
         lets just do it immediately */
      game.quiet = !game.quiet;
      return true;
   }
   else if (event.keyCode == 72) /* "H" */
   {
      game.inputEvent = ZInputEvent.HELP;
      return true;
   }
   else if (event.keyCode == 83) /* "S" */
   {
      game.inputEvent = ZInputEvent.SAVE;
      return true;
   }
   else if (event.keyCode == 80) /* "P" */
   {
      game.inputEvent = ZInputEvent.PAUSE;
      return true;
   }
   else if (event.keyCode == 81) /* "Q" */
   {
      game.inputEvent = ZInputEvent.QUIT;
      return true;
   }
   else if (event.keyCode == 37) /* Left */
   {
      if (event.shiftKey)
         game.inputEvent = ZInputEvent.SHOOT_WEST;
      else
         game.inputEvent = ZInputEvent.WALK_WEST;
      return true;
   }
   else if (event.keyCode == 38) /* Up */
   {
      if (event.shiftKey)
         game.inputEvent = ZInputEvent.SHOOT_NORTH;
      else
         game.inputEvent = ZInputEvent.WALK_NORTH;
      return true;
   }
   else if (event.keyCode == 39) /* Right */
   {
      if (event.shiftKey)
         game.inputEvent = ZInputEvent.SHOOT_EAST;
      else
         game.inputEvent = ZInputEvent.WALK_EAST;
      return true;
   }
   else if (event.keyCode == 40) /* Down */
   {
      if (event.shiftKey)
         game.inputEvent = ZInputEvent.SHOOT_SOUTH;
      else
         game.inputEvent = ZInputEvent.WALK_SOUTH;
      return true;
   }

   return false;
}

function gameKeyDown(event)
{
   if (game.dialog)
      game.dialog.keydown(event);
   else if (game.atTitleScreen)
      mainMenuKeyDown(event);
   else
      inGameKeyDown(event);
}

function gameInit(canvas)
{
   // gotta start somewhere.
   game.console = new TextConsole(canvas, 80, 25);

   var opts = parseFragmentParams();

   // Initialize the console.
   game.console.init(function() {
      game.console.resizeToScreen();
      game.console.redraw();

      // Resize the console when the window resizes.
      window.addEventListener("resize", function() {
         game.console.resizeToScreen();
      }, false);

      window.addEventListener("keydown", gameKeyDown, false);

      game.console.onclick = function(event)
      {
         if (game.debug)
         {
            if (event.cellX < 60 && game.world)
            {
               var board = game.world.board[game.world.playerBoard];
               // find the tile at this location
               var tile = board.tiles[event.cellY*60+event.cellX];
               console.log({x:event.cellX,y:event.cellY});
               console.log(tile);
            }
         }
      }
   });

   game.audio = new ZZTAudio();

   if (!opts.world)
      opts.world = "town.zzt";

   gameLoad("worlds/" + opts.world);
}

function goToTitleScreen()
{
   game.world.currentBoard = game.world.board[0];

   /* remove the player from the title screen */
   /*
   if (game.world.currentBoard.player)
   {
      var obj = new Empty;
      obj.x = game.world.currentBoard.player.x;
      obj.y = game.world.currentBoard.player.y;
      game.world.currentBoard.set(
         game.world.currentBoard.player.x,
         game.world.currentBoard.player.y,
         obj);
      game.world.currentBoard.player = null;
   }
   */

   game.atTitleScreen = true;
}

function gameLoad(url)
{
   game.worldurl = url;
   var worldLoader = new ZZTWorldLoader();
   worldLoader.init(game.worldurl, function(world) {
      game.world = world;
      game.dialog = null;
      goToTitleScreen();
      gameTick();
   });
}

function drawTitleScreenStatusBar()
{
   game.console.setString(62, 7, " W ", VGA.ATTR_BG_CYAN);
   game.console.setString(66, 7, "World", VGA.ATTR_BG_BLUE|VGA.ATTR_FG_YELLOW);
   game.console.setString(69, 8, game.world.worldName, VGA.ATTR_BG_BLUE|VGA.ATTR_FG_WHITE);

   game.console.setString(62, 11, " P ", VGA.ATTR_BG_GRAY);
   game.console.setString(66, 11, "Play", VGA.ATTR_BG_BLUE|VGA.ATTR_FG_WHITE);
   game.console.setString(62, 12, " R ", VGA.ATTR_BG_CYAN);
   game.console.setString(66, 12, "Restore game", VGA.ATTR_BG_BLUE|VGA.ATTR_FG_YELLOW);

   game.console.setString(62, 16, " A ", VGA.ATTR_BG_CYAN);
   game.console.setString(66, 16, "About ZZT!", VGA.ATTR_BG_BLUE|VGA.ATTR_FG_WHITE);
   game.console.setString(62, 17, " H ", VGA.ATTR_BG_GRAY);
   game.console.setString(66, 17, "High Scores", VGA.ATTR_BG_BLUE|VGA.ATTR_FG_YELLOW);
   game.console.setString(62, 18, " E ", VGA.ATTR_BG_CYAN);
   game.console.setString(66, 18, "Board Editor", VGA.ATTR_BG_BLUE|VGA.ATTR_FG_YELLOW);

   game.console.setString(62, 21, " S ", VGA.ATTR_BG_GRAY);
   game.console.setString(66, 21, "Game speed:", VGA.ATTR_BG_BLUE|VGA.ATTR_FG_YELLOW);
   game.console.setString(66, 23, "F....:....S", VGA.ATTR_BG_BLUE|VGA.ATTR_FG_YELLOW);
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
   if (game.quiet)
      game.console.setString(66, 15, "Be noisy", VGA.ATTR_BG_BLUE|VGA.ATTR_FG_WHITE);
   else
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

   if (game.atTitleScreen)
      drawTitleScreenStatusBar();
   else
      drawGameStatusBar();
}

function gameTick()
{
   setTimeout(function() {
      if (game.dialog && game.dialog.done)
      {
         /* If the dialog is done, we're doing to dismiss it. */
         /* However, we do want to execute the callback. */
         var dialog = game.dialog;
         game.dialog = null;
         if (dialog.callback)
         {
            if (dialog.callback(dialog.done))
               return;
         }
      }

      /* queue up the next tick */
      window.requestAnimationFrame(gameTick);

      /* if we're actually playing, handle player-related timeouts */
      if (game.world.currentBoard == game.world.board[0])
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

      var board = game.world.currentBoard;

      game.tick++;

      // now, iterate through all objects on the board and update them
      board.update();

      /* update the status bar */
      drawStatusBar();
      /* update the console */
      board.draw(game.console);

      if (game.dialog)
         game.dialog.draw(game.console);

      /* redraw the whole console */
      game.console.redraw();
   }, 1000 / game.fps);
}

