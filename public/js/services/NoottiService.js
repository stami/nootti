// public/js/services/NoottiService.js
angular.module('NoottiService', []).factory('Nootti', ['$http', function($http) {

    return {
        // call to GET all notes
        get : function() {
            return $http.get('/api/notes');
        },

        // call to GET a note by its ID
        getById : function(id) {
            return $http.get('/api/notes/' + id);
        },

        // call to POST and create a new note
        create : function(noteData) {
            return $http.post('/api/notes', noteData);
        },

        // call to UPDATE (http put) a note
        update : function(noteData) {
            return $http.put('/api/notes/' + noteData._id, noteData);
        },

        // call to DELETE a note
        delete : function(id) {
            return $http.delete('/api/notes/' + id);
        }
    };

}]);