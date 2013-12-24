/*

   Dialog.

   The ZZT dialog is rendered like:

   |=========================|
    |         Title         |
    |=======================|
    |                       |
    |  Some text            |
    |> Text                <|
    |  More text            |
    |                       |
   |=========================|

   (It actually uses linedrawing characters, but I try to stick to ASCII
   encoded text for comments.)

   The .x, .y, .width, and .height are specified in terms of character cells.
   The selected line is always in the center.

   Text lines can come in three forms:
     'text'      - Regular text. Yellow-on-blue.
     '!msg;text' - Label selection. Solid purple arrow, rest of text is white.
                   Sends 'msg' to the object on selection.
     '$text'     - Header. Centered, white-on-blue.
*/

function _ZZTDialog_parseLine(line)
{
   var parsed = {};
   if (line.charAt(0) == "!")
   {
      // !msg;text
      var delim = line.slice(1).split(";");
      parsed.message = delim[0];
      parsed.text = delim[1];
   }
   else if (line.charAt(0) == "$")
   {
      // $text
      parsed.text = line.slice(1);
      parsed.centered = true;
   }
   else
   {
      parsed.text = line;
   }
   return parsed;
}

function ZZTDialog(title, lines)
{
   /* x/y/w/h includes the borders. */
   this.x = 5;
   this.y = 3;
   this.width = 49;
   this.height = 19;

   this.title = title;
   this.lines = [];
   for (var i = 0; i < lines.length; ++i)
   {
      this.lines.push(_ZZTDialog_parseLine(lines[i]))
   }

   this.selectedLine = 0;
   this.done = null;
}

ZZTDialog.prototype.keydown = function(event)
{
   if (event.keyCode == 40) /* down */
   {
      if (this.selectedLine < this.lines.length-2);
         this.selectedLine++;
   }
   else if (event.keyCode == 38) /* up */
   {
      if (this.selectedLine > 0)
         this.selectedLine--;
   }
   else if (event.keyCode == 13) /* enter */
   {
      this.done = { dialog: this, line: this.selectedLine };
   }
   else if (event.keyCode == 27) /* escape */
   {
      this.done = { dialog: this, cancelled: true };
   }
}

