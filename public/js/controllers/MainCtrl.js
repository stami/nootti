// public/js/controllers/MainCtrl.js
angular.module('MainCtrl', ['NoottiService'])

.controller('MainController', ['$scope', 'Nootti', '$timeout', '$filter', function($scope, Nootti, $timeout, $filter) {

	$scope.notes         = []; 	 // holds all notes from database
	$scope.visibleNotes  = [];	 // notes currently visible (filtered)
	$scope.current       = undefined; // current note object
	$scope.current_index = -1;	 // current index in listing (visible)
	$scope.enableFilter  = true; // flag indicating wheter or not list should be filtered by searchText input
	$scope.state         = '';   // used to display a little 'saving' -text in ui

	// First get data from db
	Nootti.get().success(function(data){
		applyRemoteData(data);
		$scope.visibleNotes = $scope.notes;
	});


	$scope.$watch('current_index', function() {
		if ($scope.current_index >= 0) {
			$scope.enableFilter = false; // disable filtering when moving with arrows
			enableAutoSave = false;
			$scope.visibleNotes = $scope.filteredNotes;
			$scope.searchText = document.getElementsByClassName('title')[$scope.current_index].outerText.trim();
			$scope.current = getNoteByTitle($scope.searchText);
			document.getElementsByClassName('titlerow')[$scope.current_index].scrollIntoView(false);
			// console.log('notes :');
			// console.log($scope.notes);
			// console.log('visible notes :');
			// console.log($scope.visibleNotes);

		}
	});


	// =========== Auto Save ================================

	// prevent saving when note open but not changed
	var enableAutoSave = false;

    var saveUpdates = function() {
    	console.log('updating note!!');
    	$scope.current.updated_at = new Date();
    	Nootti.update($scope.current).success(function(){
    		$scope.state = 'saved';
    		$timeout(function(){ $scope.state = ''; }, 500);
    	});
    };

	var timeout = null;

	var debounceUpdate = function(newVal, oldVal) {
		if (newVal != oldVal && enableAutoSave) {
			if (timeout) {
				$timeout.cancel(timeout);
			}
			timeout = $timeout(saveUpdates, 500);
		}
	};

	$scope.$watch('current.content', debounceUpdate);

	// =========== Auto Save end =============================


	// Called when enter pressed on searchText input
    $scope.searchOrCreate = function() {

    	if ($scope.searchText.length > 1) {

    		if (getNoteByTitle($scope.searchText) === null) {
				// title not found in list, create new note
	    		console.log('creating new note...');

	    		Nootti.create({
	    			title: $scope.searchText,
	    			content: ''
	    		}).success(function(data) {
	    			console.log(data);
	    			refresh($scope.searchOrCreate);
			    	// document.getElementById('editingArea').focus();
	    		});
	    	} else {
	    		// note found from filtered list
	    		// open it into editing area
	    		$scope.current = getNoteByTitle($scope.searchText);
		    	document.getElementById('editingArea').focus();
	    		console.log('open note "'+ $scope.current.title +'" to editing...');

	    	}
	    }

    };

    $scope.deleteCurrent = function() {
    	Nootti.delete($scope.current._id)
    		.success(function(data) {
    			console.log('deleted note "'+ data.title +'"');
    			$scope.searchText = '';
    			$scope.current = undefined;
    			refresh();
    		});
    };

    $scope.handleKeyPress = function($event){
	    // console.log($event.keyCode);
	    if ($event.keyCode == 40) { // arrow down
	    	if ($scope.current_index < $scope.visibleNotes.length - 1) {
	    		$scope.current_index++;
	    	}
	    }
	    else if ($event.keyCode == 38) { // arrow up
	    	if ($scope.current_index > 0) {
	    		$scope.current_index--;
	    	}
	    }
	    else if ($event.keyCode === 13) {} // enter: ignore, ng-submit takes care of this
	    else { // chars are 48-90
	    	// something written in input (not arrows or enter)
	    	// reset filtering
	    	$scope.visibleNotes = $scope.notes;
			$scope.enableFilter = true;
			$scope.current_index = -1;
	    }
	};

	// called at onKeyUp() on editingArea
	$scope.enableAutoSave = function() {
		enableAutoSave = true;
	};

    $scope.selectNote = function(index) {
    	$scope.current_index = index;
    	document.getElementById('searchText').focus();
    };

    // count of words in text
    $scope.countOf = function(text) {
	    var s = text ? text.split(/\s+/) : 0; // splits the text on space/tab/enter
	    return s ? s.length : 0;
	};

    function applyRemoteData(data) {
    	$scope.notes = data;
    }

    function resetVisible() {
    	$scope.visibleNotes = $scope.notes;
    	$scope.current_index = -1;
    	document.getElementById('searchText').focus();
    }

    function refresh(doafter) {
	    Nootti.get().success(function(data){
			applyRemoteData(data);
			resetVisible();

			if (doafter !== undefined) {
				doafter();
			}
		});
    }

    // Search from filtered notes list
    function getNoteByTitle(title) {
    	for (var i = $scope.visibleNotes.length - 1; i >= 0; i--) {
    		if ($scope.visibleNotes[i].title === title) {
    			return $scope.visibleNotes[i];
    		}
    	}
    	return null;
    }


}])

.filter('noteFilter', function () {
    return function(input, filter, isEnabled) {


        // if isEnabled then filter
        if (isEnabled) {

	    	// console.log(input);
	    	// console.log(filter);
	    	// console.log(isEnabled);

            var filtered = [];

            // if filter not given, rank results in original order
	    	if (filter === undefined) {
	    		for (var i=0; i<input.length; i++) {
	    			input[i].ranking = i;
	    			filtered.push(input[i]);
	    		}
	    		return filtered;
	    	}

            filter = filter.toLowerCase(); // case insensitive

            for (var i=0; i<input.length; i++) {
            	var current = input[i];
            	var index = current.title.toLowerCase().indexOf(filter);
            	if( index >= 0 ) {
            		// filter text found

            		// how many extra chars there are
            		var before = index;
            		var after = current.title.length - (index + filter.length);

            		// let's rank items by it
            		current.ranking = before*2 + after;

                    filtered.push(current);
            	}
            }

            return filtered;

        }
        // return with no filtering
        else{
          return input;
        }

    };
});