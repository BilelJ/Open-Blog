var     express         = require("express"),
        router          = express.Router();

var     Post            = require("../models/post"),
        Comment         = require("../models/comment");
        
//Add a comment route
router.post("/post/:id/comment/", isLoggedIn, commentNoEmpty, function(req, res) {
	Post.findById(req.params.id, function(err, post) {
		if (err) {
			console.log(err);
			req.flash("error", "Cannot add your comment, please try again");
		} else {
			req.body.comment.text = req.sanitize(req.body.comment.text);
			Comment.create(req.body.comment, function(err, newComment) {
				if (err) {
					console.log(err);
					req.flash("error", "Cannot add your comment, please try again");
				} else {
					req.flash("success", "Comment added successfully");
					newComment.author.id = req.user._id;
					newComment.author.username = req.user.username;
					newComment.save();
					post.comments.push(newComment);
					post.save();
				}
			});
		}
	});
	res.redirect('/post/' + req.params.id);
});

router.delete("/post/:postid/comment/:commentid", checkCommenttOwner, function(req,res){
	Post.findByIdAndUpdate(req.params.postid, { $pull: { comments: { $in: [ req.params.commentid ] }}}, function(err, post) {
		if(err){
			console.log(err);
			req.flash("error", "Cannot delete the comment, try again");
		} else {
			Comment.findByIdAndRemove(req.params.commentid, function(err){
				if(err){
					console.log(err);
					req.flash("error", "Cannot delete the comment, try again");
					res.redirect("/post/"+req.params.postid);
				} else {
					req.flash("success", "Comment deleted successfully");
					res.redirect("/post/"+req.params.postid);
				}
			})
		}
	});	
});

//Middleware
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	req.flas("error","Please login first!");
	res.redirect("/login");
}

function checkCommenttOwner(req, res, next){
	if(req.isAuthenticated()){
		Comment.findById(req.params.commentid, function(err, comment) {
		    if(err){
		    	res.redirect("back");
		    } else{
		    	if(comment.author.id.equals(req.user.id)){
		    		return next();
		    	} else {
		    		res.redirect("back");
		    	}
		    }
		});
	} else{
		req.flash("error", "You must be logged in to access this page!");
		res.redirect("/login");
	}
}

function commentNoEmpty(req,res,next){
	if (req.body.comment.text === "" ){
		req.flash("error","You cannot send an empty comment, try again");
		res.redirect("back");
	} else {
		return next();
	}
}

module.exports = router;