ZZTDialog.prototype.draw = function(textconsole)
{
   /* top row */
   textconsole.set(this.x,   this.y, 198, VGA.ATTR_FG_WHITE);
   textconsole.set(this.x+1, this.y, 209, VGA.ATTR_FG_WHITE);

   for (var x = this.x+2; x < this.x+this.width-2; ++x)
      textconsole.set(x, this.y, 205, VGA.ATTR_FG_WHITE);

   textconsole.set(this.x+this.width-2, this.y, 209, VGA.ATTR_FG_WHITE);
   textconsole.set(this.x+this.width-1, this.y, 181, VGA.ATTR_FG_WHITE);

   /* title row */

   textconsole.set(this.x,   this.y+1, 32, 0);
   textconsole.set(this.x+1, this.y+1, 179, VGA.ATTR_FG_WHITE);

   for (var x = this.x+2; x < this.x+this.width-2; ++x)
      textconsole.set(x, this.y+1, 32, VGA.ATTR_BG_BLUE);

   textconsole.setString(
      Math.floor((60 - this.title.length) / 2),
      this.y+1,
      this.title,
      VGA.ATTR_BG_BLUE|VGA.ATTR_FG_YELLOW);

   textconsole.set(this.x+this.width-2, this.y+1, 179, VGA.ATTR_FG_WHITE);
   textconsole.set(this.x+this.width-1, this.y+1, 32, 0);

   /* titlebar dividing row */

   textconsole.set(this.x,   this.y+2, 32, 0);
   textconsole.set(this.x+1, this.y+2, 198, VGA.ATTR_FG_WHITE);

   for (var x = this.x+2; x < this.x+this.width-2; ++x)
      textconsole.set(x, this.y+2, 205, VGA.ATTR_FG_WHITE);

   textconsole.set(this.x+this.width-2, this.y+2, 181, VGA.ATTR_FG_WHITE);
   textconsole.set(this.x+this.width-1, this.y+2, 32, 0);

   /* now, we do the text portion */

   var viewportHeight = this.height-4;
   var centerLineInViewport = Math.floor(viewportHeight/2);

   for (var l = 0; l < viewportHeight; ++l)
   {
      var y = this.y+3+l;

      textconsole.set(this.x,   y, 32, 0);
      textconsole.set(this.x+1, y, 179, VGA.ATTR_FG_WHITE);

      for (var x = this.x+2; x < this.x+this.width-2; ++x)
         textconsole.set(x, y, 32, VGA.ATTR_BG_BLUE);

      if (l == centerLineInViewport)
      {
         textconsole.set(this.x+2, y, 175, VGA.ATTR_BG_BLUE|VGA.ATTR_FG_BRED);
         textconsole.set(this.x+this.width-3, y, 174, VGA.ATTR_BG_BLUE|VGA.ATTR_FG_BRED);
      }

      var textLineIndex = this.selectedLine + (l - centerLineInViewport);
      if (textLineIndex < 0 || textLineIndex >= this.lines.length)
      {
         /* off the page */
         for (var x = this.x+2; x < this.x+this.width-2; ++x)
            textconsole.set(x, y, 32, VGA.ATTR_BG_BLUE);
      }
      else
      {
         if (l == centerLineInViewport)
            textconsole.set(this.x+2, y, 175, VGA.ATTR_BG_BLUE|VGA.ATTR_FG_BRED);
         else
            textconsole.set(this.x+2, y, 32, VGA.ATTR_BG_BLUE);
         textconsole.set(this.x+3, y, 32, VGA.ATTR_BG_BLUE);

         var line = this.lines[textLineIndex];

         if (line.message)
         {
            textconsole.set(this.x+6, y, 16, VGA.ATTR_BG_BLUE|VGA.ATTR_FG_BMAGENTA);
            textconsole.setString(this.x+9, y, line.text, VGA.ATTR_BG_BLUE|VGA.ATTR_FG_WHITE);
         }
         else if (line.centered)
         {
            textconsole.setString(
               Math.floor((60 - this.title.length) / 2), y,
               line.text, VGA.ATTR_BG_BLUE|VGA.ATTR_FG_WHITE);
         }
         else
         {
            textconsole.setString(this.x+4, y, this.lines[textLineIndex].text, VGA.ATTR_BG_BLUE|VGA.ATTR_FG_YELLOW);
         }

         textconsole.set(this.x+this.width-4, y, 32, VGA.ATTR_BG_BLUE);
         if (l == centerLineInViewport)
            textconsole.set(this.x+this.width-3, y, 174, VGA.ATTR_BG_BLUE|VGA.ATTR_FG_BRED);
         else
            textconsole.set(this.x+this.width-3, y, 32, VGA.ATTR_BG_BLUE);
      }

      textconsole.set(this.x+this.width-2, y, 179, VGA.ATTR_FG_WHITE);
      textconsole.set(this.x+this.width-1, y, 32, 0);
   }

   /* bottom row */
   textconsole.set(this.x,   this.y+this.height-1, 198, VGA.ATTR_FG_WHITE);
   textconsole.set(this.x+1, this.y+this.height-1, 207, VGA.ATTR_FG_WHITE);

   for (var x = this.x+2; x < this.x+this.width-2; ++x)
      textconsole.set(x, this.y+this.height-1, 205, VGA.ATTR_FG_WHITE);

   textconsole.set(this.x+this.width-2, this.y+this.height-1, 207, VGA.ATTR_FG_WHITE);
   textconsole.set(this.x+this.width-1, this.y+this.height-1, 181, VGA.ATTR_FG_WHITE);   
}
