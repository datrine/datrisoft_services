import stringSanitizer from 'string-sanitizer'
function validCreateProject({ name, desc, dateOfLast, creatorEmail, creatorId }) {
    if (!name) {
        return { isValid: false, errMsg: "Name cannot be empty" }
    }
    if (name) {
        name = stringSanitizer.sanitize(name)
    }
    return { isValid: true, name, desc, dateOfLast, creatorEmail, creatorId }
}

function validClient({ fullname='', fname='', lname='', email='', password='', repassword, phoneNum, address, creatorId },

    { validatePass = false }={}) {   
         console.log(email)
         console.log(password)
    if (!fullname && !fname) {
        return { isValid: false, errMsg: "Name cannot be empty" }
    }
    if (fullname && !fname && !lname) {
        fullname = stringSanitizer.sanitize(fullname)
        let nameSplit = fullname.split(" ")
        fname = nameSplit[0]
        lname = nameSplit[0]
    }
    if (!email) {
        return { isValid: false, errMsg: "Email cannot be empty" }
    }
    if (!password) {
        return { isValid: false, errMsg: "Password cannot be empty" }
    }
    if (validatePass) {
        if (password !== repassword) {
            return { isValid: false, errMsg: "Passwords do not match" }
        }
    }
    return { isValid: true, fullname, fname, lname, email,password, phoneNum, address, creatorId }
}
export { validCreateProject, validClient }