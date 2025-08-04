
//error stack contains file paths and library that could help an attacker if we set it in production as err.stackso thats why we set it to null in production


const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error(err.stack);
  }

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode; 
  let message = err.message || 'Internal Server Error';


  if (err.name === 'ValidationError') {
    statusCode = 400; 
    message = Object.values(err.errors)
      .map((item) => item.message)
      .join(', '); 
  }

  
  if (err.code === 11000) {
    statusCode = 400; 
    const duplicateField = Object.keys(err.keyValue)[0];
    message = `The ${duplicateField} '${err.keyValue[duplicateField]}' is already taken. Please use a different ${duplicateField}.`;
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

export default errorHandler;