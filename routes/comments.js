var     express         = require("express"),
        router          = express.Router();

var     Post            = require("../models/post"),
        Comment         = require("../models/comment");
        
//Add a comment route
router.post("/post/:id/comment/", isLoggedIn, function(req, res) {
	Post.findById(req.params.id, function(err, post) {
		if (err) {
			console.log(err);
			req.flash("error", "Cannot add your comment, please try again");
		} else {
			Comment.create(req.body.comment, function(err, newComment) {
				if (err) {
					console.log(err);
					req.flash("error", "Cannot add your comment, please try again");
				} else {
					newComment.author.id = req.user._id;
					newComment.author.username = req.user.username;
					newComment.save();
					post.comments.push(newComment);
					post.save();
				}
			});
			req.flash("success", "Comment added successfully");
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
		    		next();
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

module.exports = router;