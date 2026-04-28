class ApiError extends Error{
    constructor(
        statuscode,
        message = "something went wrong", //this message is wrong representation message should give some imp tip or lead towards the error 
        error = [],
        stack = ""
    ){
        super(message)
        this.statuscode = statuscode
        this.data = null
        this.message = message
        this.success = false
        this.error = error
        
        if(stack){
            this.stack = stack;
        }else{
            error.captureStackTrace(this , this.constructor)
        }
    }
}
export {ApiError};
