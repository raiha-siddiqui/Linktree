const errorHandler=(err, req, res, next)=>{
     console.error(err.stack)
     const statusCode= res.statusCode? res.statusCode: 500
     res.status(statusCode)
     res.json({
        message: err.message,
        stack:process.env.NODE_ENV==="production"? null : err.stack

     })
}
export default errorHandler

//error stack contains file paths and library that could help an attacker if we set it in production as err.stackso thats why we set it to null in production