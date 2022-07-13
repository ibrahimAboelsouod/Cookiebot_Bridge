const vendors = jentis.consent.engine.getVendorFullData();
let vendorsConsents = {};

// The asynchronous callback is triggered when the cookie banner has loaded to get the user's consent.
function CookiebotCallback_OnLoad(){
    CookiebotCallback_OnAccept();
    CookiebotCallback_OnDecline();
    sendToJseServer();
}

// The asynchronous callback is triggered when the user clicks the accept-button of the cookie consent dialog and whenever a consented user loads a page.
function CookiebotCallback_OnAccept() {

    if (Cookiebot.consent.statistics)      enableStatisticsCookies();
    if (Cookiebot.consent.marketing)       enableMarketingCookies();
    if (Cookiebot.consent.preferences)     enablePreferencesCookies();
}


// The asynchronous callback is triggered when the user declines the use of cookies by clicking the decline-button in the cookie consent dialog. The callback is also triggered whenever a user that has declined the use of cookies loads a page.
function CookiebotCallback_OnDecline(){

    if (!Cookiebot.consent.statistics)     disableStatisticsCookies();
    if (!Cookiebot.consent.marketing)      disableMarketingCookies();
    if (!Cookiebot.consent.preferences)    disablePreferencesCookies();   
    
}

// Send the concent data to jse server
function sendToJseServer(){
    jentis.consent.engine.setNewVendorConsents(vendorsConsents);
}

// Fires when the cookie consent banner is initialized, before compiling the content of the banner.
function CookiebotCallback_OnDialogInit(){
    console.log('consent banner is initialized');
}

// Enable functions 
// Statistics
function enableStatisticsCookies() {  
    Object.entries(vendors).forEach(
        ([vendorName, VendorValues]) => {      
            if(VendorValues.category.id === "statistic") vendorsConsents[`${vendorName}`] = true;
        }
    );
}
// Marketing
function enableMarketingCookies() {  
    Object.entries(vendors).forEach(
        ([vendorName, VendorValues]) => {
            if(VendorValues.category.id === "marketing") vendorsConsents[`${vendorName}`] = true;
        }
    );
}
// Preferences
function enablePreferencesCookies() {  
    Object.entries(vendors).forEach(
        ([vendorName, VendorValues]) => {
            if(VendorValues.category.id === "preferences") vendorsConsents[`${vendorName}`] = true;
        }
    );
}

// Disable functions
//Statistics 
function disableStatisticsCookies() {  
    Object.entries(vendors).forEach(
        ([vendorName, VendorValues]) => {
            if(VendorValues.category.id === "statistic") vendorsConsents[`${vendorName}`] = false;
        }
    );
}
// Marketing
function disableMarketingCookies() {  
    Object.entries(vendors).forEach(
        ([vendorName, VendorValues]) => {
            if(VendorValues.category.id === "marketing") vendorsConsents[`${vendorName}`] = false;
        }
    );
}
// Preferences
function disablePreferencesCookies() {  
    Object.entries(vendors).forEach(
        ([vendorName, VendorValues]) => {
            if(VendorValues.category.id === "preferences") vendorsConsents[`${vendorName}`] = false;
        }
    );
}




 
