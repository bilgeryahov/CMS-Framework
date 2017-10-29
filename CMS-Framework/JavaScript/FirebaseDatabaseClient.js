/**
 * @file FirebaseDatabaseClient.js
 *
 * Exposes Firebase database management functionality.
 *
 * @author Bilger Yahov <bayahov1@gmail.com>
 * @version 4.4.0
 * @copyright © 2017 Bilger Yahov, all rights reserved.
 */

const FirebaseDatabaseClient = (function(){

    /*
     * Encapsulate the logic.
     */

    const Logic = {

        _initializationError: null,
        _requestToken: null,

        /**
         * Initialize.
         *
         * @return void
         */

        init: function(){

            const $self = this;

            if(!FirebaseAuthenticationManager){

                console.error('FirebaseDatabaseClient.init(): ' +
                    'FirebaseAuthenticationManager is missing!');

                $self._initializationError = true;
                return;
            }

            if(!EnvironmentHelper){

                console.error('FirebaseDatabaseClient.init(): ' +
                    'EnvironmentHelper is missing!');

	            $self._initializationError = true;
                return;
            }

            try{

	            // Try to prepare the request token.
	            let $apiKey = EnvironmentHelper.getFirebaseSettings().apiKey;
	            $self._requestToken = sessionStorage.getItem('FirebaseUserToken-' + $apiKey);
            }
            catch ($exception){

                console.error('FirebaseDatabaseClient.init(): ');
                console.error($exception);
                $self._initializationError = true;
                return;
            }
        },

	    /**
         * This function does not check for initialization errors.
         * It gets called from the request functions.
         * They should be aware if there was an initialization error.
         * If there is, this function should not get called.
         *
         * @param $callback
         *
         * @return execution of the callback
	     */

	    requestTokenRefresh($callback){

	        const $self = this;

            FirebaseAuthenticationManager.refreshUserToken(function ($error, $data) {

                if($error){

                    return $callback($error, null);
                }

                if($data){

                    // Update our token.
	                let $apiKey = EnvironmentHelper.getFirebaseSettings().apiKey;
	                $self._requestToken = sessionStorage.getItem('FirebaseUserToken-' + $apiKey);

                    // There is no data to return. Just indicate the job done.
                    return $callback(null, true);
                }
            });
        },

        /**
         * Makes a GET request to the Firebase Real Time database.
         *
         * @param $path
         * @param $extra
         * @param $callback
         *
         * @return callback execution
         */

        firebaseGET: function($path, $extra, $callback){

            const $self = this;

            // Check for initialization errors.
            if($self._initializationError){

                return $callback({
                    message: 'FirebaseDatabaseClient.firebaseGET(): There is an initialization error'
                },
                null);
            }

            // Prepare GET request extra parameters.
            let $extraString = '';

            for(let $member in $extra){

                if($extra.hasOwnProperty($member)){

                    $extraString += $member + '=' + $extra[$member] + '&';
                }
            }

            // Remove the last & character.
            $extraString = $extraString.substring(0, $extraString.length-1);

	        // Prepare the request itself.
            let $getRequest = new Request({
                url: EnvironmentHelper.getFirebaseSettings().databaseURL
                + $path + '.json?'
                + $extraString
                + '&auth=' + $self._requestToken,
                method: 'GET',
                onSuccess: function($data){

                    $data = JSON.parse($data);

                    if($data === null){

                        $data = {};
                    }

                    if($extra.hasOwnProperty('shallow') && $extra['shallow'] === true){

                        for(let $turnMember in $data){

                            if($data.hasOwnProperty($turnMember)){

                                $data[$turnMember] = {};
                            }
                        }
                    }

                    return $callback(null, $data);
                },
                onFailure: function($xhr){

	                let $response = JSON.decode($xhr.response);

	                // Check if it says that the token has expired.
	                if($response.hasOwnProperty('error') && $response.error === 'Auth token is expired'){

		                // Ask for a fresh token.
		                $self.requestTokenRefresh(function ($error, $data) {

			                if($error){

				                console.error('FirebaseDatabaseClient.firebaseGET(): ');
				                console.error($error);
				                return $callback({
						                message: 'Problem while trying to request refresh token.'
					                },
					            null);
			                }

			                if($data){

				                // Token is there. Update the request and send it.
				                $getRequest.options.url = EnvironmentHelper.getFirebaseSettings().databaseURL
					                + $path + '.json?'
					                + $extraString
					                + '&auth=' + $self._requestToken;
				                $getRequest.send();
			                }
		                });
	                }
	                else{

		                console.error('FirebaseDatabaseClient.firebaseGET(): ');
		                console.error($xhr);
		                return $callback({
				                message: 'Data for ' + $path + ' did not arrive because an error!'
			                },
			            null);
	                }
                }
            });

            // Check if the request is good to go.
	        if($self._requestToken){

	        	$getRequest.send();
	        }
	        else{

	        	// Ask for a fresh token.
		        $self.requestTokenRefresh(function ($error, $data) {

		        	if($error){

				        console.error('FirebaseDatabaseClient.firebaseGET(): ');
				        console.error($error);
				        return $callback({
						        message: 'Problem while trying to request refresh token.'
					        },
					    null);
			        }

			        if($data){

		        		// Token is there. Update the request and send it.
				        $getRequest.options.url = EnvironmentHelper.getFirebaseSettings().databaseURL
					        + $path + '.json?'
					        + $extraString
					        + '&auth=' + $self._requestToken;
				        $getRequest.send();
			        }
		        });
	        }
        },

        /**
         * Makes a PUT request to the Firebase Real Time database.
         *
         * @param $path
         * @param $data
         * @param $callback
         *
         * @return execution of callback
         */

       firebasePUT($path, $data, $callback){

	        const $self = this;

	        // Check for initialization errors.
	        if($self._initializationError){

		        return $callback({
				        message: 'FirebaseDatabaseClient.firebasePUT(): There is an initialization error'
			        },
			    null);
	        }

            const $putData = JSON.stringify($data);

            let $putRequest = new Request({
                url: EnvironmentHelper.getFirebaseSettings().databaseURL
                + $path + '.json?auth=' + $self._requestToken,
                method: 'PUT',
                data: $putData,
                headers:{
                    'Content-Type':'application/json; charset=UTF-8'
                },
                emulation: false,
                urlEncoded: false,
                onSuccess: function($data){

                    return $callback(null, $data);
                },
                onFailure: function($xhr){

	                let $response = JSON.decode($xhr.response);

	                // Check if it says that the token has expired.
	                if($response.hasOwnProperty('error') && $response.error === 'Auth token is expired'){

		                // Ask for a fresh token.
		                $self.requestTokenRefresh(function ($error, $data) {

			                if($error){

				                console.error('FirebaseDatabaseClient.firebasePUT(): ');
				                console.error($error);
				                return $callback({
						                message: 'Problem while trying to request refresh token.'
					                },
					            null);
			                }

			                if($data){

				                // Token is there. Update the request and send it.
				                $putRequest.options.url = EnvironmentHelper.getFirebaseSettings().databaseURL
					                + $path + '.json?auth='
					                + $self._requestToken;
				                $putRequest.send();
			                }
		                });
	                }
	                else{

		                console.error('FirebaseDatabaseClient.firebasePUT(): ');
		                console.error($xhr);
		                return $callback({
				                message: 'Data for ' + $path + ' cannot be PUT because an error!'
			                },
			            null);
	                }
                }
            });

	        // Check if the request is good to go.
	        if($self._requestToken){

		        $putRequest.send();
	        }
	        else{

		        // Ask for a fresh token.
		        $self.requestTokenRefresh(function ($error, $data) {

			        if($error){

				        console.error('FirebaseDatabaseClient.firebasePUT(): ');
				        console.error($error);
				        return $callback({
						        message: 'Problem while trying to request refresh token.'
					        },
					    null);
			        }

			        if($data){

				        // Token is there. Update the request and send it.
				        $putRequest.options.url = EnvironmentHelper.getFirebaseSettings().databaseURL
					        + $path + '.json?auth='
					        + $self._requestToken;
				        $putRequest.send();
			        }
		        });
	        }
       },

        /**
         * Makes a POST request to the Firebase Real Time database.
         *
         * @param $path
         * @param $data
         * @param $callback
         *
         * @return execution of callback
         */

        firebasePOST($path, $data, $callback){

	        const $self = this;

	        // Check for initialization errors.
	        if($self._initializationError){

		        return $callback({
				        message: 'FirebaseDatabaseClient.firebasePOST(): There is an initialization error'
			        },
			    null);
	        }

            const $postData = JSON.stringify($data);

            let $postRequest = new Request({
                url: EnvironmentHelper.getFirebaseSettings().databaseURL
                + $path + '.json?auth='
                + $self._requestToken,
                method: 'POST',
                data: $postData,
                headers:{
                    'Content-Type':'application/json; charset=UTF-8'
                },
                emulation: false,
                urlEncoded: false,
                onSuccess: function($data){

                    return $callback(null, $data);
                },
                onFailure: function($xhr){

	                let $response = JSON.decode($xhr.response);

	                // Check if it says that the token has expired.
	                if($response.hasOwnProperty('error') && $response.error === 'Auth token is expired'){

		                // Ask for a fresh token.
		                $self.requestTokenRefresh(function ($error, $data) {

			                if($error){

				                console.error('FirebaseDatabaseClient.firebasePOST(): ');
				                console.error($error);
				                return $callback({
						                message: 'Problem while trying to request refresh token.'
					                },
					            null);
			                }

			                if($data){

				                // Token is there. Update the request and send it.
				                $postRequest.options.url = EnvironmentHelper.getFirebaseSettings().databaseURL
					                + $path + '.json?auth='
					                + $self._requestToken;
				                $postRequest.send();
			                }
		                });
	                }
	                else{

		                console.error('FirebaseDatabaseClient.firebasePOST(): ');
		                console.error($xhr);
		                return $callback({
				                message: 'Data for ' + $path + ' cannot be POST because an error!'
			                },
			            null);
	                }
                }
            });

	        // Check if the request is good to go.
	        if($self._requestToken){

		        $postRequest.send();
	        }
	        else{

		        // Ask for a fresh token.
		        $self.requestTokenRefresh(function ($error, $data) {

			        if($error){

				        console.error('FirebaseDatabaseClient.firebasePOST(): ');
				        console.error($error);
				        return $callback({
						        message: 'Problem while trying to request refresh token.'
					        },
					    null);
			        }

			        if($data){

				        // Token is there. Update the request and send it.
				        $postRequest.options.url = EnvironmentHelper.getFirebaseSettings().databaseURL
					        + $path + '.json?auth='
					        + $self._requestToken;
				        $postRequest.send();
			        }
		        });
	        }
        },

        /**
         * Makes a DELETE request to the Firebase Real Time database.
         *
         * @param $path
         * @param $callback
         *
         * @return execution of callback
         */

        firebaseDELETE($path, $callback){

	        const $self = this;

	        // Check for initialization errors.
	        if($self._initializationError){

		        return $callback({
				        message: 'FirebaseDatabaseClient.firebaseDELETE(): There is an initialization error'
			        },
			    null);
	        }

            const $deleteRequest = new Request({
                url: EnvironmentHelper.getFirebaseSettings().databaseURL
                + $path + '.json?auth='
                + $self._requestToken,
                method: 'DELETE',
                headers:{
                    'Content-Type':'application/json; charset=UTF-8'
                },
                emulation: false,
                urlEncoded: false,
                onSuccess: function($data){

                    return $callback(null, $data);
                },
                onFailure: function($xhr){

	                let $response = JSON.decode($xhr.response);

	                // Check if it says that the token has expired.
	                if($response.hasOwnProperty('error') && $response.error === 'Auth token is expired'){

		                // Ask for a fresh token.
		                $self.requestTokenRefresh(function ($error, $data) {

			                if($error){

				                console.error('FirebaseDatabaseClient.firebaseDELETE(): ');
				                console.error($error);
				                return $callback({
						                message: 'Problem while trying to request refresh token.'
					                },
					            null);
			                }

			                if($data){

				                // Token is there. Update the request and send it.
				                $deleteRequest.options.url = EnvironmentHelper.getFirebaseSettings().databaseURL
					                + $path + '.json?auth='
					                + $self._requestToken;
				                $deleteRequest.send();
			                }
		                });
	                }
	                else{

		                console.error('FirebaseDatabaseClient.firebaseDELETE(): ');
		                console.error($xhr);
		                return $callback({
				                message: 'Data for ' + $path + ' cannot be DELETE because an error!'
			                },
			            null);
	                }
                }
            });

	        // Check if the request is good to go.
	        if($self._requestToken){

		        $deleteRequest.send();
	        }
	        else{

		        // Ask for a fresh token.
		        $self.requestTokenRefresh(function ($error, $data) {

			        if($error){

				        console.error('FirebaseDatabaseClient.firebaseDELETE(): ');
				        console.error($error);
				        return $callback({
						        message: 'Problem while trying to request refresh token.'
					        },
					    null);
			        }

			        if($data){

				        // Token is there. Update the request and send it.
				        $deleteRequest.options.url = EnvironmentHelper.getFirebaseSettings().databaseURL
					        + $path + '.json?auth='
					        + $self._requestToken;
				        $deleteRequest.send();
			        }
		        });
	        }
        },

        /**
         * Using the Firebase API, performs a multi-location (bulk) update.
         *
         * The $locationUpdatePairs parameter should be an object with the following structure:
         *
         * {
         *      path : new data,
         *      path : new data
         * }
         *
         * @param $locationUpdatePairs
         * @param $callback
         *
         * @return execution of callback
         */

        firebasePerformMultiLocationUpdate($locationUpdatePairs, $callback){

	        const $self = this;

	        // Check for initialization errors.
	        if($self._initializationError){

		        return $callback({
				        message: 'FirebaseDatabaseClient.firebasePerformMultiLocationUpdate(): There is an initialization error'
			        },
			    null);
	        }

           firebase
               .database()
               .ref()
               .update($locationUpdatePairs, function ($error) {

					if($error){

						return $callback($error, null);
					}
					else{

						return $callback(null, true);
					}
               });
        }
    };

    return{

        init(){

            Logic.init();
        },

        firebaseGET($path, $extra, $callback){

            Logic.firebaseGET($path, $extra, $callback);
        },

        firebasePUT($path, $data, $callback){

            Logic.firebasePUT($path, $data, $callback);
        },

        firebasePOST($path, $data, $callback){

            Logic.firebasePOST($path, $data, $callback);
        },

        firebaseDELETE($path, $callback){

            Logic.firebaseDELETE($path, $callback);
        },

        firebasePerformMultiLocationUpdate($locationUpdatePairs, $callback){

            Logic.firebasePerformMultiLocationUpdate($locationUpdatePairs, $callback);
        }
    }
})();

document.addEvent('domready', function(){

    FirebaseDatabaseClient.init();
});