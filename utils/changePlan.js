const subscriptionExpired = (expirationDate)=>{
    if(Date.now() >= expirationDate){
        return true;
    }
    return false;
}

export default subscriptionExpired;