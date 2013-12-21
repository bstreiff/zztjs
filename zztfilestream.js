'use strict';

function ZZTFileStream(arrayBuffer)
{
   this.dataView = new DataView(arrayBuffer);
   this.position = 0;
}

ZZTFileStream.prototype.getUint8 = function()
{
   return this.dataView.getUint8(this.position++);
}

ZZTFileStream.prototype.getBoolean = function()
{
   return this.dataView.getUint8(this.position++) > 0;
}

ZZTFileStream.prototype.getInt16 = function()
{
   var v = this.dataView.getInt16(this.position, true);
   this.position += 2;
   return v;
}

/* Strings are 1 byte length, followed by maxlen bytes of data */
ZZTFileStream.prototype.getFixedPascalString = function(maxlen)
{
   var len = this.getUint8();
   if (len > maxlen)
      len = maxlen;

   var str = this.getFixedString(len);

   /* advance the rest */
   this.position += (maxlen - len);
   return str;
}

ZZTFileStream.prototype.getFixedString = function(len)
{
   var str = "";
   for (var i = 0; i < len; ++i)
   {
      var ch = this.getUint8();
      if (ch == 13)
         str += "\n";
      else
         str += String.fromCharCode(ch);
   }
   return str;
}
