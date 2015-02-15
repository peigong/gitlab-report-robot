var model = require('../lib/models/report.js'),
    views = require('../lib/views/index.js');

var view = 'overview';

model.getReport()
.then(function(data){
    views[view](data);
    views['weekly'](data);
})
.fail(function(err){
    console.log(err);
});