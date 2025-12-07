/*In a server, things can go wrong:
IT IS KINDA PREREQUIST TO  HANDLE ERROR LIKE :-
1:- Database fails → DB error
2:-Wrong input from user → Validation error
3:-Code mistake → ReferenceError, etc.
Without a custom error class, you would just throw strings or generic errors, like:

throw "Something went wrong"*/

class ApiErro extends Error{
  constructor(
    statusCode,//Error  400 ,500 this is the status code 
    message="Something went wrong",//default message
    errors=[],
    stack=""

  ){
    super(message)
    this.statusCode=statusCode
    this.message=message
    this.success=false
    this.errors=errors
    if (stack){
      this.stack=stack
    }
    else{
      Error.captureStackTrace(this,this.constructor)
    }
  }
}

export {ApiErro}