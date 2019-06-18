export default{
  
  //输入框的输入限制
   getInputVal: function(val, max) {
    var returnValue = '';
    var byteValLen = 0;
    for (var i = 0; i < val.length; i++) {
        if (val[i].match(/[^\x00-\xff]/ig) != null)
        byteValLen += 1;
        else
        byteValLen += 0.5;
        if (byteValLen > max)
        break;
        returnValue += val[i];
    }
    return returnValue;
  },
   /*
  * 一个汉字算一个字,一个英文字母或数字算半个字
  */
  getZhLen: function (val) {
      var len = 0;
      for (var i = 0; i < val.length; i++) {
        var a = val.charAt(i);
        if (a.match(/[^\x00-\xff]/ig) != null) {
          len += 1;
        }
        else {
          len += 0.5;
        }
      }
      return Math.ceil(len);
  },

}