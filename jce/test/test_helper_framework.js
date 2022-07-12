window.jentis = window.jentis || {};
window.jentis.helper = new function () {

    this.aEventCache = {};
    this.aServerCookies = [];

    this.init = function () {
        this.bIsLocalStorageAvailable = this.checkLocalStorage();
    };

    this.checkLocalStorage = function () {
        var test = 'test';
        try {
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * External can register their event with this function. If they missed the events, we can call their callback immidiatly.
     *
     *@param string sName The name of the event to register.
     *@param function cb The callback which should be called when the event is called.
     */
    this.addEventListener = function (sName, cb) {
        if (typeof this.aEventCache[sName] !== "undefined") {
            for (var i = 0; i < this.aEventCache[sName].length; i++) {
                cb({"detail": this.aEventCache[sName][i]});
            }
        }

        document.addEventListener(sName, function (e) {
            cb(e);
        });
    }

    /**
     * Set a event, store is to the event cache and triggers a global event.
     *
     *@param string sName The name of the event
     *@param object oValue An object of additional data which should be passed with the event.
     *
     */
    this.setEvent = function (sPrefix, sName, oValue) {
        //Create the eventname
        var eventname = sPrefix + "." + sName;

        //Fallback if no value is passed
        if (typeof oValue === "undefined") {
            var oValue = null;
        }

        //Now store the event to the event cache.
        if (typeof this.aEventCache[eventname] === "undefined") {
            this.aEventCache[eventname] = [];
        }
        this.aEventCache[eventname].push(oValue);

        //Trigger the global event.
        if (typeof window.CustomEvent === 'function') {
            var oEvent = new CustomEvent(eventname, {"detail": oValue});
        } else {
            var oEvent = document.createEvent('CustomEvent');
            oEvent.initCustomEvent(eventname, true, false, oValue);
        }

        // Dispatch the render event
        document.dispatchEvent(oEvent);
    }

    this.readCookie = function (sName) {
        var sNameEQ = sName + "=";
        var aCookies = document.cookie.split(';');

        for (var i = 0; i < aCookies.length; i++) {
            var sCookie = aCookies[i];

            //left trim
            while (sCookie.charAt(0) == ' ') sCookie = sCookie.substring(1, sCookie.length);

            if (sCookie.indexOf(sNameEQ) == 0) return unescape(sCookie.substring(sNameEQ.length, sCookie.length));
        }

        return null;
    };
    this.setCookie = function (oArgs) {
        var exdate = new Date();

        if (oArgs.exdays !== null && typeof oArgs.exdays === "object") {
            exdate.setTime(
                exdate.getTime() +
                (
                    ((typeof oArgs.exdays.h !== "undefined" ? oArgs.exdays.h : 0) * 60 * 60) +
                    ((typeof oArgs.exdays.m !== "undefined" ? oArgs.exdays.m : 0) * 60) +
                    (typeof oArgs.exdays.s !== "undefined" ? oArgs.exdays.s : 0)
                ) * 1000
            );
        } else {
            exdate.setDate(exdate.getDate() + oArgs.exdays);
        }

        var aDomainParts = window.jentis.config.trackdomain.split('.');
        aDomainParts[0] = "";
        var sDomain = aDomainParts.join(".");

        var c_value = escape(oArgs.value) + "; path=/; domain=" + sDomain + "" + ((oArgs.exdays == null) ? "" : "; expires=" + exdate.toUTCString()) + ((typeof oArgs.sameSite !== "undefined") ? "; SameSite=" + oArgs.sameSite : "") + ((typeof oArgs.bSecure !== "undefined" && oArgs.bSecure === true) ? "; Secure=" + oArgs.bSecure : "");
        document.cookie = oArgs.name + "=" + c_value;
    };
}
window.jentis.helper.init();