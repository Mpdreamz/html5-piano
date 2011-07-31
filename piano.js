var Piano = (function()
{
	var $chordSelector = $("#chordSelector");
	var $chordsInplay = $("#chordsInplay");
	var $canvas = $("#c");
	var context = $canvas[0].getContext('2d');

	var gaps = [3,7,10,14]
		, jumpTable = [2,3,5,6,7,9,10,12,13,14]
		, ebonies = [2,4,7,9,11,14,16,19,21,23];
	var xOffset = 1, yOffset = 1;

	var chords = "C C# D D# E F F# G G# A A# B C' C#' D' D#' E' F' F#' G' G#' A' A#' B' C'' C#'' D'' D#'' E'' F'' F#'' G'' G#'' A'' A#'' B'' C''' C#''' D''' D#''' E''' F''' F#''' G''' G#''' A''' A#''' B'''";

	this.chordsArray = chords.split(" ");

	//Constructorish

	context.strokeStyle = "black";
	context.fillStyle = "white";
	
	$.each(Chords, function (i,v)
	{
		$chordSelector.append("<option value='"  + v[0] + "'>"  + v[0] + "</option>");
	});
	$.each(this.chordsArray, function (i,v)
	{
		$chordsInplay.append("<audio src=\"resources/"  +  escape(v) + ".ogg\" preload='auto'></audio>");
	});
	//Public methods
	this.drawPiano = function (selectedKeys) 
	{
		var selectedKeys = selectedKeys || [];
		var key = 1, skipped = 0;

		keyLooper(selectedKeys, drawIvoryKey, null);
		keyLooper(selectedKeys, null, drawEbonyKey);
	};


	//Private methods

	var keyLooper = function(selectedKeys, beforeSkipHandler, afterSkipHandle)
	{
		var key = 0, skipped = 0;
		while (key < 28) 
		{
			if (beforeSkipHandler != null)  //assume function
				beforeSkipHandler.call(this, selectedKeys, key, skipped);
			if (gaps.indexOf((key % 14) + 1) < 0)
			{
				skipped++;
				if (afterSkipHandle!= null)  //assume function
					afterSkipHandle.call(this, selectedKeys, key, skipped);
			}
			key++;
		}
	};
    
	var getDefaultColorForKey = function (key)
	{
		return key >= 14 ? "grey" : "black";
	}
	
	var drawEbonyKey = function(selectedKeys, key, skipped)
	{
		var keyX = (key * 30) + xOffset;
		var letterx = (key * 30) + 21; 
		var drawingKey = (key + 1) + skipped;

		
		context.fillStyle = (selectedKeys.indexOf(drawingKey) > -1) ? "#CEF" : getDefaultColorForKey(key);
		context.fillRect(keyX + 20 ,yOffset,20, 75);

		context.strokeRect(keyX + 20 ,yOffset,20,75);
		context.fillStyle = (selectedKeys.indexOf(drawingKey) > -1) ? "black" : "white";
		context.fillText(chordsArray[key + skipped], keyX + 22, yOffset + 40);
		context.fillStyle = getDefaultColorForKey(key)
	};

	var drawIvoryKey = function(selectedKeys, key, skipped)
	{
		var keyX = (key * 30) + xOffset;
		var letterx = (key * 30) + 11 + xOffset;
		var drawingKey = (key + 1) + skipped;

		context.fillStyle = (selectedKeys.indexOf(drawingKey) > -1) ? "#CEF" : "white";
		context.fillRect(keyX ,yOffset,30,150);
    
		context.strokeRect(keyX ,yOffset,30,150);
		context.fillStyle = "black";
		context.fillText(this.chordsArray[(key) + skipped], letterx  , yOffset + 110);
		context.fillStyle = "white";
	}


	var isInRect = function (x,y,rx,ry,rw,rh)
	{
		return (x >= rx && x <= rx+rw) && (y >= ry && y <= ry+rh);
	};
	var isInPiano = function(x,y)
	{
		return isInRect(x,y,xOffset,yOffset,420,150);
	};

	var findIvoryKey = function (x, y)
	{
	   var key = Math.ceil((x - xOffset) / 30)
		if (jumpTable.indexOf(key) > -1)
		{
			key = key + (jumpTable.indexOf(key) + 1);
		}
		else {
			for (var i = 0;key > 1 && i<jumpTable.length;i++) {
				if (jumpTable[i] > key)
				{
					key = key + i;
					break;
				}
			}
		}
		return key;
	}
	var actuallyOnEbonyKey = function(key, x, y)
	{
		x = x - xOffset, y = y - yOffset;
		var m = (x % 30);
		var k = key;

		if ((y >= 75) || (m > 10 && m < 20))
			return key;

		((m >= 10 || m == 0) ? k++ : k--);

		return ebonies.indexOf(k) < 0 ? key : k;
	}
	
	var getChordKeysForRootKey = function(key)
	{
		var selectedChord = $("#chordSelector option:selected").val();
		var keys = [key];
		for (var i = 0; i < Chords.length; i++)
		{
			if (Chords[i][0] == selectedChord)
			{
				keys = [];
				for (var c = 0; c < Chords[i][1].length; c++)
				{
					keys.push(Chords[i][1][c] + (key - 1));
				}
				break;
			}
		}
			
		return keys;
	}
	
	
	var mouseMoveHandler = function(e)
	{      
		var x = Math.floor((e.pageX-$("#c").offset().left));
		var y = Math.floor((e.pageY-$("#c").offset().top));
		if (!isInPiano(x,y))
			return;

		var key = findIvoryKey(x, y);
		key = actuallyOnEbonyKey(key, x, y); 
		
		var keys = getChordKeysForRootKey(key);
		
		this.drawPiano(keys);

	};
	
	this.playNotes = function (selectedKeys)
	{
		selectedKeys = selectedKeys || [];
		if (selectedKeys.length == 0)
			return;
		
		for (var i = 0; i < selectedKeys.length; i++)
		{
				var a = $chordsInplay.append("<audio src='resources/"+ escape(this.chordsArray[selectedKeys[i] - 1]) +".ogg' autoplay='true'></audio>");
				a.find("audio:last").bind("ended", function (e) 
				{ 
					$(this).remove(); 
				});
		}	
	}
	
	
	var mouseClickHandler = function(e)
	{      
		var x = Math.floor((e.pageX-$("#c").offset().left));
		var y = Math.floor((e.pageY-$("#c").offset().top));
		if (!isInPiano(x,y))
			return;

		var key = findIvoryKey(x, y);
		key = actuallyOnEbonyKey(key, x, y); 
		var keys = getChordKeysForRootKey(key);
		this.playNotes(keys);

	};

	//REGISTER EVENTS

	$("#c").mousemove($.proxy(mouseMoveHandler, this));
	$("#c").click($.proxy(mouseClickHandler, this));


	//KICK OFF 
	this.drawPiano();
})();


