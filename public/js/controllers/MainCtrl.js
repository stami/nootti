// public/js/controllers/MainCtrl.js
angular.module('MainCtrl', ['NoottiService'])

.controller('MainController', ['$scope', 'Nootti', '$timeout', '$filter', function($scope, Nootti, $timeout, $filter) {

    $scope.notes = [];
    $scope.visibleNotes = [];
	$scope.current = undefined;
	$scope.current_index = -1;
	$scope.enableFilter = true;
	$scope.state = '';

	// First get data from db
	Nootti.get().success(function(data){
		applyRemoteData(data);
		$scope.visibleNotes = $scope.notes;
	});

	// Watch searchText input
	// $scope.$watch('searchText', function() {
	// 	// console.log('search text changed');
	// 	// $scope.current_index = -1;
	// 	$scope.visibleNotes = $scope.notes;
	// 	$scope.enableFilter = true;
	// });

	$scope.$watch('current_index', function() {
		if ($scope.current_index >= 0) {
			$scope.enableFilter = false;
			$scope.visibleNotes = $scope.filteredNotes;
			$scope.searchText = document.getElementsByClassName('title')[$scope.current_index].outerText.trim();
			$scope.current = $scope.visibleNotes[$scope.current_index];
			document.getElementsByClassName('title')[$scope.current_index].scrollIntoView(false);
		}
	});


	// =========== Auto Save ================================

    var saveUpdates = function() {
    	setState('saving');
    	console.log('updating note!!');
    	$scope.current.updated_at = new Date();
    	console.log($scope.current);
    	Nootti.update($scope.current).success(function(){
    		setState('saved');
    	});
    };

	var timeout = null;

	var debounceUpdate = function(newVal, oldVal) {
		if (newVal != oldVal) {
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
	    	
	    	// var current = getNoteByTitle($scope.searchText);
	    		
    		if (getNoteByTitle($scope.searchText) === null) {
				// title not found in list, create new note
	    		console.log('creating new note...');

	    		Nootti.create({
	    			title: $scope.searchText,
	    			content: ''
	    		}).success(function(data) {
	    			console.log(data);
	    			$scope.current = data; // set just created note editable
	    			refresh(resetVisible);
			    	document.getElementById('editingArea').focus();
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
    			refresh(resetVisible);
    		});
    };

    $scope.handleKeyPress = function($event){
	    console.log($event.keyCode);
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
	    else if ($event.keyCode === 13) {}
	    else { // chars are 48-90
	    	// something written in input (not arrow up or down)
	    	// reset filtering
	    	$scope.visibleNotes = $scope.notes;
			$scope.enableFilter = true;
			$scope.current_index = -1;
	    }

	    // update selected list item class
	    // elem[0].querySelectorAll('.titlerow')[$scope.current_index];
	};

    $scope.selectNote = function(index) {
    	$scope.current_index = index;
    };

    function applyRemoteData(data) {
    	$scope.notes = data;
    }

    function refresh(doafter) {
	    Nootti.get().success(function(data){
			applyRemoteData(data);
			if (doafter !== undefined) {
				doafter();
			}
		});
    }

    function resetVisible() {
    	$scope.visibleNotes = $scope.notes;
    	$scope.current_index = -1;
    	document.getElementById('searchText').focus();
    }

    function setState(state) {
    	$scope.state = state;
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
        if (isEnabled && filter !== undefined) {

	    	// console.log(input);
	    	// console.log(filter);
	    	// console.log(isEnabled);

            var filtered = [];            

            filter = filter.toLowerCase(); // case insensitive

            for (var i=0; i<input.length; i++) {
            	var current = input[i];
            	var index = current.title.toLowerCase().indexOf(filter);
            	if( index >= 0 ) {
            		// filter text found
            		
            		// how many extra chars there are
            		var extraChars = current.title.length - filter.length;

            		// let's rank items by it
            		current.ranking = extraChars;

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