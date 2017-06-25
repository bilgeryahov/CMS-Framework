/**
 * @file DevelopmentHelpers.js
 *
 * Class which exposes functionality to make the development process easier.
 *
 * @author Bilger Yahov <bayahov1@gmail.com>
 * @version 2.0.4
 * @copyright © 2016 - 2017 Bilger Yahov, all rights reserved.
 */

class DevelopmentHelpers {

    /**
     * Constructs a Database/Storage path, based on a given array
     * of child nodes.
     *
     * @param $nodes
     *
     * @return {string}
     */

    static constructPath($nodes){

        // Return value.
        let $path = '/';

        // Check if array.
        if(!$nodes[0]){

            console.error('DevelopmentHelpers.constructPath(): The passed parameter is not an array.');
            return $path;
        }

        // Add a slash after each child node.
        $nodes.forEach(function($childNode){

            $path += $childNode + '/';
        });

        return $path;
    }

    /**
     * Validates the passed input for correctness
     * based on its type.
     *
     * @param $input
     * @param $type
     *
     * @return {boolean}
     */

    static validateCorrectness($input, $type){

        if(!$input  || !$type){

            return false;
        }

        if($input.length === 0){

            return false;
        }

        let $correct = false;

        switch ($type){

            case 'email':
                let $atPos = $input.indexOf('@');
                let $dotPos = $input.indexOf('.');
                $correct = (
                    $input.length < 50 &&
                    $atPos > 0 &&
                    $dotPos > $atPos +2 &&
                    $dotPos + 2 < $input.length &&
                    !$input.includes(' ')
                );
                break;

            case 'phone':
                $correct = (
                    !isNaN($input) &&
                    $input.length < 50
                );
                break;

            case 'password':
                let $lower = new RegExp(/[a-z]{1,}/);
                let $upper = new RegExp(/[A-Z]{1,}/);
                let $numeric = new RegExp(/[0-9]{1,}/);
                let $special = new RegExp(/[!@#$&*]{1,}/);
                $correct = (
                    $lower.test($input) &&
                    $upper.test($input) &&
                    $numeric.test($input) &&
                    $special.test($input) &&
                    !$input.includes(' ') &&
                    $input.length < 50
                );
                break;

            case 'name':
                $correct = (
                    $input.length < 50
                );
                break;

            case 'subject':
                $correct = (
                    $input.length < 50
                );
                break;

            case 'text':
                $correct = (
                    $input.length < 600
                );
                break;

            default:
                $correct = false;
                break;
        }

        return $correct;
    }

    /**
     * Checks if a given value is an object.
     *
     * @param $value
     *
     * @return {boolean}
     */

    static isObject($value){

        return $value === Object($value) && Object.prototype.toString.call($value) !== '[object Array]';
    }

    /**
     * Indicates a button has been triggered or not.
     *
     * @param $buttonID
     * @param $isTriggered
     *
     * @return void
     */

    static setButtonTriggeredState($buttonID, $isTriggered){

        const $button = $($buttonID);
        if(!$button){

            console.error('DevelopmentHelpers.setButtonTriggeredState(): ' + $buttonID + ' ' +
                ' cannot be found on the DOM');
            return;
        }


        if($isTriggered){

            $button.disabled = true;
            return;
        }

        $button.disabled = false;
    }
}