import mongoose, { Types } from "mongoose";
import bcrypt, { hash } from "bcrypt";

const userSchema = mongoose.Schema({
    globalRole: {
        type:String,
        enum: ['admin', 'member'],
        required: true
    },
    userName: {
        type: String,
        lowercase: true,
        trim: true,
        required: true,
        unique: true
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
        required: true,
        unique: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
        type: String,
        trim: true,
        required: true,
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: {
        type: String,
    },
    emailVerificationTokenExpiry: {
        type: Date
    },
    passwordResetToken: {
        type: String,
    },
    passwordResetTokenExpiry: {
        type: Date
    }
})

//the pre save hooks are written in the sechema above the declarition of the methods are done before model decleration
userSchema.pre("save" , async function(){
    if(!this.isModified("password")){
        return;
    }
    else{
        this.password = await bcrypt.hash(this.password , 10);
    }
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare( password,this.password );
}   



export const User = mongoose.model("User", userSchema);

