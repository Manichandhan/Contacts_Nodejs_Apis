async function errorhandling(err,req,res,next){
    if(err.statusCode<500){
       return res.status(err.statusCode).send(err)
    }
res.status(500).send('something went wrong '+ err.message)
}

module.exports={errorhandling}