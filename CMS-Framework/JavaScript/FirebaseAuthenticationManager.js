/**
 * @file FirebaseAuthenticationManager.js
 *
 * Exposes Firebase authentication management functionality.
 *
 * @author Bilger Yahov <bayahov1@gmail.com>
 * @version 3.5.2
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

            firebase.auth().onAuthStateChanged(function($currentUser){

                if($currentUser){

                    // If there is a user, set them a token.
                    $self.setUserToken()
                        .then(() =>{
                            $self._currentUser = $currentUser;
                            $self._authObserverManager.updateObservers('USER 1');
                        })
                        .catch((error) => {
                            console.error(error);
                        });
                }
                else{

                    // When the user logs out, make sure to clean their token.
                    $self.clearUserToken(function ($error, $data) {

                       if($error){

	                       console.error('FirebaseAuthenticationManager.init(): Could not clear the token for the' +
		                       ' logged out user');
	                       console.log($error);
	                       return;
                       }

                       // Everything fine.
                       if($data){

	                       $self._currentUser = null;
	                       $self._authObserverManager.updateObservers('USER 0');
                       }
                    });
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

            if($self.getCurrentUser()){

                $self._authError = 'You cannot login, you are already logged in!';
                $self._authObserverManager.updateObservers('ERROR 1');
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
         * Sets token for the currently signed-in user.
         * The token gets stored in session storage.
         * This function is not accessible from outside.
         * If other JS controller needs to refresh a user token,
         * there is a `refreshUserToken` function for that.
         *
         * @return Promise
         */

        setUserToken(){
            return new Promise((resolve, reject) => {
                firebase
                    .auth()
                    .currentUser
                    .getIdToken(true)
                    .then((token) => {
                        // Set the current user's token.
                        let apiKey = EnvironmentHelper.getFirebaseSettings().apiKey;
                        sessionStorage.setItem('FirebaseUserToken-' + apiKey, token);
                        resolve();
                    })
                    .catch((error) => {
                        console.error('FirebaseAuthenticationManager.setUserToken(): Problem while trying' +
                            ' to set an ID token for the user.');
                        reject(new Error(error));
                    });
            });
        },

	    /**
         * Clears the token of the signed-out user.
         * This function is not accessible from outside.
         *
	     * @param $callback
	     *
         * @return success execution of the callback (Usually there
         * is nothing which can go wrong in the situation)
	     */

        clearUserToken($callback){

	        let $apiKey = EnvironmentHelper.getFirebaseSettings().apiKey;
	        sessionStorage.removeItem('FirebaseUserToken-' + $apiKey);

	        return $callback(null, true);
        },

	    /**
         * Used to externally ask for a fresh user token.
         *
         * @return Promise
	     */
	    
	    refreshUserToken(){
            const $self = this;
            return new Promise((resolve, reject) => {
                $self.setUserToken()
                    .then(() =>{
                        resolve();
                    })
                    .catch((error) => {
                        reject(error);
                    });
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

	    refreshUserToken(){

            Logic.refreshUserToken();
        }
    }
})();

document.addEvent('domready', function(){

    FirebaseAuthenticationManager.init();
});