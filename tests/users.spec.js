// import app from "../server.js";
import chai from "chai";
import request from "supertest"
const expect = chai.expect;


const app = "https://taiwo-subscription.onrender.com";
// const request = supertest.request
// import {request} from "supertest";

const payload =
{
    "email": "adebobolamuhydeen@gmail.com",
    "password": "test1",
    "fullName": "adebobola muhy",
}

const updatePayload =
{
    "email": "adebobolamuhydeen@gmail.com",
    "password": "test1",
    "fullName": "adebobola muhyd",
    "confirmPassword": "test1"
}

let token;

const setToken = (_token)=>{
  token = _token;
  return;
}

const appTest = request(app);


it('should create a new user', (done)=>{
  request(app)
    .post('/api/users/new')
    .send(payload)
    .set("Accept", "application/json")
    .set("Content-Type", "application/json")
    .end(function(err, res) {
      if (err) { return console.log(err)};
      expect(res.statusCode).to.be.equal(201);
      expect(res.body.result).to.be.equal("User Created Successfully!");
      expect(res.body.token).to.not.null;
    });
    done();
})


it('should login user', async(done)=>{
  request(app)
    .post('/api/users/login')
    .send(payload)
    .set("Accept", "application/json")
    .set("Content-Type", "application/json")
    .end(function(err, res) {
      if (err) { throw err};
      expect(res.statusCode).to.be.equal(200);
    })
    done();
})


it('should update user details', (done)=>{
  appTest
    .patch('/api/users/update')
    .send(updatePayload)
    .set("Accept", "application/json")
    .set("Content-Type", "application/json")
    // .set("Cookie", token)
    .end(function(err, res) {
      if (err) { return console.log(err)};
      expect(res.statusCode).to.be.equal(200);
    });
    done();
})