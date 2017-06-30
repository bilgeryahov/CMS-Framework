/**
 * @file FirebaseAuthenticationManager.js
 *
 * Exposes Firebase authentication management functionality.
 *
 * @author Bilger Yahov <bayahov1@gmail.com>
 * @version 3.4.0
 * @copyright © 2017 Bilger Yahov, all rights reserved.
 */

const FirebaseAuthenticationManager = (function(){

    /*
     * Encapsulate the logic.
     */

    const Logic = {
        
        _currentUser: null,
        _authError: null,

        // Auth ObserverManager of FirebaseAuthenticationManager.
        _authObserverManager: {},

        /*
         * Observer manager for the modules, whose
         * display state depend on the Authentication.
         *
         * This Observer Manager basically makes sure
         * that when an attempt for login is made, the correct modules
         * will get displayed and the correct ones will get hidden.
         *
         * The Observer Manager will send an update when a login is attempted.
         *
         * The Observer Manager will send an update when login attempt gets a result
         * (does not matter success or failure).
         */

        _authAttemptDisplayObserverManager: {},

        /**
         * Initializing.
         *
         * @return void
         */

        init: function(){

            const $self = this;

            if(!EnvironmentHelper){

                console.error('FirebaseAuthenticationManager.init(): EnvironmentHelper is not present!');
                return;
            }

            // Try to set a new Auth ObserverManager.
            try{

                $self._authObserverManager = new ObserverManager();
            }
            catch($error){

                console.error('FirebaseAuthenticationManager.init(): ' + $error);
                return;
            }

            $self._authObserverManager.clearObservers();

            // Try to set the Auth Attempt Observer Manager.
            try{

                $self._authAttemptDisplayObserverManager = new ObserverManager();
            }
            catch($error){

                console.error('FirebaseAuthenticationManager.init(): ' + $error);
                return;
            }

            $self._authAttemptDisplayObserverManager.clearObservers();

            firebase.auth().onAuthStateChanged(function($currentUser){

                if($currentUser){

                    $self._currentUser = $currentUser;
                    $self._authObserverManager.updateObservers('USER 1');

                    // Update Auth Display Observer Manager's observers that the login attempt has finished.
                    $self._authAttemptDisplayObserverManager.updateObservers('LoginAttemptFinish');
                }
                else{

                    // When the user logs out, make sure to clean his token.
                    let $apiKey = EnvironmentHelper.getFirebaseSettings().apiKey;
                    sessionStorage.removeItem('FirebaseUserToken-' + $apiKey);

                    $self._currentUser = null;
                    $self._authObserverManager.updateObservers('USER 0');
                }
            });
        },

        /**
         * Gets the Auth ObserverManager of FirebaseAuthenticationManager.
         *
         * @return {Logic._authObserverManager|{}}
         */

        getAuthObserverManager(){

            const $self = this;
            return $self._authObserverManager;
        },

        /**
         * Gets the AuthAttemptDisplayObserverManager of FirebaseAuthenticationManager.
         *
         * @return {Logic._authAttemptDisplayObserverManager|{}}
         */

        getAuthAttemptDisplayObserverManager(){

            const $self = this;
            return $self._authAttemptDisplayObserverManager;
        },

        /**
         * Returns the current user.
         * If no user is logged in, NULL is returned.
         *
         * @return {null}
         */

        getCurrentUser(){

            const $self = this;
            return $self._currentUser;
        },

        /**
         * Logs in a user based on e-mail and password.
         * If any errors occur, they get saved in the _authError
         * attribute of the object.
         *
         * @param $email
         * @param $password
         *
         * @return void
         */

        login($email, $password){

            const $self = this;

            // Update Auth Display Observer Manager's observers...
            $self._authAttemptDisplayObserverManager.updateObservers('LoginAttemptStart');

            if($self.getCurrentUser()){

                $self._authError = 'You cannot login, you are already logged in!';
                $self._authObserverManager.updateObservers('ERROR 1');

                // Update Auth Display Observer Manager's observers...
                $self._authAttemptDisplayObserverManager.updateObservers('LoginAttemptFinish');

                return;
            }

            firebase.auth().signInWithEmailAndPassword($email, $password)
                .catch(function($error){

                    $self._authError = 'Problem while logging in.';

                    if($error && $error.code){

                        if($error.code === 'auth/wrong-password'){

                            $self._authError = 'Wrong password';
                        }
                        else if($error.code === 'auth/user-not-found'){

                            $self._authError = 'Wrong e-mail address.';
                        }

                        console.error('FirebaseAuthenticationManager.login(): ');
                        console.error($error);
                    }

                    // Update Auth Display Observer Manager's observers...
                    $self._authAttemptDisplayObserverManager.updateObservers('LoginAttemptFinish');

                    $self._authObserverManager.updateObservers('ERROR 1');
                });
        },

        /**
         * Returns the auth error, if any.
         * If there is no auth error, returns null.
         *
         * @return {null}
         */

        getAuthError(){

            const $self = this;
            return $self._authError;
        },

        /**
         * Log-out a user.
         *
         * @return void
         */

        logout(){

            const $self = this;

            firebase.auth().signOut()
                .catch(function($error){
                    if($error){

                        $self._authError = 'Problem while logging out.';

                        if($error && $error.code){

                            console.error('FirebaseAuthenticationManager.logout(): ');
                            console.error($error);
                        }

                        $self._authObserverManager.updateObservers('ERROR 1');
                    }
                });
        },

        /**
         * Gets verification token for the currently signed-in user.
         *
         * @param $callback
         *
         * @return void
         */

        getUserToken($callback){

            firebase.auth()
                .currentUser
                .getIdToken(true)
                .then(function ($token) {

                    // Save the current user's token.
                    let $apiKey = EnvironmentHelper.getFirebaseSettings().apiKey;
                    sessionStorage.setItem('FirebaseUserToken-' + $apiKey, $token);

                    return $callback(null, true);
                })
                .catch(function ($error) {

                    return $callback($error, null);
                });
        }
    };

    return{

        init(){

            Logic.init();
        },

        getAuthObserverManager(){

            return Logic.getAuthObserverManager();
        },

        getAuthAttemptDisplayObserverManager(){

            return Logic.getAuthAttemptDisplayObserverManager();
        },

        getCurrentUser(){

            return Logic.getCurrentUser();
        },

        getAuthError(){

            return Logic.getAuthError();
        },

        login($email, $password){

            Logic.login($email, $password);
        },

        logout(){

            Logic.logout();
        },

        getUserToken($callback){

            Logic.getUserToken($callback);
        }
    }
})();

document.addEvent('domready', function(){

    FirebaseAuthenticationManager.init();
});