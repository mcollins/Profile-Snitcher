/*
 * ProfileSnitcher.js
 * Copyright (c) 2010,2011 Michael G. Collins
 * All rights reserved.
 */

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");

function ProfileSnitcher() {
    this.wrappedJSObject = this;
}

ProfileSnitcher.prototype = {
    contractID: "@collinsmichaelg.com/profile-snitcher;1",
    classID: Components.ID("DE00EBDE-7477-49B2-AE8F-8980ABC0B592"),
    QueryInterface: XPCOMUtils.generateQI([Ci.nsIObserver]),
    _xpcom_categories: [{ category: "profile-after-change", entry: "m-profile-snitcher" }],

    observe: function( subject, topic, data) {
        var windowWatcher = Cc["@mozilla.org/embedcomp/window-watcher;1"].getService(Ci.nsIWindowWatcher);

	if (topic == "profile-after-change") {
		windowWatcher.registerNotification(this);
		this.checkProfile();
	} else if (topic == "domwindowopened") {
		var profile = this.profile;
		var mainWindow = subject.QueryInterface(Ci.nsIInterfaceRequestor)
                   .getInterface(Ci.nsIWebNavigation)
                   .QueryInterface(Ci.nsIDocShellTreeItem)
                   .rootTreeItem
                   .QueryInterface(Ci.nsIInterfaceRequestor)
                   .getInterface(Ci.nsIDOMWindow); 

		mainWindow.dump("*.*.*.*.* Profile Snitcher => " + profile + "\n");

		mainWindow.addEventListener("load", function() {

			var status = mainWindow.document.getElementById("profileSnitcherStatus");

			if (status) {
				status.setAttribute("label", "Profile Snitcher => " + profile);
			}
		}, true);

		windowWatcher.unregisterNotification(this);	
	}
    },

    checkProfile: function() {
            var propServ = Cc["@mozilla.org/file/directory_service;1"]
                .getService(Ci.nsIProperties);

            var currProfD = propServ.get("ProfD", Ci.nsIFile);

	    this.profile = currProfD.leafName;

/*
            try {
                var profServ = Cc["@mozilla.org/profile/manager;1"];
                    .getService(Components.interfaces.nsIProfile);
                var profMan = profServ.getService(Ci.nsIProfile);
            } catch (ex) {
                Cu.reportError("ProfileSnitcher error: " + ex + "\n");
            }

            var profList = new Object();
            if (profMan) {
                var profiles = profMan.getProfileList(profList);
            }
*/
	}
}

if (XPCOMUtils.generateNSGetFactory) {
    var NSGetFactory = XPCOMUtils.generateNSGetFactory([ProfileSnitcher])
} else {
    function NSGetModule() {
        return XPCOMUtils.generateModule([ProfileSnitcher]);
    }
}
