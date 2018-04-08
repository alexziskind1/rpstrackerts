/*
In NativeScript, the app.ts file is the entry point to your application.
You can use this file to perform app-level initialization, but the primary
purpose of the file is to pass control to the app’s first module.
*/

import * as app from 'application';
import './bundle-config';
import { ROUTES } from './shared/routes';
import * as appSettings from 'application-settings';
import * as localize from 'nativescript-localize';

app.setResources({ L: localize });

// Enable back button handling
const frame = require('ui/frame');
if (app.android) {
    app.android.on(app.AndroidApplication.activityBackPressedEvent, backEvent);
}
function backEvent(args) {
    const currentPage = frame.topmost().currentPage;
    if (
        currentPage &&
        currentPage.exports &&
        typeof currentPage.exports.backEvent === 'function'
    ) {
        currentPage.exports.backEvent(args);
    }
}

appSettings.setString('currentPreset', 'open');

app.start({ moduleName: ROUTES.loginPage });

/*
Do not place any code after the application has been started as it will not
be executed on iOS.
*/
