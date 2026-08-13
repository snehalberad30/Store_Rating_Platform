function validateRegistration(data) {
    const errors = {};

    const { name, email, address, password } = data;

    // Name validation
    if (!name || name.trim().length < 20 || name.trim().length > 60) {
        errors.name = "Name must be between 20 and 60 characters.";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
        errors.email = "Please enter a valid email address.";
    }

    // Address validation
    if (!address || address.trim().length > 400) {
        errors.address = "Address must not exceed 400 characters.";
    }

    // Password validation
    const passwordRegex =
        /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

    if (!password || !passwordRegex.test(password)) {
        errors.password =
            "Password must be 8-16 characters and contain at least one uppercase letter and one special character.";
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

module.exports = {
    validateRegistration
};