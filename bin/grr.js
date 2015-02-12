var model = require('../lib/models/report.js');

model.getReport()
.then(function(data){
    console.log(data);
})
.fail(function(err){
    console.log(err);
});