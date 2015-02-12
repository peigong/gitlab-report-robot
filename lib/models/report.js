var Q = require('q'), 
    util = require('../util.js');

/*
util.get('user')
.then(function(user){
    //user.id
    //user.name
    //user.username
    //user.email
    console.log(user.name);
    console.log('===================')
})
.fail(function(err){
    console.log(err);
});
*/util.get('projects')
.then(function(projects){
    projects.map(function(project){
        //project.id
        //project.name
        var api = ['projects', project.id, 'repository', 'commits'].join('/');
        util.get(api)
        .then(function(commits){
            console.log(project.name + ':' + commits.length);
        })
        .fail(function(err){
            console.log(err);
        });
        api = ['projects', project.id, 'repository', 'contributors'].join('/');
        util.get(api)
        .then(function(contributors){
            contributors.map(function(contributor){
                console.log(contributor.name + ':' + contributor.commits + ' commits,' + contributor.additions + ' additions,' + contributor.deletions + ' deletions.');
            });
        })
        .fail(function(err){
            console.log(err);
        });
    });
})
.fail(function(err){
    console.log(err);
});

function getReport(){

}

module.exports = {
    getReport: getReport
};