import CryptoJS from 'crypto-js'
    
//Encryption function
export function encryptData(data, secretKey) {
    const dataString = JSON.stringify(data);
    const encryptedData = CryptoJS.AES.encrypt(dataString, secretKey).toString();
    return encryptedData;
}

//Descrypt Function
export function decryptData(encryptedData, secretKey) {
    try{
        if(encryptedData === null){
            return null;
        }

        const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);

        if(bytes.toString()){
            const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
            return decryptedData;
        }

        return null;
    } catch(error){
        console.log("Error in decryption: ", error);
        return null;
    }
}