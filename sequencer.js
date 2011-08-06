var Sequencer = new (function()
{
	var currentTimeBlock = 0;
	var timer = null;

	//array of sequencers holding 32 [key, chord] arrays.
	var sequencers = [];
	var blockMarkedForEditing = [-1, -1];

	var sequenceColors = ["green", "purple"];


	this.getHash = function()
	{
		var harr = [];
		for (var s = 0;s < sequencers.length;s++)
		{
			harr.push([]);
			for (var i = 0;i < sequencers[s].length;i++)
			{
				var c = sequencers[s][i]
				if (c.length == 2)
					harr[s].push([i, c[0], c[1]])
			}
		}

		return btoa(JSON.stringify(harr));
	}

	this.isInEditMode = function()
	{
		return blockMarkedForEditing[0] > -1 
			&& blockMarkedForEditing[1] > -1;
	}
	this.markBlockForEditing = function(sequencerIndex, blockIndex)
	{
		blockMarkedForEditing = [sequencerIndex, blockIndex];
	};
	this.getBlockMarkedForEditing = function()
	{
		return blockMarkedForEditing;
	}
	this.fillBlockMarkedForEditing = function(key, chord)
	{
		var seq = blockMarkedForEditing[0];
		var block = blockMarkedForEditing[1];
		if (seq < 0 || block < 0)
			return;

		sequencers[seq][block] = [key, chord];
		blockMarkedForEditing = [-1, -1];
	};
	this.emptyBlockMarkedForEditing = function()
	{
		var seq = blockMarkedForEditing[0];
		var block = blockMarkedForEditing[1];
		if (seq < 0 || block < 0)
			return;

		sequencers[seq][block] = [];
		blockMarkedForEditing = [-1, -1];
	};

	this.getCurrentTimeBlock = function()
	{
		return currentTimeBlock;
	}
	this.setCurrentTimeBlock = function(block)
	{
		if (block > 32)
			return;
		currentTimeBlock = block;
	}
	
	this.isSequencerBlockSelected = function(sequencerIndex, blockIndex)
	{
		var seq = sequencers[sequencerIndex];
		var selected = (seq && $.isArray(seq[blockIndex]) && seq[blockIndex].length == 2);
		return selected;
	};
	this.getSequencerColor = function(index)
	{
		return sequenceColors[index];
	}
	this.getTotalSequencers = function ()
	{
		return sequenceColors.length;
	}
	this.initializeState = function()
	{
		sequencers = [];
		fillSequencerSlots();	
	};
	var fillSequencerSlots = function ()
	{
		var harr = [];
		if (window.location.hash.length > 0)
			harr = JSON.parse(atob(window.location.hash.substr(1)));
		if (sequencers == null)
			sequencers = [];
		for (var i = 0; i < sequenceColors.length;i++)
		{
			var seq = [];
			for (var p = 0; p < 32;p++)
			{
				seq[p] = [];
			}
			sequencers.push(seq);		
		}
		for (var i = 0; i < harr.length;i++)
		{
			var seq = harr[i];
			for (var k = 0; k < seq.length;k++)
			{
				var info = seq[k];
				if (info.length == 3)
					sequencers[i][info[0]] = [info[1], info[2]];
			}
		}
	}

	this.setSequencerSpeed = function (speed)
	{
		if (timer != null)
			clearInterval(timer);
		timer = setInterval(timeBlockAdvance, speed);
	};

	this.getCurrentSequencedChords = function()
	{
		var chordColorArray = [];
		for (var s = 0; s < sequencers.length;s++)
		{
			var stepchord = sequencers[s][currentTimeBlock];
			if (stepchord && stepchord.length == 2)
			{
				var key = stepchord[0];
				var chord = stepchord[1];
				chordColorArray.push([Sequencer.getSequencerColor(s), key, chord])
			}
		}
		return chordColorArray;
	};


	var timeBlockAdvance = function ()
	{
		$("body").trigger('nextstep');
		for (var s = 0; s < sequencers.length;s++)
		{
			var stepchord = sequencers[s][currentTimeBlock];
			if (stepchord && stepchord.length == 2)
			{
				var key = stepchord[0];
				var chord = stepchord[1];
				$("body").trigger('stepplay', [key, chord]);
			}
		}

		currentTimeBlock = (currentTimeBlock + 1) % 32;
	};


	fillSequencerSlots();
	this.setSequencerSpeed(600);

});