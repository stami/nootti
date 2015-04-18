// public/js/controllers/MainCtrl.js
angular.module('MainCtrl', ['NoottiService']).controller('MainController', ['$scope', 'Nootti', '$timeout', function($scope, Nootti, $timeout) {



    $scope.notes = [];
    // note to show in editing area
	$scope.current = $scope.notes[0];

	// Get data from db
	// not refresh() because it's async
	Nootti.get().success(function(data){
		applyRemoteData(data);
		// set first titleList item selected
		// $scope.selectedTitle = $scope.notes[0];
	});

	$scope.$watch('searchText', function() {
		// title filter changed, update selected to the first item
		console.log('watch happend');
		// $scope.selectedTitle = $scope.notes[0];
	});



	// =========== Auto Save ================================

    var saveUpdates = function() {
    	console.log('updating note!!');
    	$scope.current.content = $scope.editingArea;
    	$scope.current.updated_at = new Date();
    	console.log($scope.current);
    	Nootti.update($scope.current);
    	refresh();
    };

	var secondsToWaitBeforeSave = 1;

	var timeout = null;

	var debounceUpdate = function(newVal, oldVal) {
		if (newVal != oldVal) {
			if (timeout) {
				$timeout.cancel(timeout);
			}
			timeout = $timeout(saveUpdates, secondsToWaitBeforeSave * 1000);
		}
	};

	$scope.$watch('editingArea', debounceUpdate);

	// =========== Auto Save end =============================
	


    $scope.searchOrCreate = function() {

    	if ($scope.searchText.length > 2) {
	    	
	    	var current = getNoteByTitle($scope.searchText);

	    	if (current === null) {
	    		// note not found, create new
	    		console.log('creating new note for editing...');
	    		Nootti.create({
	    			title: $scope.searchText,
	    			content: ''
	    		}).success(function(data) {
	    			// console.log(data);
	    			refresh();
	    			$timeout($scope.searchOrCreate, 50);
	    		});

	    	} else {
	    		// note found. open into editing area
	    		console.log('opening note "'+ current.title +'" to editing...');
	    		$scope.current = current;
	    		$scope.editingArea = current.content;
	    	}
	    }

    };

    $scope.deleteCurrent = function() {
    	Nootti.delete($scope.current._id)
    		.success(function() {
    			console.log('deleted note successfully');
    			$scope.searchText = '';
    			refresh();
    		});
    };

    $scope.key = function($event){
	    console.log($event.keyCode);
	    if ($event.keyCode == 40) {
	    	// key down
	    	document.getElementById("titles").focus();
	    }
	};

    function applyRemoteData(data) {
    	$scope.notes = data;
    }

    function refresh() {
	    // get all notes from db
	    Nootti.get().success(function(data){
			applyRemoteData(data);
		});
    }

    function getNoteByTitle(title) {
    	for (var i = $scope.notes.length - 1; i >= 0; i--) {
    		if ($scope.notes[i].title === title) {
    			return $scope.notes[i];
    		}
    	}
    	return null;
    }


}]);