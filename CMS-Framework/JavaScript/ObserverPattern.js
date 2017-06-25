/**
 * @file ObserverPattern.js
 *
 * Implementation of Observer pattern with two classes:
 *  ObserverManager - used to manage the list of observers;
 *  Observer - the actual observer;
 *
 * @author Bilger Yahov <bayahov1@gmail.com>
 * @version 1.0.0
 * @copyright © 2017 Bilger Yahov, all rights reserved.
 */

class ObserverManager{

    /**
     * Construct the ObserverManager.
     *
     * @return void
     */

    constructor(){

        this.observers = [];
    }

    /**
     * Clear the list of observers.
     *
     * @return void
     */

    clearObservers(){

        this.observers = [];
    }

    /**
     * Add a new observer.
     *
     * @param $observer
     *
     * @return void
     */

    addObserver($observer){

        if($observer instanceof Observer){

            this.observers.push($observer);
        }
    }

    /**
     * Get a particular observer from the specified index.
     *
     * @param $index
     *
     * @return {*}
     */

    getObserverAt($index){

        if(this.observers[$index] !== undefined){

            return this.observers[$index];
        }

        return null;
    }

    /**
     * Get a specific observer based on name.
     *
     * @param $observer
     *
     * @return {null}
     */

    getObserver($observer){

        if($observer instanceof Observer === false){

            return null;
        }

        this.observers.forEach(function($item){

            if($item === $observer){

                return $item;
            }
        });

        return null;
    }

    /**
     * Remove a specific observer from that location.
     *
     * @param $index
     *
     * @return {boolean}
     */

    removeObserverAt($index){

        if(this.observers[$index]){

            this.observers.splice($index, 1);
            return true;
        }

        return false;
    }

    /**
     * Update all the observers for a specific event.
     *
     * @param $update
     *
     * @return void
     */

    updateObservers($update){

        this.observers.forEach(function($observer){

            $observer.getUpdate($update);
        });
    }
}

class Observer{

    /**
     * Does not have any particular function for the
     * current time being.
     *
     * @return void
     */

    constructor(){


    }

    /**
     * Receives the update from the ObserverManager
     * and what it does with it, depends on the
     * context where it is used.
     *
     * @param $update
     */

    getUpdate($update){


    }
}