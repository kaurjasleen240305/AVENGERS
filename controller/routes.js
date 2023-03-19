const express = require('express');
const app=express()
//const multer = require("multer");
//const fileUpload = require('express-fileupload');
const bodyparser=require('body-parser')
const router = express.Router();
app.use(bodyparser.urlencoded({extended:true}));
const image = require('../model/image');
const user = require('../model/user');
const date = require('../model/date');
const requi = require('../model/requi');
const trip = require('../model/trip');
const expense = require('../model/expense');
const question = require('../model/question');
const bcryptjs = require('bcryptjs');
const passport = require('passport');
const fs=require('fs')
require('./passportLocal')(passport);
require('./googleAuth')(passport);
const path=require('path');
const { default: mongoose } = require('mongoose');

app.use(express.static(__dirname+'/public')) ;
//app.use(fileUpload());

//Set Storage 
//var storage = multer.diskStorage({
//    destination: function (req, file, cb) {
//      cb(null, '../public/uploads')
//    },
//    filename: function (req, file, cb) {
//      cb(null, file.fieldname + '-' + Date.now())
//    }
//  })

 // var upload = multer({ storage: storage })

  //

function checkAuth(req, res, next) {
    if (req.isAuthenticated()) {
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0');
        next();
    } else {
        req.flash('error_messages', "Please Login to continue !");
        res.redirect('/login');
    }
}
router.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.render("index", { logged: true });
    } else {
        res.render("index", { logged: false });
    }
});


router.get('/login', (req, res) => {
    res.render("login", { csrfToken: req.csrfToken() });
});

router.get('/signup', (req, res) => {
    res.render("signup", { csrfToken: req.csrfToken() });
});

router.post('/signup',(req, res) => {

    //console.log(req.files.profile_pic);
    //var img=fs.readFileSync(req.file.path);
    //var encode_img=img.toString('base64');
    //console.log(encode_img)
    //get all the values 
    const {email, username, password, confirmpassword } = req.body;
    // check if the are empty 
    if (!email || !username || !password || !confirmpassword) {
        res.render("signup", { err: "All Fields Required !", csrfToken: req.csrfToken() });
        console.log("Test 1")
    } else if (password != confirmpassword) {
        res.render("signup", { err: "Password Don't Match !", csrfToken: req.csrfToken() });
        console.log("Test 1")
    } else {

        // validate email and username and password 
        // skipping validation
        // check if a user exists
         user.findOne({ $or: [{ email: email }, { username: username }] }).then((founduser)=> {
            
            if (founduser) {
                res.render("signup", { err: "User Exists, Try Logging In !", csrfToken: req.csrfToken() });
                console.log("Test 1")
            } 
            else {
                // generate a salt
                bcryptjs.genSalt(12, (err, salt) => {
                    if (err) throw err;
                    // hash the password
                    bcryptjs.hash(password, salt, (err, hash) => {
                        if (err) throw err;
                        // save user in db
                
                        user({
                            
                            username: username,
                            email: email,
                            password: hash,
                            googleId: null,
                            provider: 'email',
                            //image:{contenttype:req.file.mimetype,
                            //data:new Buffer(encode_img, 'base64')},
                        }).save().then(result=> {
                            console.log(result);
                            // login the user
                            // use req.login
                            // redirect , if you don't want to login
                            res.redirect('/login');
                        });
                    })
                });
            }
        }).catch((error)=>{
            console.log("testing bhai")
            console.log(err);
            res.send(400, "Bad Request");
        
        });
    }

});
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        failureRedirect: '/login',
        successRedirect: '/dashboard',
        failureFlash: true,
    })(req, res, next);

});
router.get('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
    });
    req.session.destroy(function (err) {
        res.redirect('/');
    });
});
router.get('/dashboard',checkAuth, async(req, res) => {
    // adding a new parameter for checking verification
    username=req.user.username;
    let trips=await trip.find({members:{$elemMatch:{$eq:username}}});
    res.render('dashboard', { username: req.user.username, verified : req.user.isVerified ,trips,csrfToken: req.csrfToken()});
    
});

router.get('/trip',(req,res)=>{
    res.render('trip',{ csrfToken: req.csrfToken() })

})
router.get('/member',(req,res)=>{
    res.render('member',{ csrfToken: req.csrfToken() })

})

router.post('/member',async(req,res)=>{
    const {tripname,member}=req.body;
    await trip.updateOne({
        tripname:tripname,
    },{$push:{
         members:member
    }})
    res.redirect('dashboard')
})
router.post('/trip',(req,res)=>{
     const {tripname}=req.body;
     trip({
        tripname:tripname,
    }).save().then(result=> {
        console.log(result);
        // login the user
        // use req.login
        // redirect , if you don't want to login
    
    });
    res.redirect('dashboard');

})
router.get('/question',(req,res)=>{
    res.render("question", {csrfToken: req.csrfToken()})
})
router.post('/question',async(req,res)=>{
    const ques=req.body.question;
    const tripname=req.session.tripname;
    await question({
        question:ques,
        tripname:tripname,
    }).save().then(result=> {
        console.log('done');
    });
    res.redirect('planning')
})

