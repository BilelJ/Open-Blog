var     express         = require("express"),
        app             = express(),
        mongoose        = require("mongoose"),
        flash           = require("connect-flash"),
        ejs             = require("ejs"),
        bodyParser      = require("body-parser"),
        expressSanitizer= require("express-sanitizer"),
        methodOverride  = require("method-override"),
        passport        = require("passport"),
        localStrategy   = require("passport-local");
        
        //Required models ###############
var     Post            = require("./models/post"),
        Comment         = require("./models/comment"),
        User            = require("./models/user");
        //###############################
        
        //Required routes ###############
var     postRoutes            = require("./routes/posts"),
        commentRoutes         = require("./routes/comments"),
        indexRoutes           = require("./routes/index");
        //###############################
        
//mongoose.connect("mongodb://localhost/blog_v2",  {useMongoClient: true});
mongoose.connect("mongodb://blogfornode:nodeme@ds261745.mlab.com:61745/nodeblogdb",  {useMongoClient: true});

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());
app.use(methodOverride("_method"));
app.use(flash());


        //Passport.js Config ################
app.use(require("express-session")({
    secret: "This is my node Blog",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
        //###############################
app.use(function(req,res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   
   next();
 });       

app.use(postRoutes);    
app.use(commentRoutes);
app.use(indexRoutes);
        

app.listen(process.env.PORT, process.env.IP);