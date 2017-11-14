var     express         = require("express"),
        router          = express.Router();

var     Post            = require("../models/post");

//Blog index route
router.get("/", function(req, res) {
	Post.find({}, function(err, post) {
		if (err) {
			console.log("error fetching posts from the database");
		} else {
			Post.count({},function(err,count){			//For pagination
				if(err){
					console.log(err)
				} else {
					res.render("index.ejs", {
						post: post,
						currentPage: 1,
						lastPage: Math.ceil(count/5)
					});
				}
			});
		}
	}).skip(0).limit(5).sort({date:-1});
});

//Blog pagination pages route
router.get("/page/:currentPage",isValidPageNumber, function(req, res) {
	var currentPage = parseInt(req.params.currentPage);
	Post.find({}, function(err, post) {
		if (err) {
			console.log("error fetching posts from the database");
		} else {
			Post.count({},function(err,count){			//For pagination
				if(err){
					console.log(err)
				} else {
					res.render("index.ejs", {
						post: post,
						currentPage: currentPage,
						lastPage: Math.ceil(count/5)
					});
				}
			});
		}
	}).sort({date:-1}).skip(5*(currentPage-1)).limit(5);
});

//Blog add post route
router.post("/", isLoggedIn, postNoEmptyField, function(req, res) {
	var newPost 	= req.body.post;
	newPost.body	= req.sanitize(newPost.body);
	newPost.author	= {"username":  req.user.username, "id" :  req.user._id};
	console.log(newPost);
	Post.create(newPost, function(err,post){
		if(err){
			console.log(err);
			res.redirect("/new");
		} else{
			console.log(post);
			res.redirect("/");
		}
	});
});

router.get("/new", isLoggedIn, function(req, res) {
	res.render("addpost.ejs");
});

//Get post by id  route
router.get("/post/:id", function(req, res) {
	Post.findById(req.params.id).populate("comments").exec(function(err, post) {
		if (err) {
			console.log(err)
			res.redirect("/");
		} else {
			res.render("post.ejs", {
				post: post,
			});

		}
	})
});

//Edit post route
router.get("/post/:id/edit", checkPostOwner, function(req, res) {
	Post.findById(req.params.id, function(err, post) {
			if (err) {
				console.log(err);
				res.redirect("/post/"+req.params.id);
			} else {
				res.render("editpost.ejs", {post: post});
			}
	});
});

//Update post route
router.put("/post/:id", checkPostOwner, postNoEmptyField,  function(req, res) {
	req.body.post.body = req.sanitize(req.body.post.body);
	Post.findByIdAndUpdate(req.params.id, req.body.post, function(err, post) {
		if (err) {
			console.log(err);
			res.redirect("back")
		} else {
			res.redirect("/post/" + req.params.id);
		}
	});
});

//Destroy post route
router.delete("/post/:id", checkPostOwner, function(req, res){
	Post.findByIdAndRemove(req.params.id, function(err){
		if(err){
			console.log(err);
			res.redirect("back");
		} else {
			req.flash("success","Post successfully deleted");
			res.redirect("/");
		}
	});
		
	
});

//Middleware
function isValidPageNumber(req,res,next) {
	if(isNaN(req.params.currentPage)){
		req.flash("error", "Unauthorized page number, try again");
		res.redirect("/");
	} 
	if(parseInt(req.params.currentPage)==1){
		res.redirect("/");
	} else {
		return next();
	}
}

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	req.flash("error", "You must be logged in to access this page!");
	res.redirect("/login");
}

function checkPostOwner(req, res, next){
	if(req.isAuthenticated()){
		Post.findById(req.params.id, function(err, post) {
		    if(err){
		    	req.flash("error", "Error, cannot find post! it might be deleted from the database")
 		    	res.redirect("back");
		    } else{
		    	if(post.author.id.equals(req.user.id)){
		    		next();
		    	} else {
		    		req.flash("error","You don't have permission to access this page!");
		    		res.redirect("back");
		    	}
		    }
		});
	} else{
		req.flash("error", "You must be logged in to access this page!");
		res.redirect("/login");
	}
}

function postNoEmptyField(req,res,next){
	if (req.body.post.title === "" || req.body.post.image === "" || req.body.post.body === ""){
		req.flash("error","You must fill all the required fields, try again");
		res.redirect("back");
	} else {
		return next();
	}
}


module.exports = router;