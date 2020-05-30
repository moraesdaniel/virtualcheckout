function IdIsValid(id, msgError) {
    return new Promise((resolve, reject) => {
        if ((id == undefined) || (isNaN(id))) {
            reject(msgError);
        }

        resolve("");
    });
}

function DescriptionIsValid(description, msgError) {
    return new Promise((resolve, reject) => {
        if ((description == undefined) || (description.trim() == "")) {
            reject(msgError);
        }

        resolve("");
    });
}

module.exports = {
    IdIsValid,
    DescriptionIsValid
}