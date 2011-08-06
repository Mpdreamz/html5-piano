var Sequencer = new (function()
{
	var currentTimeBlock = 0;
	var timer = null;

	//array of sequencers holding 32 [key, chord] arrays.
	var sequencers = [
		[[1, 3],[],[],[4, 2],[7, 7],[],[],[2, 6]]
	];
	var blockMarkedForEditing = [-1, -1];


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
	
	this.isSequencerBlockSelected = function(sequencerIndex, blockIndex)
	{
		var seq = sequencers[sequencerIndex];
		var selected = (seq && $.isArray(seq[blockIndex]) && seq[blockIndex].length == 2);
		return selected;
	};


	this.setTotalSequencers = function (numberOfWantedSequencers)
	{
		if (sequencers == null)
			sequencers = [];
		for (var i = 0; i < numberOfWantedSequencers;i++)
		{
			var seq = sequencers[i];
			if (!seq)
				seq = [];
			for (var p = 0; p < 32;p++)
			{
				if (!seq[p])
					seq[p] = [];
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
				chordColorArray.push(["green", key, chord])
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


	this.setTotalSequencers(1);
	this.setSequencerSpeed(600);

});