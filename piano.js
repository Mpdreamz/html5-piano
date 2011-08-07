var Piano = (function()
{
	var $chordSelector = $("#chordSelector");
	var $chordsInplay = $("#chordsInplay");
	var $canvas = $("#c");
	var context = $canvas[0].getContext('2d');

	var gaps = [3,7,10,14]
		, jumpTable = [2,3,5,6,7,9,10,12,13,14]
		, ebonies = [2,4,7,9,11,14,16,19,21,23];
	var xOffset = 1, yOffset = 1, currentX = 0, currentY = 0;

	var chords = "C C# D D# E F F# G G# A A# B C' C#' D' D#' E' F' F#' G' G#' A' A#' B' C'' C#'' D'' D#'' E'' F'' F#'' G'' G#'' A'' A#'' B'' C''' C#''' D''' D#''' E''' F''' F#''' G''' G#''' A''' A#''' B'''";

	this.chordsArray = chords.split(" ");
	
	//Constructorish
	context.strokeStyle = "black";
	context.fillStyle = "white";
	
	$.each(Chords, function (i,v)
	{
		$chordSelector.append("<option value='"  + v[0] + "'>"  + v[0] + "</option>");
	});
	

	var drawWaitingMessage = function()
	{
		context.fillStyle = "black";
		context.font = "24px sans-serif";
		context.fillText("Loading data...", 320, 120);
		context.font = "10px sans-serif";
	}
	
	//Public methods
	this.drawPiano = function (selectedKeys) 
	{
		var selectedKeys = selectedKeys || [];
		var key = 1, skipped = 0;
		
		var sequencedKeys = [];
		var sequencedChords = Sequencer.getCurrentSequencedChords();
		for (var i = 0;i < sequencedChords.length;i++) 
		{
			var s = sequencedChords[i];
			sequencedKeys.push([s[0], getChordKeysForRootKeyByIndex(s[1], s[2])]);
		}

		keyLooper(selectedKeys, sequencedKeys, drawIvoryKey, null);
		keyLooper(selectedKeys, sequencedKeys, null, drawEbonyKey);
		
		drawTimeBlocks();
	};


	//Private methods
    var drawTimeBlocks = function ()
	{
		var offset = (844) - ((25 * 32 )+ xOffset)
		var seqData = Sequencer.getBlockMarkedForEditing();
		for (var i = 0; i < 32;i++)
		{
			var keyX = (i * 25) + offset;
			
			context.fillStyle = (getSequencerPositionBlock(currentX, currentY) == i) 
				? "#CEF" : "white";
			if (i == Sequencer.getCurrentTimeBlock())
				context.fillStyle = "orange";

			context.strokeStyle = "grey";
			context.strokeRect(keyX ,yOffset + 160,25,10);
			context.fillRect(keyX ,yOffset + 160,25,10);
		}
		for (var s = 0; s < Sequencer.getTotalSequencers(); s++)
		{
			for (var i = 0; i < 32;i++)
			{
				var keyX = (i * 25) + offset;
			

				var selected = Sequencer.isSequencerBlockSelected(s, i);
				var color = selected ? Sequencer.getSequencerColor(s) : "white";
				
				
				if (isInRect(currentX, currentY, keyX, 175 + (s * 20), 24, 20))
					color = "#CEF";
				if ((seqData[0] == s && seqData[1] == i))
					color = "red";
				context.fillStyle = color;
				context.strokeStyle = "black";
				context.fillRect(keyX ,yOffset + 175 + (s * 20),25,20);
				context.strokeRect(keyX ,yOffset + 175 + (s * 20),25,20);
			}
		}
	};
	var keyLooper = function(selectedKeys, sequencedKeys,
		 beforeSkipHandler, afterSkipHandle)
	{
		var key = 0, skipped = 0;
		while (key < 28) 
		{
			if (beforeSkipHandler != null)  //assume function
				beforeSkipHandler.call(this, selectedKeys, sequencedKeys, key, skipped);
			if (gaps.indexOf((key % 14) + 1) < 0)
			{
				skipped++;
				if (afterSkipHandle!= null)  //assume function
					afterSkipHandle.call(this, selectedKeys, sequencedKeys, key, skipped);
			}
			key++;
			
			
			
		}
	};
    
	var getDefaultColorForKey = function (key)
	{
		return key >= 14 ? "grey" : "black";
	}
	
	var drawEbonyKey = function(selectedKeys, sequencedKeys, key, skipped)
	{
		var keyX = (key * 30) + xOffset;
		var letterx = (key * 30) + 21; 
		var drawingKey = (key + 1) + skipped;

		
		context.fillStyle = getFillStyle(selectedKeys, sequencedKeys, 
			drawingKey, getDefaultColorForKey(key));
		context.fillRect(keyX + 20 ,yOffset,20, 75);

		context.strokeRect(keyX + 20 ,yOffset,20,75);
		context.fillStyle = (selectedKeys.indexOf(drawingKey) > -1) ? "black" : "white";
		context.fillText(chordsArray[key + skipped], keyX + 22, yOffset + 40);
		context.fillStyle = getDefaultColorForKey(key)
	};

	var drawIvoryKey = function(selectedKeys, sequencedKeys, key, skipped)
	{
		var keyX = (key * 30) + xOffset;
		var letterx = (key * 30) + 11 + xOffset;
		var drawingKey = (key + 1) + skipped;

		context.fillStyle = getFillStyle(selectedKeys, sequencedKeys, drawingKey, "white");
		context.fillRect(keyX ,yOffset,30,150);
    
		context.strokeRect(keyX ,yOffset,30,150);
		context.fillStyle = "black";
		context.fillText(this.chordsArray[(key) + skipped], letterx  , yOffset + 110);
		context.fillStyle = "white";
	}


	var getFillStyle = function (selectedKeys, sequencedKeys, drawingKey, defaultFillColor)
	{
		var color = defaultFillColor;
		for (var i =0; i < sequencedKeys.length;i++)
		{
			var c = sequencedKeys[i];
			if (c[1].indexOf(drawingKey) > -1)
				color = c[0];
		}
		if (selectedKeys.indexOf(drawingKey) > -1)
			color = "#CEF";
		if (Sequencer.isInEditMode() && selectedKeys.indexOf(drawingKey) > -1)
			color = "red";
		return color;
	}

	var isInRect = function (x,y,rx,ry,rw,rh)
	{
		return (x >= rx && x <= rx+rw) && (y >= ry && y <= ry+rh);
	};
	var isInPiano = function(x,y)
	{
		return isInRect(x,y,xOffset,yOffset,420,150);
	};
	var isInASequencer = function(x,y)
	{
		var xo = (844) - ((25 * 32 )+ xOffset);
		var w = (25 * 32)+ xOffset;
		var sequencers = Sequencer.getTotalSequencers();
		return isInRect(x,y,xo,yOffset + 175,w,20 * (sequencers));
	};
	var isInSequencerPostionBar = function(x,y)
	{
		var xo = (844) - ((25 * 32 )+ xOffset);
		var w = (25 * 32)+ xOffset;
		return isInRect(x,y,xo,yOffset + 160,w,10);
	};
	var getSequencerAndBlock = function(x,y)
	{
		if (!isInASequencer(x,y))		
			return;
		var xo = (844) - ((25 * 32 )+ xOffset);

		var seq = Math.floor((y - (yOffset + 175)) / 20);
		var block = Math.floor((x - xo) / 25);
		return [seq, block];

	};
	var getSequencerPositionBlock = function(x,y)
	{
		if (!isInSequencerPostionBar(x,y))		
			return;
		var xo = (844) - ((25 * 32 )+ xOffset);

		var block = Math.floor((x - xo) / 25);
		return block;

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
	
	var getChordKeysForRootKeyByIndex = function(key, chord)
	{
		var keys = [];
		for (var c = 0; c < Chords[chord][1].length; c++)
		{
			keys.push(Chords[chord][1][c] + (key - 1));
		}
		return keys;
	};

	var getSelectedChordIndex = function()
	{
		var selectedChord = $("#chordSelector option:selected").val();
		for (var i = 0; i < Chords.length; i++)
		{
			if (Chords[i][0] == selectedChord)
			{
				return i;
			}
		}
		return -1;
		
	}

	var getChordKeysForRootKey = function(key)
	{
		var selectedChord = getSelectedChordIndex();
		var keys = [key];
		if (selectedChord < 0)
			return keys;

		return getChordKeysForRootKeyByIndex(key, selectedChord);
	}
	
	var getKeysForMousePosition = function(x, y)
	{
		if (!isInPiano(x,y))
			return;
		var key = findIvoryKey(x, y);
		key = actuallyOnEbonyKey(key, x, y); 
		
		var keys = getChordKeysForRootKey(key);
		
		return keys;
	};
	
	var mouseMoveHandler = function(e)
	{      
		var x = Math.floor((e.pageX-$("#c").offset().left));
		var y = Math.floor((e.pageY-$("#c").offset().top));
		currentX = 0;
		currentY = 0;
	
		if (isInPiano(x,y)
			|| isInASequencer(x,y)
			|| isInSequencerPostionBar(x, y))
		currentX = x;
		currentY = y;
		
		
		var keys = (isInPiano(x,y)) ? getKeysForMousePosition(x, y) : [];
		
		this.drawPiano(keys);

	};
	
	this.playNotes = function (selectedKeys)
	{
		selectedKeys = selectedKeys || [];
		if (selectedKeys.length == 0)
			return;
		var chordElements = "";
		/*
		$.each($chordsInplay.find("audio"), function(e) 
		{ 
			this.src = "";
			//this.pause(); 
			$(this).remove(); 
		});
		*/
		for (var i = 0; i < selectedKeys.length; i++)
		{
			var note = this.chordsArray[selectedKeys[i] - 1];
			chordElements += "<audio src='"+  Base64EncodedNotes[note] +"'></audio>";
		}	
		$(chordElements)
			.bind('ended', function(e) { 
				$(this).remove(); 
			})
			.bind('canplay', function(e) { 
				this.play();
			}).appendTo($chordsInplay);
	}
	
	
	var mouseClickHandler = function(e)
	{      
		var x = Math.floor((e.pageX-$("#c").offset().left));
		var y = Math.floor((e.pageY-$("#c").offset().top));
		if (isInPiano(x,y))
		{
			var key = findIvoryKey(x, y);
			key = actuallyOnEbonyKey(key, x, y); 
			var keys = getChordKeysForRootKey(key);
			if (Sequencer.isInEditMode())
			{
				Sequencer.fillBlockMarkedForEditing(key, getSelectedChordIndex());
				var hash = Sequencer.getHash();
				window.location.hash = hash;
				if (history.state == null || history.state.hash != hash)
					history.pushState({hash: hash}, window.title, window.location);
				var tweetUrl = "http://twitter.com/share?text=Check out what I made with HTML 5 piano";
				tweetUrl += "&url=" + window.location;
				$(".twitter-share-button").attr("src", tweetUrl);
			}
			this.playNotes(keys);
		}
		if (isInASequencer(x,y))
		{
			var currentEditingBlock = Sequencer.getBlockMarkedForEditing();
			var seqData = getSequencerAndBlock(x, y);
				
			var seq = seqData[0];
			var block = seqData[1];
			if (seq == currentEditingBlock[0] && block == currentEditingBlock[1])
			{
				Sequencer.emptyBlockMarkedForEditing();
			}
			else
				Sequencer.markBlockForEditing(seq, block);
			
		}
		if (isInSequencerPostionBar(x,y))
		{
			var block = getSequencerPositionBlock(x,y);
			Sequencer.setCurrentTimeBlock(block);
		}

	};
	
	var onSequencerNextStep = function(e)
	{
		var keys = getKeysForMousePosition(currentX, currentY);
		this.drawPiano(keys);
	};
	var onSequencerStepPlay = function(e, key, chord)
	{
		this.playNotes(getChordKeysForRootKeyByIndex(key, chord));
	};
	var onChangeSpeed = function (e)
	{
		var speed = $("#speedSelector option:selected").val();
		Sequencer.setSequencerSpeed(speed);
	};

	//REGISTER EVENTS

	$("#c").mousemove($.proxy(mouseMoveHandler, this));
	$("#c").click($.proxy(mouseClickHandler, this));
	$("body").live("nextstep", $.proxy(onSequencerNextStep, this));
	$("body").live("stepplay", $.proxy(onSequencerStepPlay, this));
	$("#speedSelector").change($.proxy(onChangeSpeed, this));
	$(window).bind("popstate", Sequencer.initializeState);
	//KICK OFF 
	drawWaitingMessage();
})();


