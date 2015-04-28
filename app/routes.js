// app/routes.js

// grab the nootti model we just created
var Nootti = require('./models/nootti');

module.exports = function(app) {

    // server routes ===========================================================
    // handle things like api calls
    // authentication routes
    

    // middleware to use for all requests
    app.use(function(req, res, next) {
        // do logging
        console.log('Something is happening.');
        next(); // make sure we go to the next routes and don't stop here
    });

    // GET /notes (get all)
    app.get('/api/notes', function(req, res, next) {
      Nootti.find(null, null, { sort: { updated_at: -1 } }, function (err, notes) {
        if (err) return next(err);
        res.json(notes);
      });
    });

    // POST /notes (create new note)
    app.post('/api/notes', function(req, res, next) {
      Nootti.create(req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
      });
    });

    // GET /notes/:id (get a note)
    app.get('/api/notes/:id', function(req, res, next) {
      Nootti.findById(req.params.id, function (err, post) {
        if (err) return next(err);
        res.json(post);
      });
    });

    // PUT /notes/:id (update a note)
    app.put('/api/notes/:id', function(req, res, next) {
      Nootti.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
      });
    });

    // DELETE /notes/:id (delete a note)
    app.delete('/api/notes/:id', function(req, res, next) {
      Nootti.findByIdAndRemove(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
      });
    });


    // frontend routes =========================================================
    // route to handle all angular requests
    app.get('*', function(req, res) {
        res.sendfile('./public/index.html'); // load our public/index.html file
    });

};
