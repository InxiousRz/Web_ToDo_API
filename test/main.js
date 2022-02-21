// var expect = require('chai').expect;
var chai = require('chai');
let server = require("../index");
var chaiHttp = require('chai-http');

chai.use(chaiHttp);
chai.should();


describe('Utilities Test', function(){
   

    it('ping, as expected', function(done) { 
        chai.request(server)
        .get('/')
        .end(function(err, res) {
            res.should.have.status(200);
            res.body.should.equal('pong');
            done();                               
        });
    });

    it('infos, as expected', function(done) { 
        chai.request(server)
        .get('/v1/')
        .end(function(err, res) {
            res.should.have.status(200);
            res.body.should.have.property('project_name');
            res.body.should.have.property('greetings');
            res.body.should.have.property('info');
            done();                               
        });
    });
    
});