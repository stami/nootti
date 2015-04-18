// public/js/services/NerdService.js
angular.module('NoottiService', []).factory('Nootti', ['$http', function($http) {

    return {
        // call to get all notes
        get : function() {
            return $http.get('/api/notes');
        },


        // these will work when more API routes are defined on the Node side of things
        // call to POST and create a new note
        create : function(noteData) {
            return $http.post('/api/notes', noteData);
        },

        // call to DELETE a note
        delete : function(id) {
            return $http.delete('/api/notes/' + id);
        }
    };

}]);