'use strict';

function ZZTAudio()
{
}

ZZTAudio.prototype.SFX_TORCH_DEAD = "tc-c-c";
ZZTAudio.prototype.SFX_PLAYER_DEAD = "s.-cd#g+c-ga#+dgfg#+cf----q.c";
ZZTAudio.prototype.SFX_ENERGIZER_DEAD = "s.-c-a#gf#fd#c";
ZZTAudio.prototype.SFX_TIME_RUNNING_OUT = "i.+cfc-f+cfq.c";

/* table of note frequencies */
ZZTAudio.prototype.NOTES = function()
{
   var notes = new Array(128);
   for (var i = 0; i < 128; ++i)
   {
      notes[i] = 8.1758 * Math.pow(2.0, i / 12.0);
   }
   return notes;
}();

ZZTAudio.prototype.play = function(str)
{
   var octave = 5;
   var noteDuration = 32;

   var context;
   try
   {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      context = new AudioContext();
   }
   catch(e)
   {
      console.log("no audio context for you. :(");
   }

   var source = context.createOscillator();

   source.type = "square"; 

   var streamTime = 0.0;
   for (var i = 0; i < str.length; ++i)
   {
      var ch = str.charAt(i);
      var note = -1;

      /* TODO: doesn't handle the 1-2,4-9 'sound effects' */
      switch (ch)
      {
         case "c": note = (octave * 12); break;
         case "d": note = (octave * 12) + 2; break;
         case "e": note = (octave * 12) + 4; break;
         case "f": note = (octave * 12) + 5; break;
         case "g": note = (octave * 12) + 7; break;
         case "a": note = (octave * 12) + 9; break;
         case "b": note = (octave * 12) + 11; break;
         case "+": octave++; break;
         case "-": octave--; break;
         case "t": noteDuration = 32; break;
         case "s": noteDuration = 16; break;
         case "i": noteDuration = 8; break;
         case "q": noteDuration = 4; break;
         case "h": noteDuration = 2; break;
         case "w": noteDuration = 1; break;
         case "3": noteDuration /= 3; break;
         case "x": note = 0; break;
         default: break;
      }

      /* If it's a note, it might be followed by a sharp or flat */
      if (note >= 0 && (i+1 < str.length))
      {
         if (str.charAt(i+1) == '#')
            note++;
         else if (str.charAt(i+1) == '!')
            note--;
      }

      if (note >= 0)
      {
        var frequency = this.NOTES[note];
        var noteTime = (frequency * 2.0 / noteDuration) / 300;

        console.log("set frequency " + frequency + " at " + streamTime);
        source.frequency.setValueAtTime(frequency, streamTime);
        streamTime += noteTime;
      }
   }

   source.connect(context.destination);
   source.start(0);
   source.stop(streamTime);
}