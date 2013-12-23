'use strict';

/*

http://zzt.org/fora/viewtopic.php?f=18&t=3345&start=15#p65718
At #cycle 1, a sixteenth note has the length of 1 idle.


http://zzt.org/fora/viewtopic.php?f=9&t=3124&p=62791&hilit=cycle+game+speed#p62791

So i guess ZZT's frame rate ought to be 9.1032548384 frames/sec. Though I can think
of advantages with picking 10 frames/sec (ideal numbers vs. subtle familiarity of speed).
*/

function ZZTAudio()
{
   try
   {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      this.context = new AudioContext();
   }
   catch(e)
   {
      console.log("no audio context for you. :(");
      console.log(e);
      return;
   }
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
   if (game.quiet)
      return;

   var octave = 5;
   var noteDuration = 32;

   if (this.oscillator)
   {
      this.oscillator.disconnect();
   }
   this.oscillator = this.context.createOscillator();
   this.oscillator.type = "square"; 
   this.oscillator.connect(this.context.destination);

   var streamTime = 0;
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

         /* Duration here is given in terms of division of a cycle. */
         case "t": noteDuration = 32; break; /* 1/32th note */
         case "s": noteDuration = 16; break; /* 1/16th note */
         case "i": noteDuration = 8; break;  /* 1/8th note */
         case "q": noteDuration = 4; break;  /* 1/4th note */
         case "h": noteDuration = 2; break;  /* 1/2th note */
         case "w": noteDuration = 1; break;  /* whole note */
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
         /* A sixteenth note has the duration of one cycle. */
         var noteTime = (1 / noteDuration) * (16 / game.fps);

         this.oscillator.frequency.setValueAtTime(frequency, this.context.currentTime + streamTime);
         streamTime += noteTime;
      }
   }

   this.oscillator.start(this.context.currentTime, 0, streamTime);
   this.oscillator.stop(this.context.currentTime + streamTime);
}
