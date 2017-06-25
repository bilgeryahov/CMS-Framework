/**
 * @file FirebaseCore.js
 *
 * Initializes Firebase.
 *
 * @author Bilger Yahov <bayahov1@gmail.com>
 * @version 2.0.0
 * @copyright © 2017 Bilger Yahov, all rights reserved.
 */

const FirebaseCore = (function () {

    const Logic = {

        init(){

            if(!EnvironmentHelper){

                console.error('FirebaseCore.init(): EnvironmentHelper is not present!');
                return;
            }

            const config = EnvironmentHelper.getFirebaseSettings();

            firebase.initializeApp(config);
        }
    };

    return{

        init(){

            Logic.init();
        }
    }
})();

document.addEvent('domready', function(){

    FirebaseCore.init();
});