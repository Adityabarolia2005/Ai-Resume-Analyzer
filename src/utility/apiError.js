export class ApiError extends Error{
    constructor(statusCode , message , stack){
        super(message);        
        this.statusCode = statusCode;
        this.success = statusCode < 400 ? true : false;
        if(stack){
            this.stack = stack;
        }
        else{
            Error.captureStackTrace(this, this.constructor);
        }
    }
}