router.get('/option',(req,res)=>{
    res.render('option',{csrfToken: req.csrfToken()})
})

router.post('/option',async(req,res)=>{
    var obj=req.body.choice;
    var uss=req.user.username;
    await question.updateOne(       
        {question:req.body.question,
    },{
        $push:{
            options:obj,
            users:uss,
        }
    })
    
    res.redirect('planning')
})


router.get('/profile',(req,res)=>{
      res.render('profile',{ username: req.user.username,email:req.user.email,csrfToken: req.csrfToken()});
})

router.get('/editprofile',(req,res)=>{
      res.render('editprofile',{csrfToken: req.csrfToken()})
})

router.post('/editprofile',async(req,res)=>{
    const id=req.user.id;
    await user.updateOne({
        _id:id
    },{
        $set:{
            username:req.body.username,
            email:req.body.email,
        }
    })
    res.redirect('profile')
})



router.get('/itenarary',async(req,res)=>{
    const opts=await question.find({tripname:req.session.tripname})
    console.log(opts)
    var arr=[];
    var arr1=[];
    function mode(array)
{
    if(array.length == 0)
        return null;
    var modeMap = {};
    var maxEl = array[0], maxCount = 1;
    for(var i = 0; i < array.length; i++)
    {
        var el = array[i];
        if(modeMap[el] == null)
            modeMap[el] = 1;
        else
            modeMap[el]++;  
        if(modeMap[el] > maxCount)
        {
            maxEl = el;
            maxCount = modeMap[el];
        }
    }
    return maxEl;
}
    opts.forEach(element=>{
          var t=mode(element.options);
          console.log(t)
          arr.push(t)
    })
    console.log(arr);
    let s=Number(arr[1]);
    let e=Number(arr[2]);
   let y=2023
    for(let i=s;i<=e;i++){
        console.log(i)
         arr1.push(i);
         var dates=await date.find({tripname:req.session.tripname})
         console.log(dates)
         if(dates.length!=(e-s)){
         date({
            tripname:req.session.tripname,
            date:i,
            month:arr[3],
            year:2023,
         }).save().then(result=>{
            console.log('dates created')})

    }
}
    const events=await requi.find({tripname:req.session.tripname})
  //  const dates=await date.find({tripname:req.session.tripname})
    console.log(events)
    res.render('itenarary',{arr1,arr,y,dates,events})
})

router.get('/event',(req,res)=>{
    res.render('event',{csrfToken: req.csrfToken()})
})
router.post('/event',async(req,res)=>{
    await date.updateOne(
        {date:req.body.date},
        {
            $push:{
                events:req.body.event
            }
        }
    )
    res.redirect('/itenarary')
}
)

router.get('/requi',(req,res)=>{
    res.render('requi',{csrfToken: req.csrfToken()})
})

router.post('/requi',(req,res)=>{
    requi({
        tripname:req.session.tripname,
        requisite:req.body.choice
    }).save();
    res.redirect('/itenarary')
})
router.get('/planning',async(req,res)=>{
    const opts=await question.find({tripname:req.session.tripname})
    const users=await trip.find({tripname:req.session.tripname})
    let i=0;
    let arr1=[]
    let arr2=[]
    opts.forEach(element=>{
        if(element.options.length==users[0].members.length){
            i=i+1;
        }
    })
    let w=""

    opts.forEach(element=>{
           
           
           if(element.users.includes(req.user.username)){
                 arr1.push(element)
           }
           else{
               arr2.push(element)
           }
    })
     if(i==opts.length){
         w="ITENERARY SCREEN";
    }
    console.log(arr1)
    console.log("hi")
    res.render("planning",{opts,w,arr1,arr2});
})
router.post('/dashboard',async(req,res)=>{
    var tripname=req.body.tripname;
     req.session.tripname=tripname;
    res.redirect('/planning')
})

router.get('/budget',async(req,res)=>{
    const expenses=await expense.find({tripname:req.session.tripname})
    console.log(expenses)
    let s=0;
    for(let i=0;i<(expenses.length);i++){
        s=s+(expenses[i].amount)
    }
    res.render('budget',{expenses,s});
})
router.get('/add',(req,res)=>{
    res.render('add',{csrfToken: req.csrfToken()})
})
router.post('/add',async(req,res)=>{
    const {material,date,amount,user}=req.body;
    await expense({
        tripname:req.session.tripname,
        material:material,
        date:date,
        amount:amount,
        user:user,
        //image:req.file.filename,
    }).save().then(result=>{
        console.log(result)
    })
    res.redirect('/budget');
})
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email',] }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), async(req, res) => {
    username=req.user.username;
    let trips=await trip.find({members:{$elemMatch:{$eq:username}}});
    res.render('dashboard', { username: req.user.username, verified : req.user.isVerified ,trips});
    
});

module.exports=router;