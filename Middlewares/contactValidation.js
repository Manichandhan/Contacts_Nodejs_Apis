const Joi=require('@hapi/joi')

async function contactValid(req,res,next){
if(!req.body.name&&!req.body.contact){
    return next({statusCode:400,message:'please enter name and contact'})
}
const schema=Joi.object({
    name:Joi.string().lowercase().max(15).required().messages({'string.max':'name should be less than 15 letters','string.base':"please enter valid name","any.required":"please check name"}),
    contact: Joi.number()
    .integer()
    .positive()
    .precision(0)
    .custom((value, helpers) => {
        const stringValue = value.toString();
        if (stringValue.length === 10) {
          return value;
        }
        return helpers.message('Contact must be a 10-digit number');
      }, 'customValidation')
    .required().messages({
        'number.base': 'Contact should be a number',
        'number.precision': 'Contact should be an integer with no decimal places',
        'number.length': 'Contact must be exactly 10 digits',
        'any.required': 'Please enter a valid contact number',
      })
})
const result=await schema.validateAsync({name:req.body.name,contact:req.body.contact})
if(result.error){
    next({statusCode:400,message:`${result.error} error occured`})
}else{
    next()
}
}
module.exports={contactValid}